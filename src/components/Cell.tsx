import { cellStateType } from '@/types/types'

type CellProps = {
  text?: string
  state?: cellStateType
}

const Cell = ({text, state}: CellProps) => {
  if(!text) {
    return <div className='w-8 h-8 rounded-sm'></div>
  }

  // const stateClass = state === 'used' ? 'bg-slate-300':''
  let stateClass = '';
  switch (state) {
    case 'used':
      stateClass = 'bg-slate-500' 
      break;
    case 'eat':
      stateClass = 'bg-green-200' 
      break;
    case 'bite':
      stateClass = 'bg-amber-200' 
      break;
    default:
      stateClass = 'bg-slate-50' 
      break;
  }
  return (
    <div className={`grid place-items-center w-8 h-8 rounded-sm border-2 border-current bg- ${stateClass}`}>{text}</div>
  )
}

export default Cell