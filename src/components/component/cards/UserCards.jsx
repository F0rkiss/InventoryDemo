import React, { forwardRef } from 'react'
import DateFormat from '../../../helper/DateFormatHelper'

const UserCards = forwardRef(({item, deleteItems, goToDetail, goToUpdate, canUpdate}, ref) => {

    return (
        <div className='rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col justify-between min-h-[200px]' ref={ref}>
            {/* Header Section */}
            <div className='grid grid-cols-3 grid-rows-2 justify-between mb-3 border-b items-center justify-center pb-2'>
                <h3 className='col-start-1 col-span-2 font-bold text-xl capitalize'>
                    {item.EmpName}
                </h3>
                <div className='row-start-2 col-span-3 self-start'>
                    <h3 className='font-medium text-lg capitalize'>
                        { item.role?.name }
                    </h3>
                </div>
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
                    <span className="text-gray-500">Employee Code</span>
                    <p className='font-medium text-right max-w-[60%] break-words'>
                        {item.EmpCode}
                    </p>
                </div>

                <div className="flex justify-between items-start">
                    <span className="text-gray-500">Email</span>
                    <p className='font-medium text-right max-w-[60%] break-words'>
                        {item.email}
                    </p>
                </div>

                <div className="flex justify-between items-start">
                    <span className="text-gray-500">Phone</span>
                    <p className='font-medium text-right max-w-[60%] break-words'>
                        {item.EmpPhone}
                    </p>
                </div>

                <div className="flex justify-between items-start">
                    <span className="text-gray-500">Date of Birth</span>
                    <p className='font-medium text-right max-w-[60%] break-words'>
                        {item.DOB}
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
            </div>
        </div>
    )
})

export default UserCards;