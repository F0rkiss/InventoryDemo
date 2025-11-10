import React, { useState, forwardRef } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const LogCards = forwardRef(({ item, goToPage }, ref) => {
    const [detail, setDetail] = useState(null)
    
    const beforeIsNull = item.data_before === null
    const afterIsNull = item.data_after === null

    const toggleDetail = (itemId) => {
        setDetail((prevDetails) => (prevDetails === itemId ? null : itemId))
    }

    return (
        <div
            className="bg-white rounded-md shadow-md mb-2 hover:shadow-lg transition-shadow duration-200"
            ref={ref}
        >
            <div className="content p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-lg capitalize">
                            {item.action}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                            {item.title || '-'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-400">
                            {dayjs(item.created_at).format('DD-MM-YYYY, HH:mm')}
                        </p>
                        {/* <button 
                            className="detail-button" 
                            onClick={() => toggleDetail(item.id)}
                        >
                            <i className="bx bx-dots-vertical-rounded text-2xl max-xs:text-xl" />
                        </button> */}
                    </div>
                </div>

                {/* Summary Info */}
                <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between">
                        <p className="text-gray-500 text-sm">Status Perubahan</p>
                        <p className="font-medium text-sm capitalize">
                            {beforeIsNull ? 'Baru Dibuat' : afterIsNull ? 'Dihapus' : 'Diperbarui'}
                        </p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-gray-500 text-sm">Tanggal</p>
                        <p className="font-medium text-sm">
                            {dayjs(item.created_at).format('DD-MM-YYYY')}
                        </p>
                    </div>
                </div>

                {/* Detail Section */}
                <div className={`overflow-hidden transition-all ease-in-out duration-300 mt-3 ${
                    detail === item.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                    <div className="border-t pt-3">
                        {/* Data Comparison Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* BEFORE */}
                            <div className="bg-gray-50 rounded-lg p-3">
                                <h5 className="font-semibold text-gray-700 text-sm mb-3 flex items-center">
                                    <i className="bx bx-left-arrow-alt text-base mr-2"></i>
                                    Data Sebelumnya
                                </h5>
                                {beforeIsNull ? (
                                    <div className="text-center py-4">
                                        {/* <i className="bx bx-plus-circle text-2xl text-gray-400 mb-2"></i> */}
                                        <p className="text-gray-400 text-sm italic">Data Baru</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <p className="text-gray-500 text-xs">Kode</p>
                                            <p className="font-medium text-xs">
                                                {item.data_before.kode || '-'}
                                            </p>
                                        </div>
                                        <div className="flex justify-between">
                                            <p className="text-gray-500 text-xs">Note</p>
                                            <p className="font-medium text-xs">
                                                {item.data_before.details.note_barang || '-'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* AFTER */}
                            <div className="bg-gray-50 rounded-lg p-3">
                                <h5 className="font-semibold text-gray-700 text-sm mb-3 flex items-center">
                                    <i className="bx bx-right-arrow-alt text-base mr-2"></i>
                                    Data Setelahnya
                                </h5>
                                {afterIsNull ? (
                                    <div className="text-center py-4">
                                        <i className="bx bx-trash text-2xl text-red-400 mb-2"></i>
                                        <p className="text-red-400 text-sm italic">Data Dihapus</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <p className="text-gray-500 text-xs">Kode</p>
                                            <p className="font-medium text-xs">
                                                {item.data_after.kode || '-'}
                                            </p>
                                        </div>
                                        <div className="flex justify-between">
                                            <p className="text-gray-500 text-xs">Note</p>
                                            <p className="font-medium text-xs">
                                                {item.data_after?.details?.[0]?.note_barang || '-'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center mt-4">
                    <button 
                        className="bg-slate-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-600 transition-colors duration-200"
                        onClick={() => toggleDetail(item.id)}
                    >
                        {detail === item.id ? 'Tutup Detail' : 'Lihat Detail'}
                    </button>
                </div>
            </div>
        </div>
    )
})

export default LogCards
