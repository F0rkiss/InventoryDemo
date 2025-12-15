import React, { forwardRef } from 'react'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const NotifCards = forwardRef(({ item, goToPage }, ref) => {
    const navigate = useNavigate()

    return (
        <div className='bg-white mt-3 border rounded-md overflow-hidden shadow-sm' ref={ref}>
            <div className="p-4 flex flex-col border-b w-full">
                <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-medium text-gray-800 truncate">
                        {["MR", "PR", "PO", "Memo", "LPB", "MemoDinamis"].includes(item.jenis_request)
                            ? item.username
                            : item.jenis_request === "LPB"
                                ? item.penerima
                                : "Not Set Yet"}
                    </h4>
                    <p className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                        {dayjs(item.created_at).format('DD-MM-YYYY, [pukul] HH:mm')}
                    </p>
                </div>

                <p className="text-sm text-gray-600 mb-1">{item.message_approval}</p>

                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-400">
                            {item.should_approve ? 'Perlu approval' : 'Tidak perlu approval'}
                        </p>
                        <span
                            className={`px-2 py-1 rounded-full font-semibold text-xs ${
                                item.jenis_request === 'LPB'
                                    ? 'bg-blue-500 bg-opacity-30 text-blue-700'
                                    : item.jenis_request === 'MR'
                                    ? 'bg-green-500 bg-opacity-30 text-green-700'
                                    : item.jenis_request === 'PR'
                                    ? 'bg-yellow-500 bg-opacity-30 text-yellow-700'
                                    : item.jenis_request === 'PO'
                                    ? 'bg-purple-500 bg-opacity-30 text-purple-700'
                                    : item.jenis_request === 'Memo'
                                    ? 'bg-cyan-100 text-cyan-700'
                                    : item.jenis_request === 'MemoDinamis'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-gray-400 bg-opacity-30 text-gray-700'
                            }`}
                        >
                            {item.jenis_request === "MemoDinamis" ? "Memo Dinamis" : item.jenis_request}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400">
                        {item.kode}
                    </p>
                </div>
            </div>

            <div className='flex justify-end px-4 py-2'>
                <button
                    className='text-cyan-500 font-semibold text-sm'
                    onClick={() => goToPage(item)}
                >
                    Lihat Detail
                </button>
            </div>
        </div>
    )
})

export default NotifCards
