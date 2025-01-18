// Pokémones
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const searchInputCPU = document.getElementById("search-input-cpu");
const searchButtonCPU = document.getElementById("search-button-cpu");
const pokemonName = document.getElementById("pokemon-name");
const pokemonNameCPU = document.getElementById("pokemon-name-cpu");
const sprite = document.getElementById("sprite");
const spriteCPU = document.getElementById("sprite-cpu");
const hp = document.getElementById("hp");
const hpCPU = document.getElementById("hp-cpu");
const hpBar = document.getElementById("hp-bar");
const hpBarCPU = document.getElementById("hp-bar-cpu");

// Botones de acciones
const attackButton = document.getElementById("attack-button");
const healButton = document.getElementById("heal-button");
const runButton = document.getElementById("run-button");

// Constantes
const hitAnimationDuration = 2500;
const startBlinkingHP = 20;

// Terminal del juego
const gameTerminal = document.getElementById("game-terminal");

// Jugadores
let player1 = { pokemon: null };
let cpu = { pokemon: null };

const pokemonUrl = "https://pokeapi.co/api/v2/pokemon";

class Pokemon {
  constructor(name, id, weight, height, stats, types, hpElement, spriteElement, hpBar) {
    this.name = name;
    this.id = id;
    this.weight = weight;
    this.height = height;
    this.attack = Pokemon.findStat(stats, "attack");
    this.maxHP = Pokemon.findStat(stats, "hp");
    this.hp = this.maxHP;
    this.types = types;
    this.hpElement = hpElement;
    this.spriteElement = spriteElement;
    this.blinkInterval = null; // Controla el parpadeo
    this.defense = Pokemon.findStat(stats, "defense");
    this.hpBar = hpBar;
  }

  calculateDamage(attack, defense) {
    // Restarle la defensa del defensor al ataque
    const damage = attack - defense;
    const effectiveDamage = damage > 0 ? damage : 1; // Al menos 1 de daño

    return effectiveDamage;
  }

  static findStat(stats, name) {
    // La key stats que retorna la API es una lista de objetos, por ende
    // hay que loopear dentro de la lista para buscar el stat deseado
    // esta función abstrae esa necesidad
    const foundStat = stats.find((stat) => stat["stat"]["name"] === name);

    return foundStat["base_stat"];
  }

  heal() {
    // Calcular vida a curar (hp / 5)
    const healAmount = Math.floor(this.hp / 5);
    this.hp += healAmount;  // Actualizar la vida
    if (this.hp > this.maxHP) {
      // Evitar tener más vida que el máximo
      this.hp = this.maxHP;
    }
    // Actualizar en el DOM la vida
    this.hpElement.textContent = `${this.hp}/${this.maxHP}`;

    // Mostrar en la terminal lo sucedido
    showMessage(`<b>${this.name}</b> se ha curado <b>${healAmount}</b> puntos de vida.`);

    // Si el pokémon está lo suficientemente sano ya, dejar de parpadear
    if (this.hp > startBlinkingHP) {
      this.stopBlinking();
    }
  }

  performAttack(defender) {
    // Calcular daño que realiza el ataque al defensor
    const damage = this.calculateDamage(this.attack, defender.defense);
    defender.hp -= damage;  // Actualizar la vida del defensor
    defender.updateBar();

    // Comenzar animación del ataque al añadir la clase con el keyframes
    // de la animación al defensor, y luego de una duración quitarsela.
    defender.spriteElement.classList.add('receive-attack');
    setTimeout(() => {
      defender.spriteElement.classList.remove('receive-attack')
    }, hitAnimationDuration);

    if (defender.hp < 0) defender.hp = 0; // Evitar una vida menor a 0

    // Actualizar en el DOM la vida del defensor
    defender.hpElement.textContent = `${defender.hp}/${defender.maxHP}`;

    // Mostrar en la terminal un mensaje que indique lo sucedido
    showMessage(`<b>${this.name}</b> ha atacado a <b>${defender.name}</b> causando <b>${damage}</b> de daño.`);

    // Si la vida es 0 el juego ya acabó
    if (defender.hp === 0) {
      setTimeout(() => {
        alert(`${defender.name} ha sido derrotado.`);
        defender.stopBlinking();
        location.reload();
      }, hitAnimationDuration);
    }

    // Si el defensor tiene menos de 20 de vida, reproducir animación que representa
    // a un pokémon estando bajo en vida (parpadeando)
    if (defender.hp <= startBlinkingHP) {
      defender.startBlinking();
    }
  }

