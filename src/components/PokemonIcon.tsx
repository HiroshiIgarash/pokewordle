import { useEffect, useState } from 'react'

import pokemonLang from '@/pokemonLang.json';

type PokemonIconProps = {
  pokemon: string;
}

const PokemonIcon = ({pokemon}: PokemonIconProps) => {

  const [iconSrc, setIconSrc] = useState('');
  const toEnglish = (pokemon: string) => {
    return pokemonLang.find(p => p.ja === pokemon)?.en.toLowerCase();
  }
  useEffect(() => {
    const fetchPokemonImage = async(pokemon:string)=>{
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${toEnglish(pokemon)}`);
      const data = await res.json();
      const src:string = data.sprites.front_default;
      return src
    }

    fetchPokemonImage(pokemon)
    .then(src => setIconSrc(src))
  },[pokemon])



  return (
    <div className='w-10 h-10'>
      <img src={iconSrc} alt="" />
    </div>
  )
}

export default PokemonIcon