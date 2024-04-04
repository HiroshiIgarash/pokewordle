import { useContext } from 'react'
import Cell from './Cell';
import { themeContext } from '@/contexts/theme';
import PokemonIcon from './PokemonIcon';

type AnswerProps = {
  answer: string;
}

const Answer = ({answer}:AnswerProps) => {
  const [theme] = useContext(themeContext)

  const checkState = (str:string,theme:string,index:number) => {
    if(!theme.includes(str)) return undefined;
    if(theme[index] === str) return 'eat'
    return 'bite'
  }


  return (
    <div className='flex gap-1 items-center'>
      <PokemonIcon pokemon={answer} />
      {
        [...answer].map((str,index) => {
          const state = checkState(str,theme,index)
          return <Cell text={str} state={state} key={index} />
        })
      }
    </div>
  )
}

export default Answer