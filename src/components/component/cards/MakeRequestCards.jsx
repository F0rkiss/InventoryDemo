import React, { forwardRef } from 'react'
import DateFormat from '../../../helper/DateFormatHelper'

const MakeRequestCards = forwardRef(({item, goToDetail, canUpdate, goToUpdate, restoreItems, deleteItems, restore = false}, ref) => {


    return (
        <div className='rounded-lg bg-white border mb-2 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200' ref={ref}>
            <div className='border-b flex flex-col items-center justify-center py-3 min-h-[64px] relative'>
                <p className='font-bold text-xl capitalize text-center leading-tight'>
                    {item.EmpName}
                </p>
                <p className='font-regular text-md text-gray-400 text-center'>
                    {item.kode} - {item.email}
                </p>
                {
                    !restore && (
                        <button
                        className='absolute detail-button'
                        onClick={() => goToDetail(item.id)}
                        >
                        <i className="bx bx-dots-vertical-rounded text-xl max-xs:text-xl" />
                        </button>
                    )
                }
            </div>


            <div className="m-3 text-right space-y-1">
                <div className="flex justify-between">
                    <p className='text-gray-500'>Type Request</p> <p className='font-medium'>{item.type_name}</p>
                </div>
                <div className="flex justify-between">
                    <p className='text-gray-500'>Jenis</p><p className='font-medium'>{item.jenis}</p>
                </div>
                <div className="flex justify-between">
                    <p className='text-gray-500'>Tgl. Permintaan</p><p className='font-medium'>{item.tanggal}</p>
                </div>
                <div className="flex justify-center">
                    <p className={`mt-2 font-medium ${item.is_full_approval ? 'text-green-600' : 'text-amber-600'}`}>{item.approval_message}</p>
                </div>
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