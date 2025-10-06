import React, { forwardRef } from 'react'
import DateFormat from '../../../helper/DateFormatHelper'

const MakeRequestCards = forwardRef(({item, filterStatus, goToDetail, canUpdate, goToUpdate, restoreItems, deleteItems, restore = false}, ref) => {
    
    // Personal make request formatting
    const typeRequest = item.type_request
    const user = item.user

    return (
        <div className='rounded-lg bg-white border mb-2 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200' ref={ref}>
            <div className='border-b flex justify-between items-center py-3 mx-4 min-h-[64px]'>
                <div className='self-start py-1 space-y-1'>
                    { (item.EmpName || user?.EmpName) &&
                        <p className='font-bold text-lg capitalize'>
                            {item.EmpName || user?.EmpName}
                        </p>
                    }
                    <div>
                        <p className='font-medium text-md pe-2'>
                            {item.kode}
                        </p>
                    </div>
                </div>
                <button
                className='detail-button'
                onClick={() => goToDetail(item.id)}
                >
                <i className="bx bx-dots-vertical-rounded text-2xl max-xs:text-xl" />
                </button>
            </div>
            <div className="m-4 text-right space-y-2">
                <div className="flex justify-between">
                    <p className='text-gray-500'>Tanggal</p><p className='font-medium'>{DateFormat(item.tanggal)}</p>
                </div>
                <div className="flex justify-between">
                    <p className='text-gray-500'>Type Request</p> <p className='font-medium'>{item.nameTypeRequest || typeRequest.name}</p>
                </div>
                <div className="flex justify-between">
                    <p className='text-gray-500'>Jenis</p><p className='font-medium'>{item.jenisTypeRequest || typeRequest.jenis}</p>
                </div>
                { (item.deskripsiTypeRequest || typeRequest.description) &&
                <div className="flex justify-between space-x-4">
                    <p className='text-gray-500'>Deskripsi</p><p className='font-medium'>{item.deskripsiTypeRequest || typeRequest.description}</p>
                </div>
                }
            </div>
            <div className={`max-w-max flex self-end rounded-md border mb-2 mx-4 ${item.is_full_approval ? 'bg-green-50 border-green-400' : 'bg-amber-50 border-amber-400'}`} >
                { item.approval_message ?
                    <p className={`py-1 px-4 text-xs font-medium ${item.is_full_approval ? 'text-green-700' : 'text-amber-600'}`}>{item.approval_message}</p>
                    :
                    <p className={`py-1 px-4 text-xs font-medium ${item.is_full_approval ? 'text-green-700' : 'text-amber-600'}`}>{item.is_full_approval ? 'Approval selesai' : 'Approval belum selesai'}</p>
                }
            </div>
            <div className='flex py-2 px-2'>
                { canUpdate &&
                    <button
                        className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-600 font-medium rounded-md transition-colors duration-200 text-sm"
                        onClick={() => goToUpdate(item.id)}
                        title="Update Request"
                    >
                        Update
                    </button>
                }
            </div>
        </div>
    )
})

export default MakeRequestCards