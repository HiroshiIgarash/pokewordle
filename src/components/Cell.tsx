import { cn } from '@/lib/utils'
import { CellStateType } from '@/types/types'

type CellProps = {
  text?: string
  state?: CellStateType
}

const Cell = ({text, state}: CellProps) => {
  if(!text) {
    return <div className='w-8 h-8 rounded-sm'></div>
  }

  return (
    <div 
      className={
        cn("grid place-items-center w-6 h-6 text-sm md:text-base md:w-8 md:h-8 rounded-sm border-2 border-current",
        state === 'used' ? 'bg-slate-500' :
        state === 'eat' ? 'bg-green-200' :
        state === 'bite' ? 'bg-amber-200' : 
        'bg-slate-50' 
    )}>{text}</div>
  )
}

export default Cell