import './App.css'
import { MyIdContext } from './contexts/myIdContext';
import { themeContext } from './contexts/themeContext';
import { useEffect, useRef, useState } from 'react';
import pokemonsList from '@/pokemon.json';
import { client } from './lib/supabaseClient';
import TitleScreen from './components/TitleScreen';
import { v4 as uuid} from 'uuid'
import { RealtimeChannel } from '@supabase/supabase-js';
import { channelsContext } from './contexts/channelContexts';
import MatchingScreen from './components/MatchingScreen';
import RoomScreen from './components/RoomScreen';
import { User } from './types/types';

function App() {
  const [myId, setMyId] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');


  const [theme, setTheme] = useState<string>('')
  const { pokemons } = pokemonsList
  const [users, setUsers] = useState<User[]>([]);
  const [players, setPlayers] = useState<User[]>([]);



  const [isSubscribing,setIsSubscribing] = useState(false);
  const [visitorsCount, setVisitorsCount] = useState(0);
  const [channels, setChannels] = useState<{[key:string]:RealtimeChannel}>({})
  const avatarList = [25,133,96,282,908];
  const [avatar, setAvatar] = useState<{me: number,enemy:number}>({me: avatarList[0],enemy:avatarList[0]})
  const [
    rooms,
    //  setRooms
    ] = useState(new Set<string>())

  const myAvatarRef = useRef(avatar.me)
  myAvatarRef.current = avatar.me


  useEffect(() => {
    const lobby = client.channel('lobby');

    lobby
      .on('presence',{event:'sync'},()=>{
        setVisitorsCount(Object.keys(lobby.presence.state).length)
      })
      // .on('broadcast',{event:'created_room'},(payload) => {
      //   setRooms(rooms => {
      //     return rooms.add(payload.roomId)
      //   })
      // })
      // .on('broadcast',{event:'closed_room'},(payload) => {
      //   setRooms(rooms => {
      //     rooms.delete(payload.roomId)
      //     return rooms
      //   })
      // })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;

        setChannels((channels)=>{return {...channels,lobby}})

        await lobby.track({})

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
        setUsers(users => [...users,{ name:newPresences[0].name, id:newPresences[0].id, status:newPresences[0].status}])
        player.send({type:'broadcast',event:'select_avatar',avatar: myAvatarRef.current})
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log(leftPresences[0].name + 'が退室しました。', key, leftPresences)
        setUsers(users => users.filter(user => user.id !== leftPresences[0].id))

      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;
        const id = uuid();
        setMyId(id);
        setIsSubscribing(false);
    
        await player.track({ name, id })
        
    
    })
  }









  const handleThemeReset = async() => {
    console.log('theme', theme)
    let newTheme = ''
    do {
      const newThemeIndex = Math.floor(Math.random() * pokemons.length)
      newTheme = pokemons[newThemeIndex]
    } while (newTheme === theme) 
    console.log('newTheme',newTheme)
    await channels.room.send({ type: 'broadcast', event: 'themeReset', theme: newTheme })
    setTheme(newTheme)
  }







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
        <MyIdContext.Provider value={[myId, setMyId]}>
            <themeContext.Provider value={[theme, setTheme]}>
                <div className={`bg relative ${myId ? '-vs' : ''}`}>
                {
                  silhouettes.map((s,index) => (
                    <div className='hidden md:block absolute w-[50vh] silhouettes aspect-square mix-blend-multiply' style={{...s.style}} key={`${s.num}-${index}`}>
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
                    <div className='min-h-dvh p-2 md:p-8 text-center font-rocknroll grid'>
                    {!myId && (
                      <TitleScreen subscribeInit={subscribeInit} isSubscribing={isSubscribing} visitorsCount={visitorsCount} rooms={rooms} />
                    )}
                    {myId && (
                      <MatchingScreen
                        users={users}
                        setUsers={setUsers}
                        theme={theme}
                        userIndex={userIndex}
                        myId = {myId}
                        avatarList = {avatarList}
                        avatar = {avatar}
                        setAvatar = {setAvatar}
                        handleThemeReset = {handleThemeReset}
                        setRoomId={setRoomId}
                        setPlayers={setPlayers}
                      />
                    )}
                    <>
                      {
                        theme !== '' && 
                        <RoomScreen
                          key={theme}
                          avatar = {avatar}
                          handleThemeReset = {handleThemeReset}
                          myId = {myId}
                          roomId = {roomId}
                          players = {players}
                        />
                      }
                    </>
                  
                    </div>
                  </div>
                </div>

            </themeContext.Provider>

        </MyIdContext.Provider>
      </channelsContext.Provider>
    </>
  )
}

export default App
