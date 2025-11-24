import React from 'react'

const RefreshButton = ({onRefresh, className}) => (
    <button 
        onClick={onRefresh} 
        className={`flex px-1 justify-start  transition-color duration-200  rounded-md font-inter max-w-20 ${className}`}
    >
        <i className='bx bx-refresh text-2xl'/>
    </button>
)

export default RefreshButton