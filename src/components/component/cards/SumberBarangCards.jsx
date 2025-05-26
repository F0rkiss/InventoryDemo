import React, { forwardRef } from 'react'

const SumberBarangCards = forwardRef(({item, goToDetail, goToUpdate, restoreItems, deleteItems, restore = false}, ref) => {


    return (
        <div className='rounded-lg bg-white border mb-2' ref={ref}>
            <div className='grid grid-cols-3'>
                <div className='col-start-2 place-items-center py-2'>
                    <p className='text-center font-bold text-xl'>{item.name || item.data?.id?.name}</p>
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
              { !restore ?
                <>
                  <button
                      className="update_button bg-white rounded-md me-4 text-cyan-400 font-bold"
                      onClick={() => goToUpdate(item.id)}
                  >
                      Update
                  </button>
                  <button
                      className="delete_button bg-white rounded-md text-red-500 font-bold"
                      onClick={() => deleteItems(item.id, item.name)}
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

export default SumberBarangCards;