
import Cell from "./Cell"
import { useContext } from "react";
import { usedKanaListContext } from "@/contexts/usedKanaContext";
import { themeContext } from "@/contexts/themeContext";
import { ateThemeIndexContext } from "@/contexts/ateThemeIndexContext";
import { CellStateType } from "@/types/types";

const kanaList1 = [
  'ア','イ','ウ','エ','オ',
  'カ','キ','ク','ケ','コ',
  'サ','シ','ス','セ','ソ',
  'タ','チ','ツ','テ','ト',
  'ナ','ニ','ヌ','ネ','ノ',
  'ハ','ヒ','フ','ヘ','ホ',
  'マ','ミ','ム','メ','モ',
  'ヤ',undefined, 'ユ',undefined, 'ヨ',
  'ラ','リ','ル','レ','ロ',
  'ワ',undefined,'ヲ',undefined,'ン'
];
const kanaList2 = [
  'ガ','ギ','グ','ゲ','ゴ',
  'ザ','ジ','ズ','ゼ','ゾ',
  'ダ','ヂ','ヅ','デ','ド',
  'バ','ビ','ブ','ベ','ボ',
  'パ','ピ','プ','ペ','ポ'
]
const kanaList3 = [
  'ァ','ィ','ゥ','ェ','ォ',
  'ャ',undefined,'ュ',undefined,'ョ',
  'ー'
]

const GenerateCells = ({list}:{list:(string | undefined)[]}) => {
  const [usedKanaList] = useContext(usedKanaListContext)
  const [theme] = useContext(themeContext)
  const [ateThemeIndex] = useContext(ateThemeIndexContext)

  const isAte = (kana:string) => {
    const ateKanas = ateThemeIndex.map(i => theme[i])
    return ateKanas.includes(kana)
  }

  const isBite = (kana:string) => {
    return usedKanaList.includes(kana) && theme.includes(kana)
  }

  return list.map((text,index) => {
    const state:CellStateType = text === undefined ? undefined :
                  isAte(text) ? 'eat' :
                  isBite(text) ? 'bite' :
                  usedKanaList.includes(text) ? 'used' : undefined

    return <Cell text={text} key={index} state={state} />
  })
}

const KanaTable = () => {
  
  return (
    <>
      <div className="grid grid-flow-dense gap-y-4 gap-x-1 grid-cols-2 md:flex md:gap-8 w-fit md:w-min mx-auto md:flex-row-reverse">
        <div className="grid col-span-2 grid-rows-5 grid-flow-col w-min gap-1" style={{direction: 'rtl'}}>
          <GenerateCells list={kanaList1} />
        </div>
        <div className="col-start-2 md:col-start-1 grid grid-rows-5 grid-flow-col w-min gap-1" style={{direction: 'rtl'}}>
          <GenerateCells list={kanaList2} />
        </div>
        <div className="grid grid-rows-5 grid-flow-col justify-self-end w-min gap-1" style={{direction: 'rtl'}}>
          <GenerateCells list={kanaList3} />
        </div>
      </div>
    </>
    )
}

export default KanaTable