import React from 'react'

const RefreshButton = ({onRefresh, className}) => (
    <button 
        onClick={onRefresh} 
        className={`flex px-2 py-1 justify-start hover:bg-gray-200 transition-color duration-200 rounded-md font-inter max-w-20 ${className}`}
    >
        <i className='bx bx-revision text-2xl'/>
    </button>
)

export default RefreshButton
