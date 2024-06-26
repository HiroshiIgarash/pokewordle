import { Loader2 } from 'lucide-react'
import HowTo from './HowTo'
import Title from '@/assets/title.png'
import { Button } from './ui/button'
import { Input } from './ui/input'
import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { IoLogoGithub } from 'react-icons/io5'

interface TitleScreenProps {
  subscribeInit: (name:string)=>void,
  isSubscribing: boolean,
  visitorsCount: number
  rooms:Set<string>
}

const TitleScreen = ({subscribeInit,isSubscribing,visitorsCount}:TitleScreenProps) => {
  const [name, setName] = useState('');

  const handleChange = (e:React.ChangeEvent) => {
    const input = e.target
    if(input instanceof HTMLInputElement) {
      setName(input.value);
    }
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
  
    subscribeInit(name);
  }

  return (
      <div className='relative grid place-items-center h-full overflow-hidden md:grid-flow-col pt-[100px] md:pt-0 gap-y-16 md:gap-0'>

        <a className="absolute right-2 top-2 block transition-opacity hover:opacity-70 cursor-pointer" href='https://github.com/HiroshiIgarash/pokewordle' target='_blank'>
          <IoLogoGithub className=' bg-white rounded-full' size="3em" />
        </a>


        <div>
          {/* <h1 className='md:text-9xl font-quicksand font-bold animate-slide-in-bck-bottom text-6xl'>POKEMON<br></br>Wordle</h1> */}
          <h1>
            <img src={Title} className='w-auto h-auto md:max-h-[45vh] animate-slide-in-bck-bottom' alt="" />
          </h1>
          <form className="flex w-fit mx-auto gap-4 mt-14 animate-slide-in-bck-bottom delay-1000" onSubmit={handleSubscribe}>
            <Input className='text-base' onChange={handleChange} value={name} placeholder='名前を入力してください' maxLength={5} />
            {
              isSubscribing ?
            <Button disabled >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              参加中...
              </Button>:
            <Button>参加する</Button>
            }
          </form>
          <div className='animate-slide-in-bck-bottom delay-1000'>
            <HowTo />
          </div>
        </div>

        <div className='z-10 grid grid-flow-row gap-10'>
          <Card className="w-[350px] shadow-lg">
            <CardHeader>
              <CardTitle>Watching</CardTitle>
            </CardHeader>
            <CardContent>
              現在、<span className='text-red-600'>{visitorsCount}</span>人が見ています
            </CardContent>
          </Card>
          <Card className="w-[350px] shadow-lg">
            <CardHeader>
            <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className='text-left'>
              このゲームは開発途中ですが、オンラインでゲームを楽しむことはできます。<br />
              <hr className='my-2' />
              実装予定の機能<br />
              - ルーム機能<br />
              - ソロプレイ機能<br />
              - チャット機能<br />
              - あそびかたの画像追加<br />
            </CardContent>
          </Card>
        </div>

      </div>

    )
    
}

export default TitleScreen
