import React, { forwardRef } from 'react'

const TypeRequestCards = forwardRef(({item, goToDetail, canUpdate, canDelete, goToUpdate, restoreItems, deleteItems, restore = false}, ref) => {

    return (
        <div className='rounded-lg bg-white border mb-2 flex flex-col justify-between' ref={ref}>
            <div className='grid grid-cols-3 border-b p-2'>
                <div className='col-start-2 place-items-center py-2'>
                    <p className='text-center font-bold text-xl'>{item.name}</p>
                    <p className='text-center font-regular italic text-md text-gray-400'>{item.jenis}</p>
                </div>
                {
                    !restore && 
                    <div className='col-start-3 justify-self-end py-1'>
                        <button className='w-8 h-9' onClick={() => goToDetail(item.id)}>
                            <i className="bx bx-dots-vertical-rounded text-2xl max-xs:text-xl" />
                        </button> 
                    </div>
                }
            </div>
            <p className='text-center text-md p-2'>{item.description}</p>
            <div className='flex py-2 mx-6 gap-2'>
            {canUpdate && (
                    <button
                        className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 font-medium rounded-md transition-colors duration-200 text-sm"
                        onClick={() => goToUpdate(item.id)}
                    >
                        Update
                    </button>
                )}
                {canDelete && (
                    <button
                        onClick={() => deleteItems(item.id, item.name)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-md transition-colors duration-200 text-sm"
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    )
})

export default TypeRequestCards