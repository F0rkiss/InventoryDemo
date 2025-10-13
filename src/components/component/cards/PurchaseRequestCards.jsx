import React, { forwardRef } from 'react';
import DateFormat from '../../../helper/DateFormatHelper';
import InfoRow from '../infoRow';

const PurchaseRequestCards = forwardRef(
    ({ item, goToPR, goToDetail, isList = false }, ref) => {
        const itemCount = item.details?.length || 0;
        const Update = item.canBeUpdated;
        const POLength =  item.purchase_orders?.length;

        return (
            <div
                className="rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col justify-between min-h-[200px] w-full"
                ref={ref}
            >
                {/* Header Section */}
                <div className="grid grid-cols-3 justify-between mb-3 border-b items-center pb-2 sm:grid-cols-3 grid-cols-2">
                    <h3 className="col-start-1 col-span-2 font-bold text-lg sm:text-xl capitalize break-words">
                        {item.kode}
                    </h3>
                    <h3 className="row-start-2 col-span-3 font-medium text-base sm:text-lg capitalize self-start text-gray-600">
                        {DateFormat(item.tanggal)}
                    </h3>

                    {isList ? (
                        <button
                            className="detail-button col-start-3 justify-self-end"
                            onClick={() => goToDetail(item.id)}
                            title="View Details"
                        >
                            <i className="bx bx-dots-vertical-rounded text-2xl group-hover:text-gray-800 transition-all duration-200" />
                        </button>
                    ) : (
                        <div></div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 space-y-2 text-sm sm:text-base">
                    {isList ? (
                        <>
                            <div className="flex justify-between items-start flex-wrap">
                                <span className="text-gray-500 w-1/2 sm:w-auto">Employee</span>
                                <p className="font-medium text-right max-w-[60%] break-words w-1/2 sm:w-auto">
                                    {item.EmpName}
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
                                    <p
                                        className={`flex w-fit ml-auto py-2 px-3 items-center text-xs sm:text-sm text-center gap-1 rounded-md font-medium ${
                                            Update === true || POLength === 0  
                                                ? 'text-amber-700 bg-amber-100 border border-amber-500'
                                                : 'text-green-700 bg-green-100 border border-green-500'
                                        }`}
                                    >
                                        {Update === true || POLength === 0  
                                            ? 'Belum Masuk Purchase Order'
                                            : 'Sudah Masuk Purchase Order'}
                                    </p>
                        </>
                    ) : (
                        <>
                        <div className="flex justify-between items-start flex-wrap">
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

                {/* Action Buttons Section */}
                {isList ? (
                    Update === true || POLength === 0  ? (
                        <div className="flex justify-end gap-2 pt-3 mt-3">
                            <button
                                className="px-3 py-1.5 update-button text-sm sm:text-base"
                                onClick={() => goToPR(item.id)}
                            >
                                Update
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-end gap-2 pt-3 mt-3">
                            <button
                                className="px-3 py-1.5 rounded-md bg-gray-400 text-white opacity-70 cursor-not-allowed text-sm sm:text-base"
                                disabled
                            >
                                Sudah Masuk Purchase Order
                            </button>
                        </div>
                    )
                ) : (
                    <div className="flex justify-end gap-2 pt-3 mt-3">
                        <button
                            className="px-3 py-1.5 purchase-button text-sm sm:text-base"
                            onClick={() => goToPR(item.id)}
                        >
                            Make Purchase
                        </button>
                    </div>
                )}
            </div>
        );
    }
);

export default PurchaseRequestCards;
