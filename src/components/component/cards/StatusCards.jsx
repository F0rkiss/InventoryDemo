import React, { forwardRef } from 'react'

const StatusCards = forwardRef(({item, deleteItems, goToDetail, goToUpdate, restoreItems, restore = false}, ref) => {

    return (
        <div className='rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col justify-between min-h-[200px]' ref={ref}>
            {/* Header Section */}
            <div className='flex justify-between items-center mb-3 border-b flex flex-col items-center justify-center py-3 min-h-[64px] relative'>
                <h3 className='font-bold text-xl capitalize text-center leading-tight'>
                    {item.name}
                </h3>
                <button
                    className='absolute right-2 top-2 w-8 h-9 p-1 rounded-md hover:bg-gray-100 hover:scale-110 transition-all duration-200 ease-in-out group'
                    onClick={() => goToDetail(item.id)}
                    title="View Details"
                >
                    <i className="bx bx-dots-vertical-rounded text-lg text-gray-600 group-hover:text-gray-800 transition-all duration-200" />
                </button>
            </div>

            {/* Content Section */}
            <div className='flex-1 space-y-3'>
                <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-600">Description:</span>
                    <p className="text-sm text-gray-800 text-right max-w-[60%] break-words">
                        {item.description || "N/A"}
                    </p>
                </div>
            </div>

            {/* Action Buttons Section */}
            <div className='flex justify-end gap-2 pt-3 mt-3 border-t border-gray-100'>
                {!restore ? (
                    <>
                        <button
                            className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 font-medium rounded-md transition-colors duration-200 text-sm"
                            onClick={() => goToUpdate(item.id)}
                        >
                            Update
                        </button>
                        <button
                            onClick={() => deleteItems(item.id, item.name)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-md transition-colors duration-200 text-sm"
                        >
                            Delete
                        </button>
                    </>
                ) : (
                    <button
                        className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 font-medium rounded-md transition-colors duration-200 text-sm"
                        onClick={() => restoreItems(item.id, item.name)}
                    >
                        Restore
                    </button>
                )}
            </div>
        </div>
    )
})

export default StatusCards