import { forwardRef } from 'react'

const NavigationGroupCards = forwardRef(({ item, deleteItems, goToDetail, goToUpdate,  source, canUpdate, canDelete }, ref) => {

    return (
        <div className='rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col justify-between min-h-[200px]' ref={ref}>
            {/* Header Section */}
            <p className='row-start-2 col-span-3 font-bold text-xl capitalize self-start'>
                {item.navigation_menu?.name
                    ? item.navigation_menu.name.replace(/([a-z])([A-Z])/g, '$1 $2')
                    : item.navigation_menu
                    }
            </p>
                
            {/* Content Section */}
            <div className='flex-1 space-y-2 mt-2 border-t pt-3'>
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
