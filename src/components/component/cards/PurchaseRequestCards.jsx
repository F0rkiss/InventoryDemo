import React, { forwardRef } from 'react';
import DateFormat from '../../../helper/DateFormatHelper';

const PurchaseRequestCards = forwardRef(
    ({ item, goToPR, goToDetail, isList = false }, ref) => {
        const itemCount = item.details?.length || 0;
        const PO = item.purchase_orders?.length;
          

        return (
        <div
            className="rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col justify-between min-h-[200px]"
            ref={ref}
        >
            {/* Header Section */}
            <div className="grid grid-cols-3 justify-between mb-3 border-b items-center pb-2">
            <h3 className="col-start-1 col-span-2 font-bold text-xl capitalize">
                {item.kode}
            </h3>
            <h3 className="row-start-2 col-span-3 font-medium text-lg capitalize self-start">
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
            <div className="flex-1 space-y-2">
            <div className="flex justify-between items-start">
                <span className="text-gray-500">Employee</span>
                <p className="font-medium text-right max-w-[60%] break-words">
                {item.user?.EmpName}
                </p>
            </div>

            {isList ? (
                <>
                <div className="flex justify-between items-start">
                    <span className="text-gray-500">Note</span>
                    <p className="font-medium text-right max-w-[60%] break-words">
                    {item.note}
                    </p>
                </div>
                <div className="flex justify-between items-start">
                    <span className="text-gray-500">Latest Update</span>
                    <p className="font-medium text-right max-w-[60%] break-words">
                        {DateFormat(item.updated_at)}
                    </p>
                </div>
                </>
            ) : (
                <>
                <div className="flex justify-between items-start">
                    <span className="text-gray-500">Type Request</span>
                    <p className="font-medium text-right max-w-[60%] break-words">
                    {item.type_request?.name}
                    </p>
                </div>
                <div className="flex justify-between items-start">
                    <span className="text-gray-500">Jenis</span>
                    <p className="font-medium text-right max-w-[60%] break-words">
                    {item.type_request?.jenis}
                    </p>
                </div>
                </>
            )}
            </div>

            {/* Action Buttons Section */}
            {isList ? (
            PO === 0  ? (
                <div className="flex justify-end gap-2 pt-3 mt-3">
                <button
                    className="px-3 py-1.5 update-button"
                    onClick={() => goToPR(item.id)}
                >
                    Edit
                </button>
                </div>
            ) : (
                <div className="flex justify-end gap-2 pt-3 mt-3">
                <button
                    className="px-3 py-1.5 rounded-md bg-gray-400 text-white opacity-70 cursor-not-allowed"
                    disabled
                >
                    Sudah Masuk Purchase Order
                </button>
                </div>
            )
            ) : (
            <div className="flex justify-end gap-2 pt-3 mt-3">
                <button
                className="px-3 py-1.5 purchase-button"
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
