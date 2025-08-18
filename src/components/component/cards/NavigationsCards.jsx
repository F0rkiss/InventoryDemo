import { forwardRef } from 'react'

const NavigationGroupCards = forwardRef(({ item, deleteItems, goToDetail, goToUpdate,  source, canUpdate, canDelete }, ref) => {

    return (
        <div className='rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col justify-between min-h-[200px]' ref={ref}>
            {/* Header Section */}
            <div className='grid grid-cols-3 grid-rows-2 justify-between mb-3 border-b items-center justify-center pb-2'>
                <h3 className='col-start-1 col-span-2 font-bold text-xl capitalize '>
                    {item.role?.name || item.role_name}
                </h3>
                <h3 className='row-start-2 col-span-3 font-medium text-lg capitalize self-start'>
                    {item.navigation_menu?.name
                        ? item.navigation_menu.name.replace(/([a-z])([A-Z])/g, '$1 $2')
                        : item.navigation_menu
                        }
                </h3>
                <button
                    className='detail-button col-start-3 justify-self-end'
                    onClick={() => goToDetail(item.id)}
                    title="View Details"
                >
                    <i className="bx bx-dots-vertical-rounded text-2xl group-hover:text-gray-800 transition-all duration-200" />
                </button>
            </div>

            {/* Content Section */}
            <div className='flex-1 space-y-2'>
                <div className="flex justify-between items-start">
                    <span className="text-gray-500">Create Access</span>
                    <p className={`text-sm font-medium text-gray-800 text-right max-w-[60%] break-words ${item.create_access === 1 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.create_access === 1 ? 'Allowed' : 'Not Allowed'}
                    </p>
                </div>

                <div className="flex justify-between items-start">
                    <span className="text-gray-500">Read Access</span>
                    <p className={`text-sm font-medium text-gray-800 text-right max-w-[60%] break-words ${item.read_access === 1 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.read_access === 1 ? 'Allowed' : 'Not Allowed'}
                    </p>
                </div>

                <div className="flex justify-between items-start">
                    <span className="text-gray-500">Update Access</span>
                    <p className={`text-sm font-medium text-gray-800 text-right max-w-[60%] break-words ${item.update_access === 1 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.update_access === 1 ? 'Allowed' : 'Not Allowed'}
                    </p>
                </div>

                <div className="flex justify-between items-start">
                    <span className="text-gray-500">Delete Access</span>
                    <p className={`text-sm font-medium text-gray-800 text-right max-w-[60%] break-words ${item.delete_access === 1 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.delete_access === 1 ? 'Allowed' : 'Not Allowed'}
                    </p>
                </div>
            </div>

            {/* Action Buttons Section */}
            <div className='flex justify-end gap-2 pt-3 mt-3'>
                {canUpdate &&
                    <button
                        className="px-3 py-1.5 update-button"
                        onClick={() => goToUpdate(item.id)}
                    >
                        Update
                    </button>
                }
                {canDelete &&
                    <button
                        onClick={() => deleteItems(item.id, item.name)}
                        className="px-3 py-1.5 delete-button"
                    >
                        Delete
                    </button>
                }
            </div>
        </div>
    )
})

export default NavigationGroupCards
