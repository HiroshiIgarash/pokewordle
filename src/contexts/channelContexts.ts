import { RealtimeChannel } from "@supabase/supabase-js"
import { Dispatch, createContext } from "react"

const defaultValue: [{[key:string]:RealtimeChannel}, Dispatch<React.SetStateAction<{[key:string]:RealtimeChannel}>>] = [{},() => {}]

export const channelsContext = createContext(defaultValue)