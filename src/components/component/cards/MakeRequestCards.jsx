import React, { forwardRef } from 'react'
import DateFormat from '../../../helper/DateFormatHelper'

const MakeRequestCards = forwardRef(({item, goToDetail, canUpdate, goToUpdate, restoreItems, deleteItems, restore = false}, ref) => {


    return (
        <div className='rounded-lg bg-white border mb-2 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200' ref={ref}>
            <div className='border-b flex justify-between items-center py-3 mx-4 min-h-[64px]'>
                <div className='self-start py-1 space-y-1'>
                    <p className='font-bold text-xl capitalize '>
                        {item.EmpName}
                    </p>
                    <div className='flex'>
                        <p className='font-medium text-md pe-2'>
                            {item.kode}
                        </p>
                        {/* <p className='font-regular text-md ps-2'>
                            {item.email}
                        </p> */}
                    </div>
                </div>
                <button
                className=' detail-button'
                onClick={() => goToDetail(item.id)}
                >
                <i className="bx bx-dots-vertical-rounded text-2xl max-xs:text-xl" />
                </button>
            </div>
            <div className="m-4 text-right space-y-2">
                <div className="flex justify-between">
                    <p className='text-gray-500'>Type Request</p> <p className='font-medium'>{item.type_name}</p>
                </div>
                <div className="flex justify-between">
                    <p className='text-gray-500'>Jenis</p><p className='font-medium'>{item.jenis}</p>
                </div>
                <div className="flex justify-between">
                    <p className='text-gray-500'>Tgl. Request</p><p className='font-medium'>{DateFormat(item.tanggal)}</p>
                </div>
            </div>
            <div className={`max-w-max flex self-end rounded-md border mb-2 mx-4 ${item.is_full_approval ? 'bg-green-50 border-green-400' : 'bg-amber-50 border-amber-400'}`} >
                <p className={`py-1 px-4 text-xs font-medium ${item.is_full_approval ? 'text-green-700' : 'text-amber-600'}`}>{item.approval_message}</p>
            </div>
            <div className='flex py-2 px-2'>
                { canUpdate &&
                    <button
                        className="update-button py-1"
                        onClick={() => goToUpdate(item.id)}
                        title="View Details"
                    >
                        Update
                    </button>
                }
            </div>
        </div>
    )
})

export default MakeRequestCards