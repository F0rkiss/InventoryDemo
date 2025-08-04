import React from 'react'

const Back = ({goHome, className}) => (
    <button onClick={goHome} className={`flex justify-start font-inter max-w-32 ${className}`}><i className='bx bx-left-arrow-alt text-3xl'/><div className='self-center text-md'>Back</div></button>
    )


export default Back