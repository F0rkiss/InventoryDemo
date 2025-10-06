import React, { forwardRef, useEffect, useState } from 'react'
import DateFormat from '../../../helper/DateFormatHelper'
// import PriceFormat from '../../../helper/PriceFormatHelper'

const LPBCards = forwardRef(({ item, goToUpdate, goToDetail,isList, goToCreate, desktop = false }, ref) => {
    const [detail, setDetail] = useState(null)

    const infoPO = item?.purchase_order ?? {}
    const infoPR = item?.purchase_request ?? item?.purchase_order?.purchase_request ?? {}
    const UpdatedBool = item.canBeUpdated ? 1 : 0 ;
    const FullApprove = item.is_full_approval ? 1 : 0 ;


    useEffect(() => {
        if (desktop) setDetail(null)
    }, [desktop])


    const toggleDetail = (itemId) => {
        setDetail((prevDetails) => (prevDetails === itemId ? null : itemId))
    }

    return (
        <div
        className="rounded-lg bg-white border mb-2 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200"
        ref={ref}
        >
        {/* Header */}
        <div className="border-b flex justify-between items-center py-3 mx-4 min-h-[64px]">
            <div className="self-start py-1 space-y-1">
            <p className="flex font-bold text-xl capitalize items-center">{item.kode}</p>
            <div className="flex">
                <p className="font-semibold text-[16px] pe-2">{item.penerima}</p>
            </div>
            </div>
            {isList ?
            <button className="detail-button max-w-full overflow-hidden" onClick={() => goToDetail(item.id)}>
                <i className="bx bx-dots-vertical-rounded text-2xl max-xs:text-xl" />
            </button>
            : 
            <></>
            }
        </div>

        {/* Info */}
        <div className="m-4 text-right space-y-2">
            {/* <div className="flex justify-between">
            <p className="text-gray-500">Penerima </p>
            <p className="font-medium">{item.penerima}</p>
            </div> */}
            <div className="flex justify-between">
                <p className="text-gray-500">Pembayaran</p>
                <p className="font-medium capitalize">{(isList ? infoPO.cara_pembayaran : item.cara_pembayaran )}</p>
            </div>
            <div className="flex justify-between">
                <p className="text-gray-500">Keterangan</p>
                <p className="font-medium">{(isList ? item.note : item.keterangan)}</p>
            </div>
            {/* <div className="flex justify-between">
                <p className="text-gray-500">Keterangan</p>
                <p className="font-medium">{item.keterangan}</p>
            </div> */}
            <div className="flex justify-between">
                <p className="text-gray-500">Tanggal Penyerahan</p>
                <p className="font-medium">{DateFormat(item.tanggal)}</p>
            </div>
            <div className="flex justify-between">
                <p className="text-gray-500">Tgl Pembuatan Laporan</p>
                <p className="font-medium">{DateFormat(item.created_at)}</p>
            </div>
        </div>
            
        {/* Status + Toggle Button */}
         { isList ? 
        <div className="flex justify-between items-center mb-2 mx-4 gap-2">
            {!desktop && infoPR && (
            <button
                className={`flex w-auto items-center justify-between rounded-md border border-gray-300 px-4 py-1 text-left font-medium text-gray-700 transition-color duration-100 ${
                detail === item.id ? 'bg-gray-50' : ''
                }`}
                onClick={() => toggleDetail(item.id)}
            >
                <span>View Purchase Order</span>
                {detail === item.id ? (
                <i className="bx bx-chevron-up text-2xl"></i>
                ) : (
                <i className="bx bx-chevron-down text-2xl"></i>
                )}
            </button>
            )}
            <div className={`max-h-max min-w-max max-w-max rounded-md border ${item.is_full_approval ? 'bg-green-50 border-green-400' : 'bg-amber-50 border-amber-400'}`}>
            <p className={`py-1 px-2 flex gap-1 text-left items-center text-xs font-medium ${item.is_full_approval ? 'text-green-700' : 'text-amber-600'}`}>
                <i className="bx bxs-time"></i>
                {item.is_full_approval ? 'Disetujui' : 'Belum Disetujui'}
            </p>
            </div>
        </div>
        : <></> }

        <div
            className={`overflow-hidden transition-all ease-in-out duration-300 rounded-lg mx-4 mb-2 ${
            detail === item.id ? 'max-h-[500px] py-3 border bg-gray-50' : 'max-h-0'
            }`}
        >
            
                {infoPO && (
                <div className="mx-3 text-right space-y-2 ">
                    <div className="flex gap-2 justify-between mb-3">
                    <p className="font-semibold text-left text-[16px]">Purchase Order</p>
                    <div className="flex justify-end">
                        <div
                        className={`max-h-max max-w-max rounded-md border ${
                            infoPO.is_completed ? 'bg-green-50 border-green-400' : 'bg-amber-50 border-amber-400'
                        }`}
                        >
                        <p
                            className={`py-1 px-2 flex gap-1 text-left items-center text-xs font-medium ${
                            infoPO.is_completed ? 'text-green-700' : 'text-amber-600'
                            }`}
                        >
                            <i className="bx bxs-check-circle text-sm"></i>
                            {infoPO.is_completed ? 'Purchase Order telah selesai' : 'Belum selesai'}
                        </p>
                        </div>
                    </div>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-gray-500">Kode</p>
                        <p className="font-medium">{infoPO.kode}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-gray-500">Note</p>
                        <p className="font-medium">{infoPO.keterangan}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-gray-500">Tanggal</p>
                        <p className="font-medium">{DateFormat(infoPO.tanggal)}</p>
                    </div>
                </div>
                )}
        </div>

        {/* Actions */}
        {isList ? (
                UpdatedBool ? (
                    <div className="flex gap-2 py-2 px-2 mx-2 mb-2">
                    <button
                        className="px-3 py-1.5 update-button"
                        onClick={() => goToUpdate(item.id)}
                    >
                        Update
                    </button>
                    </div>
                ) : (
                    ( FullApprove ? 
                        (
                        <div className="flex gap-2 py-2 px-2 mx-2 mb-2">
                        <button
                            className="px-3 py-1.5 rounded-md bg-gray-400 text-white opacity-70 cursor-not-allowed"
                            disabled
                        >
                            Full Approved
                        </button>
                        </div>
                        ) : (
                            <div className="flex gap-2 py-2 px-2 mx-2 mb-2">
                            <button
                                className="px-3 py-1.5 rounded-md bg-gray-400 text-white opacity-70 cursor-not-allowed"
                                disabled
                            >
                                Approve oleh lebih dari 1 orang
                            </button>
                            </div> 
                        )
                    )
                )
            ) : (
            <div className="flex gap-2 py-2 px-2 mx-2 mb-2">
                <button
                    className="px-3 py-1.5 update-button"
                    onClick={() => {
                        // console.log("Klik Buat Laporan:", item.id)
                        goToCreate(item.id)
                    }}
                    >
                    Buat Laporan
                </button>
            </div>
            )}
        </div>
    )
})

export default LPBCards
