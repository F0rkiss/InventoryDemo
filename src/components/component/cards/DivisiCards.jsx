import React, { forwardRef } from 'react'
import { encrypting } from '../../../helper/EncryptHelper';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/api';

const DivisiCards = forwardRef(({item, restore = false, goToUpdate, deleteItems, restoreItems}, ref) => {

    return (
        <div key={item.id} className='rounded-xl bg-white shadow-md mb-4' ref={ref}>
            <div className='flex flex-col items-center py-2'>
                <p className='w-1/2 text-center font-bold text-xl'>{item.kode}</p>
                <p className='w-1/2 text-center text-md'>{item.name}</p>
            </div>
            <hr />
            <div className='flex py-2 mx-6'>
                {
                  restore ? <button className="update_button bg-white rounded-md me-4 text-cyan-400 font-bold" onClick={() => restoreItems(item.id, item.name)}>Restore</button>
                :
                 (
                  <>
                    <button
                    className="update_button bg-white rounded-md me-4 text-cyan-400 font-bold"
                    onClick={() => goToUpdate(item.id)}
                    >
                    Update
                    </button>
                    <button
                    onClick={() => deleteItems(item.id, item.name)}
                    className="delete_button bg-white rounded-md text-red-500 font-bold"
                    >
                    Delete
                    </button>
                  </>
                 )
                }
                
            </div>
        </div>
    )
})

export default DivisiCards