import React, { forwardRef, useEffect, useState } from 'react'
import DateFormat from '../../../helper/DateFormatHelper'
import PriceFormat from '../../../helper/PriceFormatHelper'

const PurchaseOrderCards = forwardRef(({item, goToUpdate, goToDetail, canUpdate, desktop = false}, ref) => {
    const [isExpanded, setIsExpanded] = useState(null)
    const toggleExpansion = () => {
        setIsExpanded(!isExpanded);
    };

    const infoPR = item.purchase_request

    useEffect(() => {
        if (desktop) {
            setDetail((prevDetails) => prevDetails = item.id)
        }
    }, [desktop])
    
    const toggleDetail = (itemId) => {
        setDetail((prevDetails) => prevDetails === itemId ? null : itemId)
    }


    return (
        <div className='rounded-2xl bg-white border px-5 py-3 mb-2 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200' ref={ref}>
            <div className='flex justify-between items-center min-h-[64px]'>
                <div className='self-start py-1 space-y-1'>
                    <p className='flex font-bold text-lg sm:text-md capitalize items-center'>
                        {item.kode}
                    </p>
                    <p className='text-base pe-2'>
                        {DateFormat(item.tanggal)}
                    </p>
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center py-1 px-2 lg:py-1 lg:px-2 gap-1 text-xs lg:text-sm font-medium rounded-md border ${!item.is_completed? 'bg-amber-100 border-amber-500 text-amber-700': 'bg-green-100 border-green-500 text-green-700'}`}>
                            <i className="bx bxs-time"></i>
                            {!item.is_completed? 'Belum Selesai': 'Sudah Selesai'}
                        </div>
                        <div className={`flex items-center py-1 px-2 lg:py-1 lg:px-2 gap-1 text-xs lg:text-sm font-medium rounded-md border ${item.isApproved ? 'text-green-700 bg-green-100 border-green-500' :item.isRejected ? 'text-red-700 bg-red-100 border-red-500' : 'text-amber-700 bg-amber-100 border-amber-500'}`}>
                            {item.isApproved ? 'Approved' : item.isRejected ? 'Rejected' : 'Pending'}
                        </div>
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
            <div
            className={`
                mt-2 transition-all duration-500 overflow-hidden
                ${isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}
            `}
            >
                <div className="space-y-2">
                    <div className="flex justify-end space-x-2">
                        { (canUpdate && item.canBeUpdated) ? (
                            <button
                                className="w-fit px-5 py-2 update-button flex items-center text-sm gap-2"
                                onClick={() => goToUpdate(item.id)}
                                title="Update Request"
                            >
                                Update
                                <i className="bx bx-edit"></i>
                            </button>
                            )
                            :
                            (
                            <button
                                className="w-fit px-5 py-2 text-white bg-gray-800 rounded-lg disabled flex items-center text-sm gap-2"
                                title="Update Request"
                            >
                                LPB sudah dibuat
                            </button>
                            )
                        }

                    </div>
                   {/* Menggunakan flexbox untuk membuat 2 kolom independen */}
                    <div className="flex flex-col md:flex-row gap-x-10 gap-y-2 mb-4 text-sm">
                        
                        {/* Kolom Kiri */}
                        <div className="flex-1 space-y-2">
                            <div className="">
                                <p className='text-gray-500'>Supplier</p><p className='font-medium'>{item.suplier}</p>
                            </div>
                            <div className="">
                                <p className='text-gray-500'>Pembayaran</p><p className='font-medium'>{item.cara_pembayaran}</p>
                            </div>
                            <div className="">
                                <p className='text-gray-500'>Tgl. Penyerahan</p><p className='font-medium'>{DateFormat(item.tanggal_penyerahan)}</p>
                            </div>
                        </div>
                        
                        {/* Kolom Kanan */}
                        <div className="flex-1 space-y-2">
                            <div className="">
                                <p className='text-gray-500'>Kode PR</p><p className='font-medium'>{item.kodePR}</p>
                            </div>
                            <div className=""> {/* Menghapus 'gap-3' yg tidak perlu */}
                                <p className='text-gray-500'>Keterangan</p><p className='font-medium'>{item.keterangan}</p>
                            </div>
                            <div className="flex gap-10">
                                <p className='text-gray-500'>Biaya <p className='font-medium text-black'>{PriceFormat(item.harga)}</p></p>
                                { item.is_ppn !== 0 && (
                                    <>
                                        <p className='text-gray-500'>PPN <p className='font-medium text-amber-600'>{item.nilai_ppn}%</p> </p> 
                                        <p className='text-gray-500'>Biaya Akhir <p className='font-medium text-black'>{PriceFormat(item.harga_after_ppn)}</p> </p> 
                                    </>
                                    )
                                }
                            </div>
                        </div>

                    </div>
                    <div className="flex flex-col sm:flex-row py-2">
                        <button
                            className="flex justify-center items-center w-full px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors duration-200"
                            onClick={() => goToDetail(item.id)}
                        >
                            Lihat Detail <i className="bx bx-chevron-right text-lg"></i>
                        </button>
                    </div>
                </div>
            </div>
            {/* <div className={`flex ${infoPR ? 'justify-between' : 'justify-end'} items-center mb-2 mx-4 gap-2`}>
                { !desktop && infoPR &&
                    <button 
                    className={`flex w-auto items-center justify-between rounded-md border border-gray-300 px-4 py-1 text-left font-medium text-gray-700 transition-color duration-100 ${detail == item.id ? 'bg-gray-50' : ''}`} 
                    onClick={() => toggleDetail(item.id)}
                    >
                    <span>View Purchase Request</span>
                    {detail == item.id 
                        ? <i className='bx bx-chevron-up text-2xl'></i> 
                        : <i className='bx bx-chevron-down text-2xl'></i> 
                    }
                    </button>
                }
                
            </div> */}
            {/* { infoPR && 
                <div className={`overflow-hidden transition-all ease-in-out duration-300 rounded-lg mx-4 mb-2 ${detail === item.id ? 'max-h-[500px] py-3 border bg-gray-50' : 'max-h-0'}`}>
                    <div className="mx-3 text-right space-y-2 ">
                        <div className="flex gap-2 justify-between mb-3">
                            <p className='font-semibold text-left text-[16px]'>Purchase Request</p>
                            <div className='flex justify-end'>
                            <div className={`max-h-max max-w-max rounded-md border ${infoPR.is_completed ? 'bg-green-50 border-green-400' : 'bg-amber-50 border-amber-400'}`} >
                                <p className={`py-1 px-2 flex gap-1 text-left items-center text-xs font-medium ${infoPR.is_completed ? 'text-green-700' : 'text-amber-600'}`}>
                                    <i className='bx bxs-check-circle text-sm'></i>
                                    { infoPR.is_completed ? 'Purchase request telah selesai' : 'Belum selesai'}
                                </p>
                            </div>
                        </div>
                        </div>
                        <div className="flex justify-between">
                            <p className='text-gray-500'>Kode</p><p className='font-medium'>{infoPR.kode}</p>
                        </div>
                        <div className="flex justify-between">
                            <p className='text-gray-500'>Tanggal</p><p className='font-medium'>{DateFormat(infoPR.tanggal)}</p>
                        </div>
                        <div className="flex justify-between">
                            <p className='text-gray-500'>Note</p><p className='font-medium'>{infoPR.note}</p>
                        </div>
                    </div>
                </div>
            } */}
        </div>
    )
})

export default PurchaseOrderCards;