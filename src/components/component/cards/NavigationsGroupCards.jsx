import { forwardRef } from 'react'


const UserCards = forwardRef(({item, deleteItems, goToDetail, goToUpdate, restoreItems, restore = false}, ref) => {

    return (
        <div className='bg-white mt-3 shadow-md rounded-md overflow-hidden' ref={ref}>
            <div className="p-2 ps-2 flex border-b w-full ">
                <div className='flex w-full  max-xs:h-16'>
                    <div className="text ms-4 max-xs:self-center  max-w-64 max-xs:w-40 whitespace-nowrap flex flex-col justify-center">
                        <p className='capitalize font-semibold text-lg max-xs:text-base whitespace-nowrap overflow-hidden text-ellipsis'>{item.name}</p>
                        <p className='text-base max-xs:text-sm whitespace-nowrap'>{item.email}</p>
                        <p className='text-sm max-xs:text-sm '>{item.role.name}</p>
                        <p className='text-sm max-xs:text-sm '>{item.EmpCode}</p>
                    </div>
                </div>
                {
                    !restore && 
                    <button className='w-8 h-9' onClick={() => goToDetail(item.id)}>
                        <i className="bx bx-dots-vertical-rounded text-2xl max-xs:text-xl" />
                    </button> 
                }
            </div>
            <div className='flex justify-around p-2 font-bold max-xs:text-xs'>
                {
                    !restore ?
                    <>
                    <button className='text-cyan-400' onClick={() => goToUpdate(item.id)}>
                    Update
                    </button>
                    <button className='text-red-500' onClick={() => deleteItems(item.id, item.name)}>
                        Delete
                    </button>
                    </>
                    :
                    <button className='text-cyan-400' onClick={() => restoreItems(item.id, item.name)}>
                        Restore
                    </button>
                }
            </div>
        </div>
  )
})

export default UserCards