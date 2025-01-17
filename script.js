// Pokemons
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

// Action buttons
const attackButton = document.getElementById("attack-button");
const healButton = document.getElementById("heal-button");
const runButton = document.getElementById("run-button");

const hitAnimationDuration = 2500;

// Game terminal
const gameTerminal = document.getElementById("game-terminal");

// Players
let player1 = { pokemon: null };
let cpu = { pokemon: null };

const pokemonUrl = "https://pokeapi.co/api/v2/pokemon";

class Pokemon {
  constructor(name, id, weight, height, stats, types, hpElement, spriteElement) {
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
  }

  calculateDamage(attack, defense, multiplier = 1) {
    const baseDamage = Math.floor(Math.random() * attack) + 1;
    const adjustedDefense = Math.max(0, defense - attack * 0.2); 
    const reducedDamage = Math.max(1, Math.floor(baseDamage * multiplier - adjustedDefense));
    return reducedDamage;
  }

  static findStat(stats, name) {
    const foundStat = stats.find((stat) => stat["stat"]["name"] === name);
    return foundStat["base_stat"];
  }

  static async searchPokemon(query, playerName, spriteElement, position, playerHP, player) {
    let response;

    try {
      response = await fetch(`${pokemonUrl}/${query}`);
    } catch (err) {
      showMessage("Pokémon no encontrado");
      console.log(err);
      return;
    }

    const pokemon = await response.json();
    const { name, id, weight, height, stats, types, sprites } = pokemon;
    player.pokemon = new Pokemon(name, id, weight, height, stats, types, playerHP, spriteElement);

    playerName.textContent = name.toUpperCase();
    spriteElement.src = sprites[position];
    spriteElement.style.visibility = "visible";
    playerHP.textContent = `${player.pokemon.hp}/${player.pokemon.maxHP}`;
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

  performAttack(defender) {
    const damage = this.calculateDamage(this.attack, defender.defense);
    defender.hp -= damage;

    // Attack animation
    defender.spriteElement.classList.add('receive-attack');
    setTimeout(() => defender.spriteElement.classList.remove('receive-attack'), hitAnimationDuration);

    if (defender.hp < 0) defender.hp = 0;

    defender.hpElement.textContent = `${defender.hp}/${defender.maxHP}`;

    showMessage(`${this.name} ha atacado a ${defender.name} causando ${damage} de daño.`);

    if (defender.hp <= 20) {
      defender.startBlinking();
    }

    if (defender.hp === 0) {
      alert(`${defender.name} ha sido derrotado.`);
      defender.stopBlinking();
      location.reload();
    }
  }

  heal() {
    const healAmount = Math.floor(this.hp / 5);
    this.hp += healAmount;
    if (this.hp > 100) {
      this.hp = 100;
    }
    this.hpElement.textContent = this.hp;

    showMessage(`${this.name} se ha curado ${healAmount} puntos de vida.`);

    if (this.hp > 20) {
      this.stopBlinking();
    }
  }
}

const showMessage = (message) => {
  gameTerminal.innerHTML = `<p>${message.toUpperCase()}</p>`;
}

// Event listeners
searchButton.addEventListener("click", () =>
  Pokemon.searchPokemon(searchInput.value.toLowerCase(), pokemonName, sprite, "back_default", hp, player1)
);

searchButtonCPU.addEventListener("click", () =>
  Pokemon.searchPokemon(searchInputCPU.value.toLowerCase(), pokemonNameCPU, spriteCPU, "front_default", hpCPU, cpu)
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

const run = () => {
  showMessage("Has huido del combate. ¡Juego terminado!");
  location.reload();
};

runButton.addEventListener("click", () => run());
