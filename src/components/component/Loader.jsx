import React from 'react'

function Loader({Class, text ='Loading .....', contentClass }) {
  return (
    <div className={` mt-12 font-inter ${Class} `}>
        <div className={`border-8 border-white rounded-full border-t-8 border-t-teal-400 w-16 h-16 animate-spin mx-auto ${contentClass}`}/>
          <p className='text-center mt-3 text-lg font-normal light'>{text}</p>
    </div>
  )
}

export default Loader