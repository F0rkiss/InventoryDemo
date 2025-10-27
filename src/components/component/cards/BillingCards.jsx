import React, { forwardRef, useEffect, useState } from 'react'
import DateFormatToIDN from '../../../helper/DateFormatHelper';
import PriceFormat from '../../../helper/PriceFormatHelper';

const BillingCards = forwardRef(({goToUpdate, goToDetail, deleteItems, item, restore = false, className, desktop = false, canDelete, canUpdate}, ref) => {
    const [detail, setDetail] = useState(null);

    useEffect(() => {
        if (desktop) {
            setDetail((prevDetails) => prevDetails = item.id);
        }
    }, [desktop]);

    const toggleDetail = (itemId) => {
        setDetail((prevDetails) => prevDetails === itemId ? null : itemId);
    };

    return (
        <div className='rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col justify-between min-h-[200px]' ref={ref}>
            {/* Header Section */}
            <div className='flex justify-between mb-3 border-b items-center pb-3'>
                <h3 className='font-bold text-xl capitalize leading-tight'>
                    {item.user.EmpName || item.username || 'User Tidak Ada'}
                </h3>
                <button
                className=' detail-button'
                onClick={() => goToDetail(item.id)}
                >
                <i className="bx bx-dots-vertical-rounded text-2xl max-xs:text-xl" />
                </button>
            </div>

            {/* Content Section */}
            <div className='flex-1 space-y-2'>
                <div className="flex justify-between items-start">
                    <span className="text-gray-500">Penanggung Jawab</span>
                    <p className={`text-sm capitalize font-medium text-right`}>
                        {item.penanggungJawab}
                    </p>
                </div>
                <div className="flex justify-between items-start">
                    <span className="text-gray-500">Biaya</span>
                    <p className={`text-sm capitalize font-medium text-right`}>
                        {PriceFormat(item.biaya)}
                    </p>
                </div>
                <div className="flex justify-between items-start">
                    <span className="text-gray-500">Status</span>
                    <p className={`text-sm capitalize font-medium text-right ${item.status === 'aktif' ? 'text-green-500' : 'text-red-500'}`}>
                        {item.status}
                    </p>
                </div>
                <div className="flex justify-between items-start">
                    <span className="text-gray-500">Note</span>
                    <p className={`text-sm capitalize font-medium text-right`}>
                        {item.note || 'Tidak ada catatan'}
                    </p>
                </div>
                <div className="flex justify-between items-start">
                    <span className="text-gray-500">Tgl. Dibuat</span>
                    <p className="text-sm font-medium text-gray-800 text-right max-w-[60%] break-words">
                        {DateFormatToIDN(item.tanggal_berlangganan, false)}
                    </p>
                </div>
            </div>

            {/* Action Buttons Section */}
            <div className='flex justify-end gap-2 pt-3 mt-3'>
                {canUpdate && (
                    <button
                        className="px-3 py-1.5 update-button text-sm"
                        onClick={() => goToUpdate(item.id)}
                    >
                        Update
                    </button>
                )}
                {canDelete && (
                    <button
                        onClick={() => deleteItems(item.id, item.name)}
                        className="px-3 py-1.5 delete-button text-sm"
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
});

export default BillingCards;
