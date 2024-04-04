import { Dispatch, createContext } from "react";

const defaultValue:[string[], Dispatch<React.SetStateAction<string[]>>] = [[],() => {}]

export const AnsweredPokemonContext = createContext(defaultValue)