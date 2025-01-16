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
const attack = document.getElementById("attack");
const defense = document.getElementById("defense");
const specialAttack = document.getElementById("special-attack");
const specialDefense = document.getElementById("special-defense");
const speed = document.getElementById("speed");

const pokemonUrl = "https://pokeapi-proxy.freecodecamp.rocks/api/pokemon/{name-or-id}"

class Pokemon {
  constructor(name, id, weight, height, stats, types, spriteUrl) {
    this.name = name;
    this.id = id;
    this.weight = weight;
    this.height = height;
    this.stats = {
      hp: this.findStat(stats, "hp"),
      attack: this.findStat(stats, "attack"),
      defense: this.findStat(stats, "defense"),
      specialAttack: this.findStat(stats, "special-attack"),
      specialDefense: this.findStat(stats, "special-defense"),
      speed: this.findStat(stats, "speed"),
    };
    this.types = types.map(type => type.type.name); 
    this.spriteUrl = spriteUrl; 
  }

  findStat(stats, statName) {
    const foundStat = stats.find(stat => stat["stat"]["name"] === statName);
    return foundStat ? foundStat["base_stat"] : 0;
  }
}

const findStat = (stats, name) => {
  const foundStat = stats.find(stat => {
    return stat["stat"]["name"] === name;
  })
  return foundStat["base_stat"];
}

const searchPokemon = async (query, playerName, correspondingSprite, position, playerHP, isPlayer1 = true) => {
  const input = query;
  const url = pokemonUrl.replace(/{name-or-id}/, input)

  let response;
  let pokemon;

  try {
    response = await fetch(url);
    pokemon = await response.json();
  } catch (err) {
    alert("Pokémon not found");
    return;
  }
  
  const { name, id, weight, height, stats, types, sprites } = pokemon;
  const newPokemon = new Pokemon(name, id, weight, height, stats, types, sprites[position]);

  playerName.textContent = name.toUpperCase();
  correspondingSprite.src = sprites[position];
  correspondingSprite.style.visibility = 'visible';
  playerHP.textContent = findStat(stats, "hp");

  if (isPlayer1) {
    player1Pokemon = newPokemon;
  } else {
    cpuPokemon = newPokemon;
  }
}

searchButton.addEventListener("click" , () => searchPokemon(
  searchInput.value.toLowerCase(), pokemonName, sprite, "back_default", hp, true
));
searchButtonCPU.addEventListener("click" , () => searchPokemon(
  searchInputCPU.value.toLowerCase(), pokemonNameCPU, spriteCPU, "front_default", hpCPU, false
));

const attackButton = document.getElementById("attack-button");
const healButton = document.getElementById("heal-button");
const runButton = document.getElementById("run-button");

let player1Pokemon = null;
let cpuPokemon = null;

const performAttack = (attacker, defender, defenderHPElement) => {
  const damage = Math.floor(Math.random() * attacker.stats.attack) + 1;
  defender.stats.hp -= damage;
  if (defender.stats.hp < 0) defender.stats.hp = 0;

  defenderHPElement.textContent = defender.stats.hp;

  if (defender.stats.hp === 0) {
    alert(`${defender.name} ha sido derrotado.`);
  }
};

const heal = (player, playerHPElement) => {
  const healAmount = Math.floor(player.stats.hp / 5);
  player.stats.hp += healAmount;
  if (player.stats.hp > 100) player.stats.hp = 100;
  playerHPElement.textContent = player.stats.hp;
};

const run = () => {
  alert("Has huido del combate. ¡Juego terminado!");
  location.reload(); 
};

attackButton.addEventListener("click", () => {
  if (player1Pokemon && cpuPokemon) {
    performAttack(player1Pokemon, cpuPokemon, hpCPU);

    if (cpuPokemon.stats.hp > 0) {
      setTimeout(() => performAttack(cpuPokemon, player1Pokemon, hp), 1000);
    }
  } else {
    alert("Primero selecciona tus Pokémon.");
  }
});

healButton.addEventListener("click", () => {
  if (player1Pokemon) {
    heal(player1Pokemon, hp);
  } else {
    alert("Primero selecciona tu Pokémon.");
  }
});

runButton.addEventListener("click", () => run());
