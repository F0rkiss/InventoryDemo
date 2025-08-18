import React from 'react'

const Back = ({goHome, className}) => (
    <button onClick={goHome} className={`flex px-2 justify-start bg-gray-200 hover:bg-gray-300 transition-color duration-200 border rounded-md font-inter max-w-20 ${className}`}>
        <i className='bx bx-left-arrow-alt text-2xl'/>
        <div className='self-center font-medium text-md'>Back</div>
    </button>
    )


export default Back