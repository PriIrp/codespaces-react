import React from 'react'
import { useGameState } from '../util/context'

const Box = ({ letter, isInvalid, fill, toPop }) => {
  
  return (
    <div 
      className= {` min-w-[60px] min-h-[60px] m-1 flex place-content-center  place-items-center border-box font-TMS text-[2rem] text-white bg-[#121213] border-2 ${letter ? "animate-pop border-[#3a3a3c]" : "border-[#565758]"} ${isInvalid ? 'border-red-700' : ''} ${ fill } ${ toPop }`}>      
       {letter}
    </div>
  )
}

export default Box
