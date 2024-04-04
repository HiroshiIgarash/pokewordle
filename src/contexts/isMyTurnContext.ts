import { Dispatch, createContext } from "react";

const defaultValue:[boolean, Dispatch<React.SetStateAction<boolean>>] = [true,() => {}]

export const isMyTurnContext = createContext(defaultValue)