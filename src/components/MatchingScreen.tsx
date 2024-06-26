import { Loader2 } from "lucide-react"
import { Button } from "./ui/button"
import VS from '../assets/vs.png'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselApi } from "./ui/carousel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useContext, useEffect, useState } from "react";
import { channelsContext } from "@/contexts/channelContexts";
import { client } from "@/lib/supabaseClient";
import { themeContext } from "@/contexts/themeContext";
import { User } from "@/types/types";
interface MatchingScreenProps {
  users: User[]
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
  theme: string
  userIndex:(id?: string) => number
  myId: string
  avatarList: number[]
  avatar: {me: number,enemy:number}
  setAvatar:React.Dispatch<React.SetStateAction<{
    me: number;
    enemy: number;
  }>>
  handleThemeReset: () => void
  setRoomId:React.Dispatch<React.SetStateAction<string>>
  setPlayers:React.Dispatch<React.SetStateAction<User[]>>
}

const ReadyButton = ({readyUsers,myId,handleReady}:{
  readyUsers: string[]
  myId: string
  handleReady: () => void
}) => {
  return (
    <>
    {readyUsers.includes(myId)?
      <Button className='mt-10' disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />対戦相手の準備を待っています</Button>
      :
      <Button className='mt-10' onClick={handleReady} >準備完了！</Button>
    }
    </>
  )
}

const MatchingScreen = ({users, theme, userIndex,myId, avatar,setAvatar,avatarList,handleThemeReset,setRoomId,setPlayers}:MatchingScreenProps) => {
  const [api, setApi] = useState<CarouselApi>()
  const [channels,setChannels] = useContext(channelsContext)
  const [readyUsers, setReadyUsers] = useState<string[]>([])
  const [,setTheme] = useContext(themeContext)
  const [usersInRoom, setUsersInRoom] = useState<User[]>([])

  const handleReady = () => {
    const newReadyUsers = [...readyUsers,myId];
    setReadyUsers(newReadyUsers)
    channels.room.send({ type: 'broadcast', event: 'ready',newReadyUsers})
    if(newReadyUsers.length === 2) {
      handleThemeReset();
    }
  }

  // useEffect(() => {
  //   if(theme !== '' && readyUsers.length < 2) {
  //     alert('対戦相手との接続が切れました');
  //     setReadyUsers([])
  //   }
  // },[readyUsers.length, theme])
  
  useEffect(() => {
    
    if (!api) {
      return
    }

    const onSelect = () => {
      setAvatar(avatar => {return{...avatar,me:avatarList[api.selectedScrollSnap()]}})
      channels.room?.send({type:'broadcast',event:'select_avatar',avatar: avatarList[api.selectedScrollSnap()]})
    }

    api.on("select", onSelect)

    return ()=> {api.off("select",onSelect)}
  }, [api, avatarList, channels.player, channels.room, setAvatar])

  
  const status = readyUsers.length === 2 && theme !== '' ? 'NULL' :
                  users.length < 2 ? 'WAITING' : 
                  (users.length >=2 || usersInRoom.length >= 2) && theme === '' &&  userIndex() < 2 ? 'MATCHING' :
                  users.length >=2 &&  userIndex() >= 2 ? 'OTHERS_PLAYING' : 'NULL'

  useEffect(() => {
    if(status === 'MATCHING') {
      const user1 = users[0];
      const user2 = users[1];
      setUsersInRoom([user1, user2])
      const roomId = user1.id < user2.id ? user1.id+user2.id : user2.id+user1.id;
      setPlayers([user1,user2])
      setRoomId(roomId)
      const room = client.channel('room-'+roomId,{config:{broadcast:{ack:true}}})
      .on('presence',{event:'join'},()=>{
        room.send({type:'broadcast',event:'select_avatar',avatar: avatar.me})
        if(Object.keys(room.presence.state).length === 2) {
          client.removeChannel(channels.player)
          .then(()=>console.log('remove'))
        }
      })
      .on('presence',{event:'leave'},({leftPresences})=>{
        setReadyUsers(users => users.filter(user => user !== leftPresences[0].id));
        setUsersInRoom(users => users.filter(user => user !== leftPresences[0].id));
      })
      .on('broadcast',{ event: 'select_avatar'},(payload) => {
        setAvatar(avatar =>{return {...avatar, enemy: payload.avatar}})
      })
      .on('broadcast', { event: 'ready' }, (payload) => {
        setReadyUsers(payload.newReadyUsers)
      })
      .on('broadcast', { event: 'themeReset' }, (payload) => {
        setTheme(payload.theme)
      })
      .subscribe((state) => {
        if(state !== "SUBSCRIBED") return
        
        setChannels(c=>{return{...c,room}})
        room.track({})
      })
      
      return () => {
        client.removeChannel(room)
      }
    }
  },[avatar.me, channels.player, setAvatar, setChannels, setRoomId, setTheme, status, users])

  if(status === 'NULL') return null


  return (
    <div>
      <div className='grid md:grid-cols-3 place-items-center md:mt-[22vh] mx-auto'>
        <div className='place-self-center text-2xl md:text-7xl font-rocknroll'>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>

              <Carousel opts={{loop:true}} className="w-[40vw] md:w-[350px] mx-auto" setApi={setApi}>
                <CarouselContent>
                  {avatarList.map(avatar => (
                    <CarouselItem key={avatar}><img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${avatar}.png`} alt="" /></CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>


            </TooltipTrigger>
            <TooltipContent>
              <p>あなたのキャラクターを選択してください</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
          {users.find(user => user.id === myId)?.name}
          </div>
        <img className='max-h-[10vh] md:max-h-[50vh] max-w-auto my-5 md:my-0' src={VS} alt="" />
        {
          status === 'MATCHING' ? 
          <div className='place-self-center text-2xl md:text-7xl font-rocknroll'>
            <div className="w-[40vw] md:w-[350px] mx-auto">
            <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${avatar.enemy}.png`} alt="" />
            </div>
            {users.find(user => user.id !== myId)?.name}
          </div>:
          <div><Loader2 className="md:h-[8rem] md:w-[8rem] h-[6rem] w-[6rem] animate-spin opacity-50" /></div>
        }
      </div>
      <p className='mt-10 text-xl md:text-4xl'>{
        status === 'WAITING' ? '対戦相手を探しています' :
        status === 'MATCHING'  ? '対戦相手が見つかりました！' : 
        status === 'OTHERS_PLAYING' && '対戦中の人がいます。しばらくお待ちください。'
      }
      </p>
      {
        status === 'MATCHING' && (
          <ReadyButton readyUsers={readyUsers} myId={myId} handleReady={handleReady} />
        )
      }
    </div>
  )
}

export default MatchingScreen