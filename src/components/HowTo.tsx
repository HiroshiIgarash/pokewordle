
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from './ui/carousel'
import { Button } from './ui/button'
import pokemonList from '@/pokemon.json'
import howto01 from '@/assets/howto_01.png'

const HowTo = () => {
  return (
    <div>
      <Dialog>
        <DialogTrigger className='mt-8' asChild>
          <Button variant={'outline'} className='text-3xl p-8'>あそびかた</Button>
        </DialogTrigger>
        <DialogContent className='md:px-[4rem] md:max-w-lg max-w-[90vw] block'>
          <DialogHeader className='max-w-full font-rocknroll'>
            <DialogTitle className='text-center text-2xl'>POKEMON Wordleの<br className='md:hidden'></br>あそびかた</DialogTitle>
            <DialogDescription asChild>

              <Carousel>
                <CarouselContent className='max-h-[50vh]'>
                  <CarouselItem>
                    <div className='aspect-video bg-gray-500 w-full mb-8 mx-auto max-w-[380px]'></div>
                    POKEMON Wordle は 2人のプレイヤーに共通で与えられたお題を当てるゲームです。<br></br>
                    お題は「ダイヤモンド・パール」までに登場する5文字のポケモンです。
                  </CarouselItem>
                  <CarouselItem>
                    <img className='aspect-video w-full mb-8 mx-auto max-w-[380px]' src={howto01} alt="" />
                    ゲームが始まったら、交代でポケモンを入力していきます。
                  </CarouselItem>
                  <CarouselItem>
                    <div className='aspect-video bg-gray-500 w-full mb-8 mx-auto max-w-[380px]'></div>
                    入力した５文字のうち、お題のポケモンと「使っている文字」と「位置」が合っていた場合、緑色で表示されます。
                  </CarouselItem>
                  <CarouselItem>
                    <div className='aspect-video bg-gray-500 w-full mb-8 mx-auto max-w-[380px]'></div>
                    「使っている文字」は合っていて「位置」が異なる場合、黄色で表示されます。
                  </CarouselItem>
                  <CarouselItem>
                    <div className='aspect-video bg-gray-500 w-full mb-8 mx-auto max-w-[380px]'></div>
                    相手プレイヤーよりも先にお題を当てた方が勝利になります。
                  </CarouselItem>
                  <CarouselItem>
                    お題になるポケモンは以下の通りです。
                    <div className='max-h-[80%] border mt-4 p-1 overflow-y-scroll'>
                      <div>
                        {
                          pokemonList.pokemons.map((pokemon,index) => (
                            <p key={index}>{pokemon}<br></br></p>
                          ))
                        }
                      </div>
                    </div>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
              
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default HowTo