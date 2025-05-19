import React from 'react'
import { useNavigate } from 'react-router-dom'

const RestoreButton = ({goTo}) => {
    const navigate = useNavigate()

    return (
        <button onClick={() => navigate(goTo)} className='bg-green-400 w-24 text-white rounded-md flex items-center gap-1 max-h-8'>
            <i className='bx bx-refresh ms-2 text-base font-ex'></i>
            <div className='h-full flex items-center border-s-white border-s'>
                <p className='text-sm ms-2 font-light'> Restore </p>
            </div>
        </button>
    )
}

export default RestoreButton