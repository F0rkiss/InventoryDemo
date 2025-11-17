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
                className="mb-3 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-3 flex flex-col justify-between min-h-[100px] w-full"
                ref={ref}
            >
                {/* Header Section */}
                <div className="mb-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg sm:text-xl capitalize">
                            {item.kode}
                        </h3>
                        <button
                            onClick={() => setOpen(!open)}
                            className="inline-flex items-center justify-center w-9 h-9 border border-gray-300 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                            title={open ? 'Hide Details' : 'Show Details'}
                            aria-label={open ? 'Hide Details' : 'Show Details'}
                            aria-expanded={open}
                            type="button"
                        >
                            {open ? (
                                <i className="bx bx-chevron-up text-3xl transition-transform duration-200"></i>
                            ) : (
                                <i className="bx bx-chevron-down text-3xl transition-transform duration-200"></i>
                            )}
                        </button>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <h3 className="font-medium text-gray-600 text-sm sm:text-lg capitalize">
                            {DateFormat(item.tanggal)}
                        </h3>

                        {isList && (
                            <div
                                className={`max-h-max min-w-max max-w-max rounded-md border ${
                                    !item.is_completed
                                        ? 'bg-amber-50 border-amber-400'
                                        : 'bg-green-50 border-green-400'
                                }`}
                            >
                                <p
                                    className={`py-1 px-2 flex items-center gap-1 text-xs font-medium ${
                                        !item.is_completed
                                            ? 'text-amber-600'
                                            : 'text-green-700'
                                    }`}
                                >
                                    <i className="bx bxs-time"></i>
                                    {!item.is_completed
                                        ? 'Belum Selesai'
                                        : 'Sudah Selesai'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                    aria-hidden={!open}
                >
                    {isList && (
                        <div className="flex justify-end space-x-2">
                            {Update === true || POLength === 0 ? (
                            <button
                                className="w-fit px-5 py-2 update-button flex items-center text-sm gap-2"
                                onClick={() => goToUpdate(item.id)}
                                title="Update PR"
                            >
                                <h3>Update</h3>
                                <i className="bx bx-edit"></i>
                            </button>
                            ) : (
                            <button
                                className="w-fit px-5 py-2 bg-gray-400 text-white opacity-70 cursor-not-allowed flex items-center text-sm gap-2 rounded"
                                disabled
                            >
                                Sudah Masuk Purchase Order
                            </button>
                            )}
                        </div>
                        )}

                    <div className="flex-1 space-y-2 text-sm sm:text-base">
                        {isList ? (
                            <>
                                <div className="flex pt-3  justify-between items-start flex-wrap">
                                    <span className="text-gray-500 w-1/2 sm:w-auto">Employee</span>
                                    <p className="font-medium text-right max-w-[60%] break-words w-1/2 sm:w-auto">
                                        {item.EmpName }
                                    </p>
                                </div>
                                <div className="flex justify-between items-start flex-wrap">
                                    <span className="text-gray-500 w-1/2 sm:w-auto">Note</span>
                                    <p className="font-medium text-right max-w-[60%] break-words w-1/2 sm:w-auto">
                                        {item.note}
                                    </p>
                                </div>
                                <div className="flex justify-between items-start flex-wrap">
                                    <span className="text-gray-500 w-1/2 sm:w-auto">Latest Update</span>
                                    <p className="font-medium text-right max-w-[60%] break-words w-1/2 sm:w-auto">
                                        {DateFormat(item.updated_at)}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex pt-3 border-t justify-between items-start flex-wrap">
                                    <span className="text-gray-500 w-1/2 sm:w-auto">Employee</span>
                                    <p className="font-medium text-right max-w-[60%] break-words w-1/2 sm:w-auto">
                                        {item.user?.EmpName}
                                    </p>
                                </div>
                                <div className="flex justify-between items-start flex-wrap">
                                    <span className="text-gray-500 w-1/2 sm:w-auto">Type Request</span>
                                    <p className="font-medium text-right max-w-[60%] break-words w-1/2 sm:w-auto">
                                        {item.type_request?.name}
                                    </p>
                                </div>
                                <div className="flex justify-between items-start flex-wrap">
                                    <span className="text-gray-500 w-1/2 sm:w-auto">Jenis</span>
                                    <p className="font-medium text-right max-w-[60%] break-words w-1/2 sm:w-auto">
                                        {item.type_request?.jenis}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                    
                    {isList ? (
                            <div className="flex justify-end gap-2 mt-3">
                                <button
                                className="more-detail-button"
                                onClick={() => goToDetail(item.id)}
                                title="View Details"
                                >
                                <h3>Lihat Detail</h3>
                                <i className="bx bx-chevron-right text-lg"></i>
                            </button>
                            </div>
                            
                    ) : (
                        <div className="flex justify-end gap-2 mt-3">
                            <button
                                className="flex justify-center items-center w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white  font-semibold rounded-lg transition-colors duration-200"
                                onClick={() => goToCreate(item.id)}
                            >
                                Buat Pembelian 
                                <i className="bx bx-chevron-right text-lg"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

export default PurchaseRequestCards;
