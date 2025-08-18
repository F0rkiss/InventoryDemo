import React, { forwardRef } from 'react'
import DateFormat from '../../../helper/DateFormatHelper';

const RoleCards = forwardRef(({item, deleteItems, goToDetail, goToUpdate, restoreItems, restore = false, canDelete, canUpdate}, ref) => {

    return (
        <div className='rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col justify-between min-h-[200px]' ref={ref}>
            {/* Header Section */}
            <div className='grid grid-cols-3 justify-between mb-3 border-b items-center justify-center pb-2'>
                <h3 className='col-start-2 font-bold text-xl capitalize text-center leading-tight'>
                    {item.name}
                </h3>
            </div>

            {/* Content Section */}
            <div className='flex-1 space-y-2'>
                <div className="flex justify-between items-start">
                    <span className="text-gray-500">Tgl. Dibuat</span>
                    <p className="text-s font-medium text-gray-800 text-right max-w-[60%] break-words">
                        {DateFormat(item.created_at)}
                    </p>
                </div>
                
                <div className="flex justify-between items-start">
                    <span className="text-gray-500">Tgl. Diubah</span>
                    <p className="text-sm font-medium text-gray-800 text-right max-w-[60%] break-words">
                        {DateFormat(item.updated_at)}
                    </p>
                </div>
            </div>

            {/* Action Buttons Section */}
            <div className='flex justify-end gap-2 pt-3 mt-3'>
                {canUpdate && (
                    <button
                        className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 font-medium rounded-md transition-colors duration-200 text-sm"
                        onClick={() => goToUpdate(item.id)}
                    >
                        Update
                    </button>
                )}
                {canDelete && (
                    <button
                        onClick={() => deleteItems(item.id, item.name)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-md transition-colors duration-200 text-sm"
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    )
})

export default RoleCards;