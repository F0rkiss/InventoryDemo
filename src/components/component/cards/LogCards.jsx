import React, { useState, forwardRef } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import ImagePreviewModal from '../modal/ImagePreviewModal'

dayjs.extend(relativeTime)

const MutasiCards = forwardRef(({ item, goToPage }, ref) => {

    const beforeIsNull = item.data_before === null
    const afterIsNull = item.data_after === null

    return (
        <>
        <div
            className="bg-white mt-3 border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
            ref={ref}
            // onClick={() => goToPage(item)}
        >
            {/* Header */}
            <div className="flex items-center p-3 sm:p-4 border-b flex-wrap gap-3">
            <div className="flex-1 min-w-[150px]">
                <h4 className="font-semibold text-gray-800 text-sm sm:text-base capitalize">
                {item.action}
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                {item.title || '-'}
                </p>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap">
                {dayjs(item.created_at).format('DD-MM-YYYY, HH:mm')}
            </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 p-4 relative">
            {/* Vertical Divider (only on large screens) */}
            <div className="hidden sm:block absolute top-4 bottom-4 left-1/2 w-px bg-gray-200" />

            {/* BEFORE */}
            <div className="flex flex-col justify-center">
                {beforeIsNull ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm italic text-center">
                    Tidak Ada Sebelumnya
                </div>
                ) : (
                <>
                    <h5 className="font-semibold text-gray-700 text-sm mb-2">
                    Sebelum
                    </h5>
                    <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                        Kode:{' '}
                        <span className="font-medium">
                        {item.data_after.kode || '-'}
                        </span>
                    </p>
                    <p className="text-sm text-gray-600">
                        Note:{' '}
                        <span className="font-medium">
                        {item.data_after.note || '-'}
                        </span>
                    </p>


                    </div>
                </>
                )}
            </div>

            {/* AFTER */}
            <div className="flex flex-col justify-center">
                {afterIsNull ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm italic text-center">
                    Barang Telah Dihapus
                </div>
                ) : (
                <>
                    <h5 className="font-semibold text-gray-700 text-sm mb-2">
                    Setelah
                    </h5>
                    <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                        Kode:{' '}
                        <span className="font-medium">
                        {item.data_after.kode || '-'}
                        </span>
                    </p>
                    <p className="text-sm text-gray-600">
                        Note:{' '}
                        <span className="font-medium">
                        {item.data_after.note || '-'}
                        </span>
                    </p>

                    </div>
                </>
                )}
            </div>
            </div>
        </div>
        </>
    )
})

export default MutasiCards
