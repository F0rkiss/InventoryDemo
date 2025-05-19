import React, { forwardRef } from 'react'

const DepartmentCards = forwardRef(({item, goToUpdate, deleteItems, restoreItems, restore = false}, ref) => {
  
    return (
        <div className='bg-white rounded-md shadow-sm mb-3 mx-1' ref={ref}>
            <div className="upper-content border-b ">
                <p className='text-xl text-neutral-500 text-center pt-2 pb-1'>{item.divisi?.name || 'Tidak Ada Divisi'}</p>
                <hr className='w-1/2 mx-auto' />
                <div className='my-1'>
                    <p className='text-lg text-center font-bold'>{item.name}</p>
                    <p className='text-xl font-bold text-center'>{item.divisi?.kode}</p>
                </div>
            </div>
            <div className='flex py-2 mx-6'>
                { !restore ?
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
                : 
                    <button
                        className="restore_button bg-white rounded-md me-4 text-cyan-400 font-bold"
                        onClick={() => restoreItems(item.id, item.name)}
                    >
                        Restore
                    </button>
                }
            </div>
        </div>
    )
})

export default DepartmentCards