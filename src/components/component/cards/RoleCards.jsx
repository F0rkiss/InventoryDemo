import React, { forwardRef } from 'react'
import DateFormat from '../../../helper/DateFormatHelper';

const RoleCards = forwardRef(({item, deleteItems, goToDetail, goToUpdate, restoreItems, restore = false, canDelete, canUpdate}, ref) => {

    return (
        <div className='rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col justify-between min-h-[120px]' ref={ref}>
            {/* Header Section */}
            <div className='flex border-b items-center pb-3'>
                <p className='font-bold text-xl capitalize leading-tight'>
                    {item.name}
                </p>
            </div>

            {/* Action Buttons Section */}
            <div className='flex justify-end gap-2'>
                {canUpdate && (
                    <button
                        className="px-3 py-1.5 update-button text-sm"
                        onClick={() => goToUpdate(item.id)}
                    >
                        Update
                    </button>
                )}
                {canDelete && (
                    <button
                        onClick={() => deleteItems(item.id, item.name)}
                        className="px-3 py-1.5 delete-button text-sm"
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    )
})

export default RoleCards;