import React from 'react'

const Back = ({goHome, className}) => (
    <button onClick={goHome} className={`flex justify-start mt-2 ms-2 font-inter max-w-32 ${className}`}><i className='bx bx-left-arrow-alt text-4xl'/> <div className='self-center'>Go Home</div></button>
    )


export default Back