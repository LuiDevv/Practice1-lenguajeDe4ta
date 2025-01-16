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

const pokemonUrl = "https://pokeapi-proxy.freecodecamp.rocks/api/pokemon/";

const findStat = (stats, name) => {
  const foundStat = stats.find(stat => {
    return stat["stat"]["name"] === name;
  })
  return foundStat["base_stat"];
}


const searchPokemon = async (query, playerName, correspondingSprite, position, playerHP) => {
  let response;
  let pokemon;

  try {
    response = await fetch(`${url}/${query}`);
    pokemon = await response.json();
  } catch (err) {
    alert("Pokémon not found");
  }
  
  const { name, id, weight, height, stats, types, sprites } = pokemon;

  playerName.textContent = name.toUpperCase();
  // Posible values for sprite: 
  // ['back_default', 'back_female', 'back_shiny', 'back_shiny_female', 'front_default', 'front_female', 'front_shiny', 'front_shiny_female']
  correspondingSprite.src = sprites[position]
  correspondingSprite.style.visibility = 'visible';
  
  playerHP.textContent = findStat(stats, "hp");
}


searchButton.addEventListener("click" , () => searchPokemon(
  searchInput.value.toLowerCase(), pokemonName, sprite, "back_default", hp
));

searchButtonCPU.addEventListener("click" , () => searchPokemon(
  searchInputCPU.value.toLowerCase(), pokemonNameCPU, spriteCPU, "front_default", hpCPU
));