import React, { forwardRef, useState } from 'react';
import DateFormat from '../../../helper/DateFormatHelper';

const PurchaseRequestCards = forwardRef(
    ({ item, goToUpdate, goToDetail, goToCreate, isList = false }, ref) => {
        const [open, setOpen] = useState(false);
        const itemCount = item.details?.length || 0;
        const Update = item.canBeUpdated;
        const POLength = item.purchase_orders?.length;

        return (
            <div
                className="rounded-2xl bg-white border px-5 py-3 mb-2 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200"
                ref={ref}
            >
                {/* Header Section */}
                <div className='flex justify-between items-center min-h-[64px]'>
                    <div className='self-start py-1 space-y-1'>
                        <p className='flex font-bold text-lg sm:text-md capitalize items-center'>
                            {item.kode}
                        </p>
                        <p className='text-base pe-2'>
                            {DateFormat(item.tanggal)}
                        </p>
                        {isList && (
                            <div className="flex items-center gap-2">
                                <div className={`flex items-center py-1 px-2 lg:py-1 lg:px-2 gap-1 text-xs lg:text-sm font-medium rounded-md border ${!item.is_completed? 'bg-amber-100 border-amber-500 text-amber-700': 'bg-green-100 border-green-500 text-green-700'}`}>
                                    <i className="bx bxs-time"></i>
                                    {!item.is_completed? 'Belum Selesai': 'Sudah Selesai'}
                                </div>
                                <div className={`flex items-center py-1 px-2 lg:py-1 lg:px-2 gap-1 text-xs lg:text-sm font-medium rounded-md border ${item.isApproved ? 'text-green-700 bg-green-100 border-green-500' :item.isRejected ? 'text-red-700 bg-red-100 border-red-500' : 'text-amber-700 bg-amber-100 border-amber-500'}`}>
                                    {item.isApproved ? 'Approved' : item.isRejected ? 'Rejected' : 'Pending'}
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setOpen(!open)}
                        className='px-2 py-1 detail-button self-center'
                        title={open ? 'Hide Details' : 'Show Details'}
                        aria-label={open ? 'Hide Details' : 'Show Details'}
                        aria-expanded={open}
                        type="button"
                    >
                        <i className={`bx bxs-chevron-down text-2xl text-gray-600 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Content Section */}
                <div
                    className={`mt-2 transition-all duration-500 overflow-hidden ${open ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}
                    aria-hidden={!open}
                >
                    <div className="space-y-2">
                    {isList && (
                        <div className="flex justify-end space-x-2">
                            {Update === true || POLength === 0 ? (
                            <button
                                className="w-fit px-5 py-2 update-button flex items-center text-sm gap-2"
                                onClick={() => goToUpdate(item.id)}
                                title="Update PR"
                            >
                                Update
                                <i className="bx bx-edit"></i>
                            </button>
                            ) : (
                            <button
                                className="w-fit px-5 py-2 text-white bg-gray-800 rounded-lg disabled flex items-center text-sm gap-2"
                            >
                                Sudah Masuk Purchase Order
                            </button>
                            )}
                        </div>
                        )}

                    <div className="flex flex-col md:flex-row gap-x-10 gap-y-2 mb-4 text-sm">
                        {isList ? (
                            <>
                                {/* Kolom Kiri */}
                                <div className="flex-1 space-y-2">
                                    <div className="">
                                        <p className='text-gray-500'>Employee</p>
                                        <p className="font-medium">{item.EmpName}</p>
                                    </div>
                                    <div className="">
                                        <p className='text-gray-500'>Note</p>
                                        <p className="font-medium">{item.note}</p>
                                    </div>
                                </div>
                                {/* Kolom Kanan */}
                                <div className="flex-1 space-y-2">
                                    <div className="">
                                        <p className='text-gray-500'>Latest Update</p>
                                        <p className="font-medium">{DateFormat(item.updated_at)}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Kolom Kiri */}
                                <div className="flex-1 space-y-2">
                                    <div className="">
                                        <p className='text-gray-500'>Employee</p>
                                        <p className="font-medium">{item.user?.EmpName}</p>
                                    </div>
                                    <div className="">
                                        <p className='text-gray-500'>Type Request</p>
                                        <p className="font-medium">{item.type_request?.name}</p>
                                    </div>
                                </div>
                                {/* Kolom Kanan */}
                                <div className="flex-1 space-y-2">
                                    <div className="">
                                        <p className='text-gray-500'>Jenis</p>
                                        <p className="font-medium">{item.type_request?.jenis}</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    
                    {isList ? (
                            <div className="flex flex-col sm:flex-row py-2">
                                <button
                                    className="flex justify-center items-center w-full px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors duration-200"
                                    onClick={() => goToDetail(item.id)}
                                    title="View Details"
                                >
                                    Lihat Detail <i className="bx bx-chevron-right text-lg"></i>
                                </button>
                            </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row py-2">
                            <button
                                className="flex justify-center items-center w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors duration-200"
                                onClick={() => goToCreate(item.id)}
                            >
                                Buat Pembelian <i className="bx bx-chevron-right text-lg"></i>
                            </button>
                        </div>
                    )}
                    </div>
                </div>
            </div>
        );
    }
);

export default PurchaseRequestCards;
