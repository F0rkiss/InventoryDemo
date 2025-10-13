import React, { forwardRef, useEffect, useState } from 'react'
import DateFormat from '../../../helper/DateFormatHelper'
import PriceFormat from '../../../helper/PriceFormatHelper'
import { info } from 'autoprefixer'

const PurchaseOrderCards = forwardRef(({item, goToUpdate, goToDetail, canUpdate, desktop = false}, ref) => {

    const [detail, setDetail] = useState(null)
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
        <div className='rounded-lg bg-white border mb-2 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200' ref={ref}>
            <div className='border-b flex justify-between items-center py-3 mx-4 min-h-[64px]'>
                <div className='self-start py-1 space-y-1'>
                    <p className='flex font-bold text-lg lg:text-xl capitalize items-center'>
                        {item.kode}
                    </p>
                    <div className='flex'>
                        <p className='font-semibold text-[16px] pe-2'>
                            {PriceFormat(item.harga)}
                        </p>
                        
                        {/* <p className='font-regular text-md ps-2'>
                            {item.email}
                        </p> */}
                    </div>
                </div>
                <button
                className=' detail-button'
                onClick={() => goToDetail(item.id)}
                >
                <i className="bx bx-dots-vertical-rounded text-2xl max-xs:text-xl" />
                </button>
            </div>
            <div className="m-4 text-right space-y-2">
                <div className="flex justify-between">
                    <p className='text-gray-500'>Kode Supplier</p><p className='font-medium'>{item.kode_suplier}</p>
                </div>
                <div className="flex justify-between">
                    <p className='text-gray-500'>Pembayaran</p><p className='font-medium'>{item.cara_pembayaran}</p>
                </div>
                <div className="flex justify-between overflow-hidden gap-3">
                    <p className='text-gray-500'>Alamat</p><p className='font-medium'>{item.alamat}</p>
                </div>
                <div className="flex justify-between gap-3">
                    <p className='text-gray-500'>Keterangan</p><p className='font-medium'>{item.keterangan}</p>
                </div>
                <div className="flex justify-between">
                    <p className='text-gray-500'>Tanggal</p><p className='font-medium'>{DateFormat(item.tanggal)}</p>
                </div>
                <div className="flex justify-between">
                    <p className='text-gray-500'>Tgl. Penyerahan</p><p className='font-medium'>{DateFormat(item.tanggal_penyerahan)}</p>
                </div>
            </div>
            <div className={`flex ${infoPR ? 'justify-between' : 'justify-end'} items-center mb-2 mx-4 gap-2`}>
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
                <div className={`max-h-max min-w-max max-w-max rounded-md border ${item.is_completed ? 'bg-green-50 border-green-400' : 'bg-amber-50 border-amber-400'}`} >
                    <p className={`py-1 px-2 flex gap-1 text-left items-center text-xs font-medium ${item.is_completed ? 'text-green-700' : 'text-amber-600'}`}>
                        <i className={`${item.is_completed ? 'bx bxs-check-circle' : 'bx bxs-time'}`}></i> 
                        { item.is_completed ? 'Selesai' : 'Belum selesai'}</p>
                </div>
            </div>
            { infoPR && 
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
            }
            <div className='flex gap-2 py-2 px-2 mx-2 mb-2'>
                { canUpdate &&
                    <button
                    className="px-3 py-1.5 update-button"
                    onClick={() => goToUpdate(item.id)}
                    >
                    <p>Update</p>
                    </button>
                }
                {/* { canDelete &&
                    <button
                    className={`px-3 py-1.5 ${item.canBeDeleted ? 'delete-button' : 'bg-gray-200 rounded-md text-gray-400'}`} 
                    onClick={() => handleDeleteClick(item.id)}
                    >
                    <p>Delete</p>
                    </button>
                } */}
            </div>
        </div>
    )
})

export default PurchaseOrderCards;