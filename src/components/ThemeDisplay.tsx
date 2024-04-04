import { ateThemeIndexContext } from '@/contexts/ateThemeIndexContext'
import { themeContext } from '@/contexts/theme'
import { useContext } from 'react'
import Cell from './Cell'

const ThemeDisplay = () => {
  const [theme] = useContext(themeContext)
  const [ateThemeIndex] = useContext(ateThemeIndexContext)

  return (
    <div className='flex gap-1 items-center w-fit mx-auto mt-8 px-10 py-4 border border-black bg-white'>
      {
        [...theme].map((str, index) => {
          const state = ateThemeIndex.includes(index) ? 'eat':undefined

          return <Cell text={state?str:' '} state={state} key={index} />
        })
      }
    </div>
  )
}

export default ThemeDisplay