import React, { forwardRef, useState } from 'react';
import DateFormat from '../../../helper/DateFormatHelper';

const PurchaseOrderPRCards = forwardRef(({ item, goToCreate, goToDetail }, ref) => {
    const [isExpanded, setIsExpanded] = useState(null);
    const toggleExpansion = () => {
        setIsExpanded(!isExpanded);
    };
    
    const itemCount = item.details?.length || 0;

    return (
        <div className='rounded-2xl bg-white border px-5 py-3 mb-2 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200' ref={ref}>
            {/* Bagian Header (Selalu Terlihat) - Diambil dari PurchaseOrderCards */}
            <div className='flex justify-between items-center min-h-[64px]'>
                <div className='self-start py-1 space-y-1'>
                    <p className='flex font-bold text-lg sm:text-md capitalize items-center'>
                        {item.kode}
                    </p>
                    <p className='text-base pe-2'>
                        {DateFormat(item.tanggal)}
                    </p>
                    <div className={`max-h-max min-w-max max-w-max rounded-md border ${item.is_completed ? 'bg-green-50 border-green-400' : 'bg-amber-50 border-amber-400'}`} >
                        <p className={`py-1 px-2 flex gap-1 text-left items-center text-xs font-medium ${item.is_completed ? 'text-green-700' : 'text-amber-600'}`}>
                            <i className={`${item.is_completed ? 'bx bxs-check-circle' : 'bx bxs-time'}`}></i> 
                            { item.is_completed ? 'Selesai' : 'Belum selesai'}</p>
                    </div>
                </div>
                <button
                    className='px-2 py-1 detail-button self-center'
                    aria-expanded={isExpanded}
                    aria-label="Toggle details"
                    onClick={toggleExpansion}
                >
                    <i className={`bx bxs-chevron-down text-2xl text-gray-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>
            
            {/* Konten (Expandable) - Diambil dari PurchaseOrderCards */}
            <div
            className={`
                mt-2 transition-all duration-300 overflow-hidden
                ${isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}
            `}
            >
                <div className="space-y-2">

                    {/* Konten Detail 2 Kolom - Diisi dengan data dari PR */}
                    <div className="flex flex-col md:flex-row gap-x-10 gap-y-2 mb-4 text-sm">
                        
                        {/* Kolom Kiri */}
                        <div className="flex-1 space-y-2">
                            <div className="">
                                <p className='text-gray-500'>Note</p><p className='font-medium'>{item.note}</p>
                            </div>
                        </div>
                        
                        {/* Kolom Kanan */}
                        <div className="flex-1 space-y-2">
                            <div className="">
                                <p className='text-gray-500'>Kode MR</p><p className='font-medium'>{item.make_request?.kode}</p>
                            </div>
                        </div>

                    </div>

                    {/* Tombol Aksi Bawah - Diarahkan ke goToDetail */}
                    <div className="flex flex-col sm:flex-row py-2">
                        <button
                            className="flex justify-center items-center w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white  font-semibold rounded-lg transition-colors duration-200"
                            onClick={() => goToCreate(item.id)}
                        >
                            Buat Purchase Order <i className="bx bx-chevron-right text-lg"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default PurchaseOrderPRCards;