  static run() {
    showMessage("Has huido del combate. ¡Juego terminado!");
    location.reload();
  };

  static async searchPokemon(query, playerName, spriteElement, position, playerHP, player, hpBar) {
    // Fetchear pokémon por su nombre
    let error = false;
    const response = await fetch(`${pokemonUrl}/${query}`).catch((err) => {
      // Informar en caso de error, ej: 404 o error de red
      error = true;
      alert("Ha ocurrido un error");
    });
    if (error) { return }

    if (!response.ok) {
      // Si no se encuentra el pokémon avisar
      alert(`Pokémon "${query}" no encontrado`)
    }

    // Obtener pokémon
    const pokemon = await response.json();
    // Descontruir el JSON para obtener el nombre, id, peso, altura...  
    const { name, id, weight, height, stats, types, sprites } = pokemon;
    
    // Actualizar el pokémon del jugador a una nueva instacion de Pokemon
    player.pokemon = new Pokemon(
      name, 
      id, 
      weight, 
      height, 
      stats, 
      types, 
      playerHP, 
      spriteElement,
      hpBar
    );

    console.log(hpBar);
    // Actualizar en el DOM el nombre del pokémon en la tarjeta del jugador correspondido
    playerName.textContent = name.toUpperCase();
    spriteElement.src = sprites[position];  // Agregar la foto en la posición especificada
    spriteElement.style.visibility = "visible"; // Hacer visible la foto
    playerHP.textContent = `${player.pokemon.hp}/${player.pokemon.maxHP}`;  // Poner en el DOM la vida del pokémon
  }

  updateBar() {
    this.hpBar.style.width = `${(this.hp * 100) / (this.maxHP)}%`
  }

  startBlinking() {
    if (this.blinkInterval) return;
    this.blinkInterval = setInterval(() => {
      this.spriteElement.style.visibility =
        this.spriteElement.style.visibility === "hidden" ? "visible" : "hidden";
    }, 500);
  }

  stopBlinking() {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
      this.blinkInterval = null;
      this.spriteElement.style.visibility = "visible";
    }
  }
}

const showMessage = (message) => {
  gameTerminal.innerHTML = `<p>${message.toUpperCase()}</p>`;
}

// Event listeners
searchButton.addEventListener("click", () =>
  Pokemon.searchPokemon(
    searchInput.value.toLowerCase(), 
    pokemonName, 
    sprite, 
    "back_default", 
    hp, 
    player1,
    hpBar
  )
);

searchButtonCPU.addEventListener("click", () =>
  Pokemon.searchPokemon(
    searchInputCPU.value.toLowerCase(), 
    pokemonNameCPU, 
    spriteCPU, 
    "front_default", 
    hpCPU, 
    cpu,
    hpBarCPU
  )
);

attackButton.addEventListener("click", () => {
  if (!player1.pokemon || !cpu.pokemon) {
    showMessage("Primero selecciona tus Pokémon.");
    return;
  }

  player1.pokemon.performAttack(cpu.pokemon, hpCPU);

  if (cpu.pokemon.hp > 0) {
    setTimeout(() => {
      cpu.pokemon.performAttack(player1.pokemon, hp);
    }, hitAnimationDuration);
  }
});

healButton.addEventListener("click", () => {
  if (!player1.pokemon || !cpu.pokemon) {
    showMessage("Primero selecciona tus Pokémon.");
    return;
  }

  player1.pokemon.heal(hp);

  if (cpu.pokemon.hp > 0) {
    setTimeout(() => {
      cpu.pokemon.performAttack(player1.pokemon, hp);
    }, 1000);
  }
});

runButton.addEventListener("click", () => Pokemon.run());
