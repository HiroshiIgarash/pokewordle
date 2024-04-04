import { Dispatch, createContext } from "react";

const defaultValue:[string[], Dispatch<React.SetStateAction<string[]>>] = [[],() => {}]

export const usedKanaListContext = createContext(defaultValue)