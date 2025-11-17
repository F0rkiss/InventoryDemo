import React, { useState, forwardRef } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const MutasiCards = forwardRef(({ item, goToPage }, ref) => {

    return (
        <div
            className="bg-white mt-3 border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
            ref={ref}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b">
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                        Mutasi Stok #{item.id}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {item.kodeMR || 'Kode MR tidak tersedia'}
                    </p>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap">
                    {dayjs(item.created_at).format('DD-MM-YYYY, HH:mm')}
                </p>
            </div>

            {/* Info Grid */}
            <div className="px-3 sm:px-4 py-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] sm:text-sm">
                <div>
                    <span className="text-gray-500">Stok Awal:</span>
                    <p className="font-medium">{item.stok_awal}</p>
                </div>
                <div>
                    <span className="text-gray-500">Stok Akhir:</span>
                    <p className="font-medium">{item.stok_akhir}</p>
                </div>
                <div>
                    <span className="text-gray-500">Perubahan:</span>
                    <p className={`font-medium ${item.stok_change < 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {item.stok_change > 0 ? '+' : ''}{item.stok_change}
                    </p>
                </div>
                <div>
                    <span className="text-gray-500">Tanggal Mutasi:</span>
                    <p className="font-medium">{dayjs(item.tanggal).format('DD MMM YYYY')}</p>
                </div>
                <div>
                    <span className="text-gray-500">Tanggal MR:</span>
                    <p className="font-medium">{dayjs(item.tanggalMR).format('DD MMM YYYY')}</p>
                </div>
                <div>
                    <span className="text-gray-500">Aset / Bukan Aset / Other:</span>
                    <p className="font-medium">{item.isAssetBarang === 'ya' ? 'Aset' : item.isAssetBarang === 'tidak' ? 'Bukan Aset' : 'Other'}</p>
                </div>
            </div>
        </div>
    )
})

export default MutasiCards
