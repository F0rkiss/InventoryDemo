import React from 'react'
import { useNavigate } from 'react-router-dom'

function FlyingButton({goTo}) {
    const navigate = useNavigate()


  return (
    <div className="float-buttton fixed bottom-6 text-4xl px-[18px] rounded-full right-8 bg-coklat-mi font-extralight text-white z-10 py-2">
        <button onClick={() => navigate(goTo)}>
        <p className='leading-[0.70] -translate-y-[2px]'>&#43;</p>
        </button>
      </div>
  )
}

export default FlyingButton