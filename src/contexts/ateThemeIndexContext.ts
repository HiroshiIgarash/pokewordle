import { Dispatch, createContext } from "react"

const defaultValue: [number[], Dispatch<React.SetStateAction<number[]>>] = [[],() => {}]

export const ateThemeIndexContext = createContext(defaultValue)