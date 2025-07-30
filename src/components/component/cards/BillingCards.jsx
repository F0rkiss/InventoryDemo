import React, { forwardRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import avatar from '../../../assets/image/gambar/Profile_avatar_placeholder_large.png'
import DateFormatToIDN from '../../../helper/DateFormatHelper'


const BillingCards = forwardRef(({goToUpdate, goToDetail, deleteItems ,item, restore = false, className, desktop = false, canDelete, canUpdate}, ref) => {

    const [detail, setDetail] = useState(null)

    useEffect(() => {
        if (desktop) {
            setDetail((prevDetails) => prevDetails = item.id)
        }
    }, [desktop])
    
    const toggleDetail = (itemId) => {
        setDetail((prevDetails) => prevDetails === itemId ? null : itemId)
    }

    return (
        <div className={`bg-white mb-3 rounded-md shadow-sm ${className}`} ref={ref}>
            <div className="content p-2">
                <div className={`upper-content flex max-h-12 items-center`}>
                            <img src={avatar} className='max-w-8 max-h-8 rounded-full' />
                            <div className="text ms-3">
                                <div>
                                <p className='capitalize font-bold text-sm'>{item.user.EmpName || item.username || 'User Tidak Ada'}</p>
                                <p></p>
                                </div>
                                <p className='text-xs'>{item.user?.department?.divisi?.kode || item.divisiKode}</p>
                            </div> 
                            { !restore && 
                            <button className='bg-slate-200 rounded-full w-24 ml-auto text-xs items-center flex justify-center text-red-500' onClick={() => deleteItems(item.id)}>
                                <i className='bx bxs-trash text-base'></i>
                                <p className='ms-1 font-semibold'>Delete</p>
                            </button>
                            }
                </div>
                <div className={`lower-content transition-all ease-in-out duration-1000 ${detail === item.id} overflow-hidden my-1`}>
                    <div className="grid grid-cols-2 mt-2">
                        <div className="border-b text-center pb-2">
                            <p className='text-xs text-gray-400'>Penanggung Jawab</p>
                            <p className='text-sm capitalize overflow-hidden whitespace-nowrap text-ellipsis font-bold'>{item?.penanggungJawab}</p>
                        </div>
                        <div className="border-b text-center">
                            <p className='text-xs text-gray-400'>Status</p>
                            <p className={`text-sm capitalize font-bold ${item.status === 'aktif' ? 'text-blue-400' : 'text-red-500'}`}>{item.status}</p>
                        </div>
                        <div className="text-center mt-2">
                            <p className='text-xs text-gray-400'>Tanggal Berlangganan</p>
                            <p className='text-sm font-bold'>{DateFormatToIDN(item.tanggal_berlangganan, false)}</p>
                        </div>
                        <div className="text-center mt-2">
                            <p className='text-xs text-gray-400'>Selesai Berlangganan</p>
                            <p className='text-sm font-bold'>{DateFormatToIDN(item.tanggal_selesai_berlangganan, false)}</p>
                        </div>
                    </div>
                </div>
                <div className={`details overflow-hidden transition-all ease-in-out duration-1000 mx-2 ${detail === item.id ? 'max-h-[500px] py-3 border-y mt-2' : 'max-h-0'}`}>
                    <div className="flex flex-col gap-1">
                        <div className="teks flex justify-between">
                            <p className='font-medium'>Tanggal Berlangganan :</p>
                            <p className='font-bold'>{DateFormatToIDN(item.tanggal_berlangganan,false)}</p>
                        </div>
                        <div className="teks flex justify-between">
                            <p className='font-medium'>Tanggal Selesai Berlangganan:</p>
                            <p className='font-bold'>{DateFormatToIDN(item.tanggal_selesai_berlangganan,false)}</p>
                        </div>
                        <div className="teks flex justify-between">
                            <p className='font-medium'>Tanggal Pembayaran :</p>
                            <p className='font-bold'>{DateFormatToIDN(item.tanggal_pembayaran,false)}</p>
                        </div>
                        <div className="teks flex justify-between">
                            <p className='font-medium'>Biaya :</p>
                            <p className='font-bold'>Rp. {new Intl.NumberFormat().format(item.biaya).replace(/,/g, '.')}</p>
                        </div>
                        <div className="teks flex justify-between">
                            <p className='font-medium w-1/2 whitespace-nowrap'>Penanggung Jawab :</p>
                            <p className='font-bold capitalize text-end'>{item.penanggungJawab}</p>
                        </div>
                        <div className="teks flex justify-between">
                            <p className='font-medium w-1/2 whitespace-nowrap'>Note : </p>
                            <p className='font-bold w-1/2 text-end'>{item.note}</p>
                        </div>
                        <div className="teks flex justify-between">
                            <p className='font-medium'>Status :</p>
                            <p className={`text-sm capitalize font-bold ${item.status === 'aktif' ? 'text-blue-400' : 'text-red-500'}`}>{item.status}</p>
                        </div>
                    </div>
                </div>
                <div className="tombol flex justify-around h-9 mt-3 pb-2">
                    { canUpdate &&
                        <button
                        className="update_button text-cyan-400 bg-white flex justify-center h items-center py-3"
                        onClick={() => handleUpdateClick(item.id)}
                        >
                        <p>Update</p>
                        </button>
                    }
                    { canDelete &&
                        <button
                        className="delete_button text-red-500 bg-white flex justify-center items-center py-3"
                        onClick={() => handleDeleteClick(item.id)}
                        >
                        <p>Delete</p>
                        </button>
                    }
                </div>
            </div>
        </div>
    )
})

export default BillingCards