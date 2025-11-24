import React, { forwardRef, useEffect, useState } from 'react'
import DateFormat from '../../../helper/DateFormatHelper'

const LPBCards = forwardRef(({ item, goToUpdate, goToDetail, isList, goToCreate, desktop = false }, ref) => {
    const [detail, setDetail] = useState(null)
    const [open, setOpen] = useState(false)

    const infoPO = item?.purchase_order ?? {}
    const UpdatedBool = item.canBeUpdated ? 1 : 0
    const FullApprove = item.is_full_approval ? 1 : 0

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
        <div className="border-b items-center py-3 mx-4">
            <div className="self-start flex justify-between mb-1">
            <p className="flex font-bold text-xl capitalize items-center">{item.kode}</p>
            <button
                onClick={() => setOpen(!open)}
                className="inline-flex items-center justify-center w-9 h-9 border border-gray-300 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                title={open ? 'Hide Details' : 'Show Details'}
                aria-label={open ? 'Hide Details' : 'Show Details'}
                aria-expanded={open}
                type="button"
            >
                {open ? (
                <i className="bx bx-chevron-up text-3xl transition-transform duration-200" />
                ) : (
                <i className="bx bx-chevron-down text-3xl transition-transform duration-200" />
                )}
            </button>
            </div>
            

            {isList && (
            <div className="flex items-center justify-between ">
                <p className="font-semibold text-[16px] pe-2">{item.penerima}</p>
                <div
                className={`max-h-max min-w-max max-w-max rounded-md border ${
                    item.is_full_approval ? 'bg-green-50 border-green-400' : 'bg-amber-50 border-amber-400'
                }`}
                >
                <p
                    className={`py-1 px-2 flex gap-1 text-left items-center text-xs font-medium ${
                    item.is_full_approval ? 'text-green-700' : 'text-amber-600'
                    }`}
                >
                    <i className="bx bxs-time" />
                    {item.is_full_approval ? 'Sudah Disetujui' : 'Belum Disetujui'}
                </p>
                </div>
            </div>
            )}
        </div>
        

        {/* Info (first dropdown) */}
        {/* NOTE: increased max-h to allow dropdown content + buttons without clipping */}
        <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
            open ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0'
            }`}
            aria-hidden={!open}
        >
            {isList && (
            <div className="flex justify-end space-x-2 pr-4">
                {UpdatedBool ? (
                <button
                    className="w-fit px-5 py-2 update-button flex items-center text-sm gap-2"
                    onClick={() => goToUpdate(item.id)}
                    title="Update LPB"
                >
                    <h3>Update</h3>
                    <i className="bx bx-edit"></i>
                </button>
                ) : (
                <button
                    className={`w-fit px-5 py-2 flex items-center text-sm gap-2 rounded-md ${
                    FullApprove
                        ? 'bg-gray-400 text-white opacity-70 cursor-not-allowed'
                        : 'bg-gray-300 text-white opacity-70 cursor-not-allowed'
                    }`}
                    disabled
                >
                    Approved
                </button>
                )}
            </div>
            )}


            
            <div className="m-4 text-right space-y-2">
            <div className="flex justify-between">
                <p className="text-gray-500">Nama Suplier</p>
                <p className="font-medium capitalize">{item.nama_perusahaan}</p>
            </div>
            <div className="flex justify-between">
                <p className="text-gray-500">Keterangan</p>
                <p className="font-medium">{isList ? item.note : item.keterangan}</p>
            </div>
            <div className="flex justify-between">
                <p className="text-gray-500">Tanggal Penyerahan</p>
                <p className="font-medium">{DateFormat(item.tanggal)}</p>
            </div>
            <div className="flex justify-between">
                <p className="text-gray-500">Tgl Pembuatan Laporan</p>
                <p className="font-medium">{DateFormat(item.created_at)}</p>
            </div>
            </div>

            {/* Status + PO toggle */}
            {isList && (
            <div className="flex justify-between items-center mb-2 mx-4 gap-2">
                {!desktop && (
                <button
                    className={`flex w-auto items-center justify-between rounded-md border border-gray-300 px-4 py-1 text-left font-medium text-gray-700 transition-color duration-100 ${
                    detail === item.id ? 'bg-gray-50' : ''
                    }`}
                    onClick={() => toggleDetail(item.id)}
                >
                    <span>View Purchase Order</span>
                    {detail === item.id ? (
                    <i className="bx bx-chevron-up text-2xl" />
                    ) : (
                    <i className="bx bx-chevron-down text-2xl" />
                    )}
                </button>
                )}
                <div
                className={`max-h-max min-w-max max-w-max rounded-md border ${
                    item.is_full_approval ? 'bg-green-50 border-green-400' : 'bg-amber-50 border-amber-400'
                }`}
                >
                <p
                    className={`py-1 px-2 flex gap-1 text-left items-center text-xs font-medium ${
                    item.is_full_approval ? 'text-green-700' : 'text-amber-600'
                    }`}
                >
                    <i className="bx bxs-time" />
                    {item.is_full_approval ? 'Disetujui' : 'Belum Disetujui'}
                </p>
                </div>
            </div>
            )}

            {/* Purchase Order collapsing section (detail) */}
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
                        item.isCompletedPo ? 'bg-green-50 border-green-400' : 'bg-amber-50 border-amber-400'
                        }`}
                    >
                        <p
                        className={`py-1 px-2 flex gap-1 text-left items-center text-xs font-medium ${
                            item.isCompletedPo ? 'text-green-700' : 'text-amber-600'
                        }`}
                        >
                        <i className="bx bxs-check-circle text-sm" />
                        {item.isCompletedPo ? 'Purchase Order telah selesai' : 'Belum selesai'}
                        </p>
                    </div>
                    </div>
                </div>

                <div className="flex justify-between">
                    <p className="text-gray-500">Kode</p>
                    <p className="font-medium">{item.kodePO}</p>
                </div>
                <div className="flex justify-between">
                    <p className="text-gray-500">Note</p>
                    <p className="font-medium">{item.keterangan}</p>
                </div>
                <div className="flex justify-between">
                    <p className="text-gray-500">Tanggal</p>
                    <p className="font-medium">{item.tanggalPO}</p>
                </div>
                </div>
            )}
            </div>

            {/* Actions — inside first dropdown but outside PO collapse */}
            <div className="flex gap-2 py-2 px-2 mx-2 mb-2">
            {isList ? (
                <>
                <button
                    className="more-detail-button"
                    onClick={() => goToDetail(item.id)}
                    title="View Details"
                >
                    <h3>Lihat Detail</h3>
                    <i className="bx bx-chevron-right text-lg"></i>
                </button>
                </>
            ) : (
                <button
                                className="flex justify-center items-center w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white  font-semibold rounded-lg transition-colors duration-200 flex justify-end gap-2 mt-3"
                                onClick={() => goToCreate(item.id)}
                            >
                                Buat Pembelian 
                                <i className="bx bx-chevron-right text-lg"></i>
                            </button>
            )}
            </div>
        </div>
    </div>
    )
})

export default LPBCards
