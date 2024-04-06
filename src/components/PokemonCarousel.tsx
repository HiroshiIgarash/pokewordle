import { useEffect, useState } from 'react'
import pokemonList from '@/pokemon.json'
import pokemonLang from '@/pokemonLang.json'

const PokemonCarousel = () => {

  const [pokemon, setPokemon] = useState('')
  const [pokemonImg,setPokemonImg] = useState('')
  const toEnglish = (pokemon: string) => {
    return pokemonLang.find(p => p.ja === pokemon)?.en.toLowerCase();
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const pokemonIndex = Math.floor(Math.random() * pokemonList.pokemons.length)
      const pokemon = pokemonList.pokemons[pokemonIndex]
      
      const fetchPokemonImage = async(pokemon:string)=>{
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${toEnglish(pokemon)}`);
        const data = await res.json();
        const src:string = data.sprites.other['official-artwork'].front_default;
        return src
      }
      
      fetchPokemonImage(pokemon)
      .then(src => setPokemonImg(src))
      .then(()=>setPokemon(pokemon))

    }, 8000)
    

    return () => clearInterval(timer)
  },[])





  return (
    <>
    <img src={pokemonImg} className='' alt="" />
    <p>{pokemon}</p>
    </>
  )
}

export default PokemonCarousel