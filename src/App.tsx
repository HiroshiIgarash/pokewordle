import './App.css'
import KanaTable from './components/KanaTable'
import TextInput from './components/TextInput';
import { usedKanaListContext } from './contexts/usedKanaContext';
import { MyIdContext } from './contexts/myIdContext';
import { themeContext } from './contexts/theme';
import { AnsweredPokemonContext } from './contexts/answerdPokemonContexts';
import { isMyTurnContext } from './contexts/isMyTurnContext';
import { useEffect, useRef, useState } from 'react';
import AnswerArea from './components/AnswerArea';
import pokemonsList from '@/pokemon.json';
import { client } from './lib/supabaseClient';
import { Button } from './components/ui/button';
import { Loader2 } from 'lucide-react';
import ThemeDisplay from './components/ThemeDisplay';
import pokemonLang from '@/pokemonLang.json'
import { ateThemeIndexContext } from './contexts/ateThemeIndexContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader } from './components/ui/dialog';
import TitleScreen from './components/TitleScreen';
import { v4 as uuid} from 'uuid'
import VS from './assets/vs.png'
import { RealtimeChannel } from '@supabase/supabase-js';
import { channelsContext } from './contexts/channelContexts';

function App() {
  const [myId, setMyId] = useState<string>('');
  const [usedKana, setUsedKana] = useState<string[]>([])
  const [answeredWords, setAnsweredWords] = useState<string[]>([])
  const [theme, setTheme] = useState<string>('')
  const { pokemons } = pokemonsList
  const [users, setUsers] = useState<{ name: string, id: string }[]>([]);
  const [isMyTurn, setIsMyTurn] = useState(true)
  const [ateThemeIndex, setAteThemeIndex] = useState<number[]>([])
  const [readyUsers, setReadyUsers] = useState<string[]>([])
  const [isSubscribing,setIsSubscribing] = useState(false);
  const [visitorsCount, setVisitorsCount] = useState(0);
  const [channels, setChannels] = useState<{[key:string]:RealtimeChannel}>({})

  const themeRef = useRef(theme);
  const themeImageRef = useRef('');

  useEffect(() => {
    const lobby = client.channel('lobby');

    lobby
      .on('presence',{event:'sync'},()=>{
        setVisitorsCount(Object.keys(lobby.presence.state).length)
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;

        await lobby.track({})

        setChannels((channels)=>{return {...channels,lobby}})

        console.log(client)
        console.log(lobby)
      })

      return () => {client.removeChannel(lobby)};
  },[])

  const subscribeInit = (name:string) => {
  
    setIsSubscribing(true);
  
    if (!name) {
      alert('１文字以上入力してください');
      setIsSubscribing(false);
      return;
    }

    const player = client.channel('pokewordle');
    setChannels(channels => {return{...channels,player}})


    player
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log(newPresences[0].name + 'が入室しました。', key, newPresences)
        setUsers(users => [...users,{ name:newPresences[0].name, id:newPresences[0].id}])
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log(leftPresences[0].name + 'が退室しました。', key, leftPresences)
        setUsers(users => users.filter(user => user.id !== leftPresences[0].id))
        setReadyUsers(users => users.filter(user => user !== leftPresences[0].id));
      })
      .on('broadcast', { event: 'input' }, (payload) => {
        setAnsweredWords(answeredWords => [...answeredWords, payload.answeredWord])
        setUsedKana(payload.newUsedKanaList)
        setIsMyTurn(true)
      })
      .on('broadcast', { event: 'themeReset' }, (payload) => {
        setTheme(payload.theme)
        setAnsweredWords([])
        setUsedKana([])
        setIsMyTurn(true)
        setAteThemeIndex([])
      })
      .on('broadcast', { event: 'ready' }, (payload) => {
        setReadyUsers(payload.newReadyUsers)
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;
        const id = uuid();
    
        await player.track({ name, id })
    
        setMyId(id);
        setIsSubscribing(false);
    })
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



  useEffect(() => {
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
  },[answeredWords, ateThemeIndex, theme])




  const handleThemeReset = () => {
    const selectNewTheme = () => {
      let newTheme = ''
      do {
        const newThemeIndex = Math.floor(Math.random() * pokemons.length)
        newTheme = pokemons[newThemeIndex]
      } while (newTheme === theme) 
      return newTheme;
    }
    const newTheme = selectNewTheme();
    setTheme(newTheme)
    setIsMyTurn(false)
    setAnsweredWords([])
    setUsedKana([])
    setAteThemeIndex([])
    channels.player.send({ type: 'broadcast', event: 'themeReset', theme: newTheme })
  }

  const handleReady = () => {
    setReadyUsers(readyUsers => {
      const newReadyUsers = [...readyUsers,myId];
      console.log("newReadyUsers",newReadyUsers)
      channels.player.send({ type: 'broadcast', event: 'ready',newReadyUsers})
      if(newReadyUsers.length === 2) {
        handleThemeReset();
      }
      return newReadyUsers
    })
  }



  useEffect(() => {
    if(theme !== '' && readyUsers.length < 2) {
      alert('対戦相手との接続が切れました');
      setTheme('')
      setReadyUsers([])
    }
  },[readyUsers.length, theme])

  const userIndex = (id = myId) => {
    return users.findIndex(user => user.id === id)
  }

  const [silhouettesNums, setSilhouettesNums] = useState<number[]>([]);


  if(!(silhouettesNums.length > 0)) {
    for (let index = 0; index < 6; index++) {
      setSilhouettesNums(silhouettesNums => [...silhouettesNums,Math.floor(Math.random() *493 + 1)])
    }
  }

  const silhouettes = [
    {num:silhouettesNums[0],style:{top: '0%',left:'10%'}},
    {num:silhouettesNums[1],style:{top: '50%',left:'0%'}},
    {num:silhouettesNums[2],style:{top: '0%',right:'30%'}},
    {num:silhouettesNums[3],style:{top: '50%',right:'10%'}},
    {num:silhouettesNums[4],style:{top: '50%',left:'35%'}},
    {num:silhouettesNums[5],style:{top: '0%',right:'0%'}}
  ]

  return (
    <>
    <channelsContext.Provider value={[channels,setChannels]} >
      <isMyTurnContext.Provider value={[isMyTurn, setIsMyTurn]}>
        <MyIdContext.Provider value={[myId, setMyId]}>
          <AnsweredPokemonContext.Provider value={[answeredWords, setAnsweredWords]}>
            <themeContext.Provider value={[theme, setTheme]}>
              <usedKanaListContext.Provider value={[usedKana, setUsedKana]}>
                <div className={`bg relative ${myId ? '-vs' : ''}`}>
                {
                  silhouettes.map((s,index) => (
                    <div className='absolute w-[50vh] silhouettes aspect-square mix-blend-multiply' style={{...s.style}} key={`${s.num}-${index}`}>
                      <img className='brightness-0 transition-opacity duration-1000 opacity-0 w-full'
                      style={{transitionDelay:`${200 + index*300}ms`}}
                      onLoad={(img) => {
                        const target = img.target;
                        if(target instanceof HTMLImageElement) {
                          target.classList.remove('opacity-0')
                        }
                      }} src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${s.num}.png`} alt="" />
                    </div>
                  ))
                }
                  <div className='max-w-[1366px] mx-auto relative'>
                    <div className='min-h-screen p-2 md:p-8 text-center font-rocknroll grid'>
                    {!myId && (
                      <TitleScreen subscribeInit={subscribeInit} isSubscribing={isSubscribing} visitorsCount={visitorsCount} />
                    )}
                    {myId && users.length < 2 && (
                      <div>
                        <div className='grid md:grid-cols-3 place-items-center mt-[22vh] mx-auto'>
                          <div className='place-self-center text-9xl font-rocknroll'>{users.find(user => user.id === myId)?.name}</div>
                          <img className='max-h-[50vh] max-w-auto' src={VS} alt="" />
                          <div><Loader2 className="h-[8rem] w-[8rem] animate-spin opacity-50" /></div>
                        </div>
                        <p className='mt-10'>対戦相手を探しています</p>
                      </div>
                    )}
                    {myId && users.length >=2 && theme === '' &&  userIndex() < 2 && (
                      <div>
                        <div className='grid md:grid-cols-3 place-items-center mt-[22vh] mx-auto'>
                          <div className='place-self-center text-9xl font-rocknroll'>{users.find(user => user.id === myId)?.name}</div>
                          <img className='max-h-[50vh] max-w-auto' src={VS} alt="" />
                          <div className='place-self-center text-9xl font-rocknroll'>{users.find(user => user.id !== myId)?.name}</div>
                        </div>
                        <p className='mt-10'>対戦相手が見つかりました！</p>
                        {readyUsers.includes(myId)?
                        <Button className='mt-10' disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />対戦相手の準備を待っています</Button>
                        :
                        <Button className='mt-10' onClick={handleReady} >準備完了！</Button>
                        }
                      </div>
                    )}
                    {myId && users.length >=2 &&  userIndex() >= 2 && (
                      <div>
                      {/* <PokemonCarousel /> */}
                      <div className='grid md:grid-cols-3 place-items-center mt-[22vh] mx-auto'>
                        <div className='place-self-center text-9xl font-quicksand'>{users.find(user => user.id === myId)?.name}</div>
                        <img className='max-h-[50vh] max-w-auto' src={VS} alt="" />
                        <div><Loader2 className="h-10 w-10 animate-spin opacity-50" /></div>
                      </div>
                      <p className='mt-10'>対戦中の人がいます。しばらくお待ちください。</p>
                    </div>
                    )}
                    {myId && users.length >= 2 && userIndex() < 2 && (
                    <>
                      {
                        theme !== '' && (
                          <>
                          <ateThemeIndexContext.Provider value={[ateThemeIndex, setAteThemeIndex]} >
                            <div key={theme}>
                            <KanaTable />
                            <TextInput />
                            <ThemeDisplay />
                            {answeredWords.includes(theme) ? (
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
                                <Button className='mt-8' onClick={handleThemeReset}>もう一度遊ぶ</Button>
                                </>
                            ):(
                              <div className='mt-8'>{isMyTurn ? 'あなたの番です' : '相手の番です'}</div>
                            )
                            }
                            <AnswerArea />
                            </div>
                          </ateThemeIndexContext.Provider>
                          </>
                        )
                      }
                    </>
                    )}
                    </div>
                  </div>
                </div>
              </usedKanaListContext.Provider>
            </themeContext.Provider>
          </AnsweredPokemonContext.Provider>
        </MyIdContext.Provider>
      </isMyTurnContext.Provider>
      </channelsContext.Provider>
    </>
  )
}

export default App