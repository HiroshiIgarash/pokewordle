import { Loader2 } from "lucide-react"
import { Button } from "./ui/button"
import VS from '../assets/vs.png'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselApi } from "./ui/carousel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useContext, useEffect, useState } from "react";
import { channelsContext } from "@/contexts/channelContexts";

interface MatchingScreenProps {
  users:{
    name: string;
    id: string;
  }[]
  theme: string
  userIndex:(id?: string) => number
  readyUsers: string[]
  myId: string
  handleReady: () => void
  avatarList: number[]
  avatar: {me: number,enemy:number}
  setAvatar:React.Dispatch<React.SetStateAction<{
    me: number;
    enemy: number;
}>>
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

const MatchingScreen = ({users, theme, userIndex,readyUsers,myId,handleReady, avatar,setAvatar,avatarList}:MatchingScreenProps) => {
  const [api, setApi] = useState<CarouselApi>()
  const [channels] = useContext(channelsContext)
  
  useEffect(() => {
    
    if (!api) {
      return
    }

    const onSelect = () => {
      setAvatar(avatar => {return{...avatar,me:avatarList[api.selectedScrollSnap()]}})
      channels.player.send({type:'broadcast',event:'select_avatar',avatar: avatarList[api.selectedScrollSnap()]})
    }

    api.on("select", onSelect)

    return ()=> {api.off("select",onSelect)}
  }, [api, avatarList, channels.player, setAvatar])

  const status = users.length < 2 ? 'WAITING' : 
                  users.length >=2 && theme === '' &&  userIndex() < 2 ? 'MATCHING' :
                  users.length >=2 &&  userIndex() >= 2 ? 'OTHERS_PLAYING' : 'NULL'

  if(status === 'NULL') return null


  return (
    <div>
      <div className='grid md:grid-cols-3 place-items-center mt-[22vh] mx-auto'>
        <div className='place-self-center text-9xl font-rocknroll'>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>

              <Carousel opts={{loop:true}} className="w-[350px] mx-auto" setApi={setApi}>
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
        <img className='max-h-[50vh] max-w-auto' src={VS} alt="" />
        {
          status === 'MATCHING' ? 
          <div className='place-self-center text-9xl font-rocknroll'>
            <div className="w-[350px] mx-auto">
            <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${avatar.enemy}.png`} alt="" />
            </div>
            {users.find(user => user.id !== myId)?.name}
          </div>:
          <div><Loader2 className="h-[8rem] w-[8rem] animate-spin opacity-50" /></div>
        }
      </div>
      <p className='mt-10 text-4xl'>{
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