import React, { forwardRef } from 'react';
import DateFormat from '../../../helper/DateFormatHelper';

const PurchaseOrderPRCards = forwardRef(({ item, goToCreate, goToDetail }, ref) => {
    const itemCount = item.details?.length || 0;

    return (
        <div
            className="rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col justify-between min-h-[200px]"
            ref={ref}
        >
            {/* Header Section */}
            <div className='grid grid-cols-3 justify-between mb-3 border-b items-center justify-center pb-2'>
                <h3 className='col-start-1 col-span-2 font-bold text-xl capitalize'>
                    {item.kode}
                </h3>
                <h3 className='row-start-2 col-span-3 font-medium text-lg capitalize self-start'>
                    {DateFormat(item.tanggal)}
                </h3>
                <button
                    className='detail-button col-start-3 justify-self-end'
                    onClick={() => goToDetail(item.id)}
                    title="View Details"
                >
                    <i className="bx bx-dots-vertical-rounded text-2xl group-hover:text-gray-800 transition-all duration-200" />
                </button>
            </div>

            {/* Content Section */}
            <div className='flex-1 space-y-2 mb-4'>
                <div className="flex justify-between items-start">
                    <span className="text-gray-500">Note</span>
                    <p className='font-medium text-right max-w-[60%] break-words'>
                        {item.note}
                    </p>
                </div>
            </div>
            <div className={`max-w-max flex self-end rounded-md border mb-2 ${item.is_completed ? 'bg-green-50 border-green-400' : 'bg-amber-50 border-amber-400'}`} >
                <p className={`py-1 px-4 text-xs font-medium ${item.is_completed ? 'text-green-700' : 'text-amber-600'}`}>{item.is_completed ? 'Selesai' : 'Belum selesai' }</p>
            </div>

            {/* Action Buttons Section */}
            <div className='flex justify-end gap-2 mt-3'>
                <button
                    className="px-3 py-1.5 purchase-button cursor-not-allowed"
                    onClick={() => goToCreate(item.id)}
                    disabled
                >
                    Create Purchase Order
                </button>
            </div>
        </div>
    );
});

export default PurchaseOrderPRCards;
