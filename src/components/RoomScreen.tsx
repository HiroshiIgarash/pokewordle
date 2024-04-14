import { ateThemeIndexContext } from "@/contexts/ateThemeIndexContext";
import AnswerArea from "./AnswerArea";
import KanaTable from "./KanaTable";
import TextInput from "./TextInput";
import ThemeDisplay from "./ThemeDisplay";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader } from "./ui/dialog";
import { useContext, useEffect, useRef, useState } from "react";
import { client } from "@/lib/supabaseClient";
import pokemonLang from '@/pokemonLang.json'
import { AnsweredPokemonContext } from "@/contexts/answerdPokemonContexts";
import { isMyTurnContext } from "@/contexts/isMyTurnContext";
import { usedKanaListContext } from "@/contexts/usedKanaContext";
import { channelsContext } from "@/contexts/channelContexts";
import { Loader2 } from "lucide-react";
import { themeContext } from "@/contexts/themeContext";
import { cn } from "@/lib/utils";
import { User } from "@/types/types";

interface RoomScreenProps {
  avatar: {me: number,enemy:number}
  handleThemeReset: ()=>void
  myId: string
  roomId: string
  players:User[]
}

const RoomScreen = ({avatar,handleThemeReset,myId,roomId,players}:RoomScreenProps) => {

  const [ateThemeIndex, setAteThemeIndex] = useState<number[]>([])
  const [answeredWords, setAnsweredWords] = useState<string[]>([])
  const [usedKana, setUsedKana] = useState<string[]>([])
  const [isMyTurn, setIsMyTurn] = useState(false)
  const [theme,setTheme] = useContext(themeContext)
  const themeRef = useRef(theme);
  const themeImageRef = useRef('');
  const [channels,setChannels] = useContext(channelsContext)
  const [readyUsers ,setReadyUsers] = useState<string[]>([])

  const myPlayer = players.find(p => p.id === myId)
  const opponentPlayer = players.find(p => p.id !== myId)

  useEffect(() => {
    const random = Math.random();
    const room = client.channel('room-'+roomId,{config:{broadcast:{ack:true}}})
            .on('presence',{event:'join'},() => {
              // channels.lobby.send({type:'broadcast',event:'created_room',roomId})
            })
            .on('presence',{event:'leave'},() => {
              // channels.lobby.send({type:'broadcast',event:'closed_room',roomId})
              alert('対戦相手との通信が切断されました')
            })
            .on('broadcast', { event: 'input' }, (payload) => {
              setAnsweredWords(answeredWords => [...answeredWords, payload.answeredWord])
              setUsedKana(payload.newUsedKanaList)
              setIsMyTurn(true)
            })
            .on('broadcast', { event: 'set_first_turn' }, (payload) => {
              setIsMyTurn(!payload.isOpponentTurn)
            })
            .on('broadcast', { event: 'ready' }, (payload) => {
              setReadyUsers(payload.newReadyUsers)
            })
            .subscribe(async(state) => {
              if(state !== "SUBSCRIBED") return

              room.track({})

              await room.send({ type: 'broadcast',event: 'set_first_turn',isOpponentTurn: random > 0.5})
              setIsMyTurn(random > 0.5)
              setChannels(c=>{return{...c,room}})
            })
            .on('broadcast', { event: 'themeReset' }, (payload) => {
              setTheme(payload.theme)
            })

    return () => {
      client.removeChannel(room)
    }
  },[roomId, setChannels, setTheme])

  const checkState = (str:string,theme:string,index:number) => {
    if(!theme.includes(str)) return undefined;
    if(theme[index] === str) return 'eat'
    return 'bite'
  }
  
  answeredWords.forEach((answer) => {
    [...answer].forEach((str,index) => {
      const state = checkState(str,theme,index)
      if(state === 'eat' && !ateThemeIndex.includes(index)) {
        setAteThemeIndex(ateThemeIndex => [...ateThemeIndex,index])
      }
    });
  })

  const handleReady = () => {
    const newReadyUsers = [...readyUsers,myId];
    setReadyUsers(newReadyUsers)
    channels.room.send({ type: 'broadcast', event: 'ready',newReadyUsers})
    if(newReadyUsers.length === 2) {
      handleThemeReset();
    }
  }


  useEffect(() => {
    themeRef.current = theme;

    const toEnglish = (pokemon: string) => {
      return pokemonLang.find(p => p.ja === pokemon)?.en.toLowerCase();
    }

    const fetchPokemonImage = async(pokemon:string)=>{
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${toEnglish(pokemon)}`);
      const data = await res.json();
      const src:string = data.sprites.other['official-artwork'].front_default;
      return src
    }

    if(themeRef.current !== "") {
      fetchPokemonImage(themeRef.current)
      .then(src => {themeImageRef.current = src})
    }


  },[theme])

  return (
    <>
    <usedKanaListContext.Provider value={[usedKana, setUsedKana]}>
      <AnsweredPokemonContext.Provider value={[answeredWords, setAnsweredWords]}>
        <isMyTurnContext.Provider value={[isMyTurn, setIsMyTurn]}>
          <ateThemeIndexContext.Provider value={[ateThemeIndex, setAteThemeIndex]} >
            <div className="place-self-center">
              <div className='flex justify-between items-center'>
                <div>
                  <div className={cn("drop-shadow-lg overflow-hidden border-red-400 border-8 rounded-full bg-slate-50 m-3",!isMyTurn && "brightness-50")}>
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${avatar.me}.png`} alt="" />
                  </div>
                  <p>{myPlayer?.name}</p>
                </div>
                <div>
                  <KanaTable />
                  <TextInput />
                  <ThemeDisplay />
                </div>
                <div>
                  <div className={cn("drop-shadow-lg overflow-hidden border-blue-400 border-8 rounded-full bg-slate-50 m-3",isMyTurn && "brightness-50")}>
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${avatar.enemy}.png`} alt="" />
                  </div>
                  <p>{opponentPlayer?.name}</p>
                </div>
              </div>
            {(answeredWords.includes(theme) || answeredWords.length === 18) ? (
              <>
                <Dialog defaultOpen onOpenChange={()=>{setIsMyTurn(false)}}>
                  <DialogContent className='md:px-[4rem] md:max-w-lg max-w-[90vw] block'>
                    <DialogHeader className='max-w-full font-rocknroll'>
                      <DialogDescription asChild>
                        <>
                        <figure className='text-center'>
                          <img src={themeImageRef.current} onLoad={(img) => {
                            const target = img.target;
                            if(target instanceof HTMLImageElement) {
                              target.classList.remove('opacity-0')
                            }
                          }} className='w-[80%] inline transition-opacity opacity-0' width={300} height={300} alt="" />
                        </figure>
                        <p className='text-center text-3xl font-bold'>{theme}</p>
                        <p className='text-xl mt-4 flex justify-center text-left'>
                          {
                            !answeredWords.includes(theme) ? 'ざんねん！どちらも当てらなかった...' :
                            isMyTurn ?
                            'ざんねん！相手に当てられてしまいました' :
                            'おめでとう！あなたのかちです！'
                          }
                        </p>
                        </>

                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
                {readyUsers.includes(myId)?
                  <Button className='mt-10' disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />対戦相手の準備を待っています</Button>
                  :
                  <Button className='mt-8' onClick={handleReady}>もう一度遊ぶ</Button>
                }
                </>
            ):(
              <div className='mt-8'>{isMyTurn ? 'あなたの番です' : '相手の番です'}</div>
            )
            }
            <AnswerArea />
            </div>
          </ateThemeIndexContext.Provider>
        </isMyTurnContext.Provider>
      </AnsweredPokemonContext.Provider>
    </usedKanaListContext.Provider>
    </>
  )
}

export default RoomScreen