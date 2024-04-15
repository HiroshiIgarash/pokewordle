import React, { useContext, useRef } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { usedKanaListContext } from '@/contexts/usedKanaContext'
import { AnsweredPokemonContext } from '@/contexts/answerdPokemonContexts'
import pokemonsList from '@/pokemon.json';
import { isMyTurnContext } from '@/contexts/isMyTurnContext'
import { channelsContext } from '@/contexts/channelContexts'

const TextInput = () => {
  const inputElement = useRef<HTMLInputElement>(null)
  const [usedKanaList,setUsedKanaList] = useContext(usedKanaListContext)
  const [answeredWords, setAnsweredWords] = useContext(AnsweredPokemonContext)
  const [isMyTurn,setIsMyTurn] = useContext(isMyTurnContext)
  const [channels] = useContext(channelsContext)

  const handleSubmit = async(e:React.FormEvent) => {
    e.preventDefault();

    const inputValue = inputElement.current?.value;
    if(!inputValue) return;
    if(inputValue.length !== 5) {
      alert('5文字で指定してください');
      return;
    }
    if(!pokemonsList.pokemons.includes(inputValue)) {
      alert('ダイヤモンド・パールまでに登場するポケモンを入力してください')
      return;
    }
  

    setUsedKanaList(newUsedKanaList(inputValue));

    setAnsweredWords([...answeredWords, inputValue])

    channels.room.send(
      {
        type: 'broadcast',
        event: 'input',
        answeredWord: inputValue,
        newUsedKanaList: newUsedKanaList(inputValue)
      }
    )

    setIsMyTurn(false);
    inputElement.current.value = '';

  }
  
  const newUsedKanaList = (str: string) => {
    const newUsedKanaList = [...usedKanaList];

    [...str].forEach(item => {
      if(newUsedKanaList.includes(item)) return;
      newUsedKanaList.push(item)
    })

    return newUsedKanaList;
  }

  return (
    <form className='flex w-fit mx-auto gap-4 mt-8' onSubmit={handleSubmit}>
      <Input className='text-lg md:text-base' name='inputtext' ref={inputElement} disabled={!isMyTurn} />  
      <Button disabled={!isMyTurn}>送信</Button>
    </form>
  )
}

export default TextInput