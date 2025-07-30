import React, { forwardRef } from 'react'

const JenisBarangCards = forwardRef(({item, goToDetail, goToUpdate, restoreItems, deleteItems, restore = false, canDelete, canUpdate}, ref) => {


    return (
        <div className='rounded-lg bg-white border mb-2' ref={ref}>
            <div className='grid grid-cols-3'>
                <div className='col-start-2 place-items-center py-2'>
                    <p className='text-center font-bold text-xl'>{item.name || item.data?.name}</p>
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
            <p className='text-center text-md pb-2'>{item.description}</p>
            <hr  />
            <div className='flex py-2 mx-6'>
                { canUpdate &&
                    <button
                    className="update_button text-cyan-400 bg-white flex justify-center h items-center py-3"
                    onClick={() => handleUpdateClick(item.id)}
                    >
                    <p>Update</p>
                    </button>
                }
                { canDelete &&
                    <button
                    className="delete_button text-red-500 bg-white flex justify-center items-center py-3"
                    onClick={() => handleDeleteClick(item.id)}
                    >
                    <p>Delete</p>
                    </button>
                }
            </div>
        </div>
  )
})

export default JenisBarangCards;