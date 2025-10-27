import React, { forwardRef } from 'react'

const PPNCard = forwardRef(({item, deleteItems, goToDetail, goToUpdate, canUpdate, canDelete}, ref) => {

    return (
        <div className='rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col justify-between min-h-[150px]' ref={ref}>
            {/* Header Section */}
            <div className='grid grid-cols-2 justify-between border-b items-center justify-center pb-2'>
                <h3 className='col-start-1 font-semibold text-2xl capitalize leading-tight'>
                    {item.nilai_ppn}
                </h3>
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
                        onClick={() => deleteItems(item.id)}
                        className="px-3 py-1.5 delete-button"
                    >
                        Delete
                    </button>
                }
            </div>
        </div>
    )
})

export default PPNCard;