import React, { forwardRef } from 'react'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { encrypting } from '../../../helper/EncryptHelper'
import relativeTime from 'dayjs/plugin/relativeTime'
import ApprovalActions from '../ApprovalActions'

dayjs.extend(relativeTime)

const NotifCards = forwardRef(({ item, goToPage }, ref) => {
    const navigate = useNavigate()

    return (
        <div className='bg-white mt-3 border rounded-md overflow-hidden shadow-sm' ref={ref}>
            <div className="p-4 flex flex-col border-b w-full">
                <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-medium text-gray-800 truncate">
                    {item.jenis_request === "MR"
                        ? item.username
                        : item.jenis_request === "LPB"
                            ? item.penerima
                            : item.penerima}
                    </h4>
                    <p className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                        {dayjs(item.created_at).format('DD-MM-YYYY, [pukul] HH:mm')}
                    </p>
                </div>
                <p className="text-sm text-gray-600 mb-1">{item.message_approval}</p>

                <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-400">
                        {item.should_approve ? 'Perlu approval' : 'Tidak perlu approval'}
                    </p>
                    <p className="text-xs text-gray-400">
                        {item.kode}
                        <span className="">Type : {item.jenis_request}</span>
                    </p>
                </div>
            </div>
            
            
            <div className='flex justify-end px-4 py-2'>
                <button className='text-cyan-500 font-semibold text-sm'
                    onClick={() => goToPage(item)}
                >
                    Lihat Detail
                </button>
            </div>
        </div>
    )
})

export default NotifCards
