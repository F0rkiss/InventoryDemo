import React, { forwardRef } from 'react'

const ApprovalStepCard = forwardRef(({item, goToDetail, canUpdate, canDelete, goToUpdate, deleteItems}, ref) => {

    return (
        <div className='rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col justify-between min-h-[200px]' ref={ref}>
            {/* Header Section */}
            <div className='grid grid-cols-3 justify-between mb-3 border-b items-center justify-center pb-2'>
                <h3 className='col-start-2 font-bold text-xl capitalize text-center leading-tight'>
                    {item.user?.EmpName || "Atasan"}
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
            <div className='flex-1 space-y-3'>
                <div className="flex justify-between items-start">
                    <span className=" text-gray-600">Note</span>
                    <p className="text-sm font-medium text-gray-800 text-right max-w-[60%] break-words">
                        {item.note || "'Belum Ditentukan'"}
                    </p>
                </div>
                
                <div className="flex justify-between items-start">
                    <span className="text-gray-600">Type Request</span>
                    <p className="text-sm font-medium text-gray-800 text-right max-w-[60%] break-words">
                        {item.type_request?.name || item.nameTypeRequest}
                    </p>
                </div>
            </div>

            {/* Action Buttons Section */}
            <div className='flex justify-end gap-2 pt-3 mt-3'>
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

export default ApprovalStepCard