import { useContext } from 'react'
import Answer from './Answer'
import { AnsweredPokemonContext } from '@/contexts/answerdPokemonContexts'

const AnswerArea = () => {
  const [answeredWords] = useContext(AnsweredPokemonContext)


  return (
    <div className='mt-8 grid grid-cols-2 md:grid-cols-3 grid-rows-9 md:grid-rows-6 justify-between justify-items-center gap-x-5 gap-y-0 md:gap-5 grid-flow-col md:min-h-[340px]'>
      {
        answeredWords.map((answer,index) =>{
          return <Answer answer={answer} key={index}  />
        })
      }
    </div>
  )
}

export default AnswerArea