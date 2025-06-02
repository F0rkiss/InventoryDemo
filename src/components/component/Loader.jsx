import React from 'react'
import '../../css/loader.css'

function Loader({Class, text ='Please wait...', contentClass }) {
  return (
    // <div className={`mt-12 font-inter ${Class} `}>
    //     <div className={`border-4 border-gray-200 rounded-full border-b-slate-700 w-12 h-12 animate-spin mx-auto ${contentClass}`}/>
    //       <p className='text-center mt-3 text-lg font-normal light'>{text}</p>
    // </div>
    <div className={`mt-12 font-inter ${Class} `}>
      <div className={`
        flex justify-center items-center
        space-x-2 
        w-24 h-12 
        mx-auto
        ${contentClass}
      `}>
        {/* Dot 1 */}
        <div className="w-3 h-3 bg-rose-700 rounded-full animate-bounce-delay-1"></div>
        {/* Dot 2 */}
        <div className="w-3 h-3 bg-rose-700 rounded-full animate-bounce-delay-2"></div>
        {/* Dot 3 */}
        <div className="w-3 h-3 bg-rose-700 rounded-full animate-bounce-delay-3"></div>
      </div>
      {/* <p className='text-center mt-3 text-lg font-normal light'>{text}</p> */}
    </div>
  )
}

export default Loader