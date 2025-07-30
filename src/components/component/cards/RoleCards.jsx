import React, { forwardRef } from 'react'


const UserCards = forwardRef(({item, deleteItems, goToDetail, goToUpdate, restoreItems, restore = false, canDelete, canUpdate}, ref) => {

    return (
        <div className='bg-white mt-3 border rounded-md overflow-hidden' ref={ref}>
            <div className="p-2 ps-2 flex border-b w-full ">
                <div className='flex w-full  max-xs:h-16'>
                    <div className="text ms-4 max-xs:self-center  max-w-64 max-xs:w-40 whitespace-nowrap flex flex-col justify-center">
                        <p className='capitalize font-semibold text-lg max-xs:text-base whitespace-nowrap overflow-hidden text-ellipsis'>{item.name}</p>
                        {/* <p className='text-sm max-xs:text-sm '>{item.created_at}</p>
                        <p className='text-sm max-xs:text-sm '>{item.updated_at}</p> */}
                    </div>
                </div>
            </div>
            <div className='flex justify-around p-2 font-bold max-xs:text-xs'>
                { canUpdate &&
                    <button className='text-cyan-400' onClick={() => goToUpdate(item.id)}>
                    Update
                    </button>
                }
                { canDelete &&
                    <button className='text-red-500' onClick={() => deleteItems(item.id, item.name)}>
                        Delete
                    </button>
                }
            </div>
        </div>
  )
})

export default RoleCards;