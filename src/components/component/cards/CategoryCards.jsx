import React, { forwardRef } from 'react'

const CategoryCards = forwardRef(({item, goToDetail, goToUpdate, deleteItems, canDelete, canUpdate}, ref) => {

    return (
        <div className='rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col justify-between min-h-[150px]' ref={ref}>
            {/* Header Section */}
            <div className='grid grid-cols-2 justify-between mb-3 border-b items-center justify-center pb-2'>
                <h3 className='col-start-1 font-semibold text-xl capitalize leading-tight'>
                    {item.name}
                </h3>
                <button
                    className='detail-button col-start-3 justify-self-end'
                    onClick={() => goToDetail(item.id)}
                    title="View Details"
                >
                    <i className="bx bx-dots-vertical-rounded text-2xl group-hover:text-gray-800 transition-all duration-200" />
                </button>
            </div>
            <div>
                <p>{item.description}</p>
            </div>

            {/* Action Buttons Section */}
            <div className='flex justify-end gap-2 pt-3'>
                {
                    canUpdate &&
                    <button
                        className="px-3 py-1.5 update-button"
                        onClick={() => goToUpdate(item.id)}
                    >
                        Update
                    </button>
                }
                {
                    canDelete &&
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

export default CategoryCards