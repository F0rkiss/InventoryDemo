import { forwardRef } from 'react'


const NavigationGroupCards = forwardRef(({item, deleteItems, goToDetail, goToUpdate, restoreItems, restore = false, source, canUpdate, canDelete}, ref) => {

    return (
        <>
            { source == 'group' ?
                <div className='bg-white mt-3 border rounded-lg overflow-hidden' ref={ref}>
                    <div className='p-1 ps-5 flex justify-between border-b w-full'>
                        <p className='capitalize flex flex-col font-semibold text-lg max-xs:text-base whitespace-nowrap overflow-hidden text-ellipsis'>
                            {item.role?.name || item.role_name}
                            <span className='text-sm max-xs:text-sm whitespace-nowrap'>{item.navigation_menu?.name || item.navigation_menu}</span>
                        </p>
                        {/* <p className=''></p> */}
                        {
                            !restore && 
                            <button className='w-8 h-9' onClick={() => goToDetail(item.id)}>
                                <i className="bx bx-dots-vertical-rounded text-2xl max-xs:text-xl" />
                            </button> 
                        }
                    </div>
                    <div className="p-2 ps-2 flex w-full">
                        <div className='flex justify-between w-full max-xs:h-16'>
                            <div className="text ms-4 max-xs:self-center  max-w-64 max-xs:w-40 whitespace-nowrap flex flex-col justify-center">
                                {/* <p className='text-sm max-xs:text-sm whitespace-nowrap italic'>Permission</p> */}
                                {/* CREATE ACCESS */}
                                <p className='flex gap-2 text-sm max-xs:text-sm'>
                                    Create:
                                    <span className={item.create_access === 1 ? 'text-green-500' : 'text-red-500'}>
                                        {item.create_access === 1 ? 'Allowed' : 'Not Allowed'}
                                    </span>
                                </p>
                                {/* READ ACCESS */}
                                <p className='flex gap-2 text-sm max-xs:text-sm'>
                                    Read:
                                    <span className={item.read_access === 1 ? 'text-green-500' : 'text-red-500'}>
                                        {item.read_access === 1 ? 'Allowed' : 'Not Allowed'}
                                    </span>
                                </p>
                                {/* UPDATE ACCESS */}
                                <p className='flex gap-2 text-sm max-xs:text-sm'>
                                    Update:
                                    <span className={item.update_access === 1 ? 'text-green-500' : 'text-red-500'}>
                                        {item.update_access === 1 ? 'Allowed' : 'Not Allowed'}
                                    </span>
                                </p>
                                {/* DELETE ACCESS */}
                                <p className='flex gap-2 text-sm max-xs:text-sm'>
                                    Delete:
                                    <span className={item.delete_access === 1 ? 'text-green-500' : 'text-red-500'}>
                                        {item.delete_access === 1 ? 'Allowed' : 'Not Allowed'}
                                    </span>
                                </p>
                            </div>
                        </div>
                        
                    </div>
                    { canUpdate || canDelete &&
                        <div className='flex justify-around p-2 border-t font-bold max-xs:text-xs'>
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
                    }
                </div>
                :
                <div className='bg-white mt-3 border rounded-lg overflow-hidden' ref={ref}>
                    <div className='p-1 ps-5 flex justify-between border-b w-full'>
                        <p>{item.name}</p>
                    </div>
                </div>
            }
        </>
  )
})

export default NavigationGroupCards