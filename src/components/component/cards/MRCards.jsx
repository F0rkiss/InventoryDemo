    import React, {forwardRef, useEffect, useState} from 'react'
    import { f7 } from 'framework7-react'
    import avatar from '../../../assets/image/gambar/Profile_avatar_placeholder_large.png'
    import {Swiper, SwiperSlide, useSwiper } from 'swiper/react'
    import { Navigation } from 'swiper/modules'
    import 'swiper/css/pagination'
    import 'swiper/css/navigation'
    import 'swiper/css'
    import { createRoot } from 'react-dom/client'
    import useAuth from '../../../hooks/useAuth'
    import DateFormatToIDN from '../../../helper/DateFormatToIDN'

    const MRCards = forwardRef(({item, deleteItems, UpdateMR, handleReject, handleProsess, doneMR, restoreItems  ,items, restore = false, className = '', desktop = false}, ref) => {

        const [lazyLoad, setLazyLoad] = useState({})
        const [detail, setDetail] = useState(null);
        const [currentIndex, setCurrentIndex] = useState({})
        const apiUrl = import.meta.env.VITE_URL
        const { role, name } = useAuth()


        useEffect(() => {
            const initialIndex = {}
            items.forEach(item => {
                initialIndex[item.id] = 0 
            });
            setCurrentIndex(initialIndex)
        }, [items])

        useEffect(() => {
            if (desktop) {
                setDetail((prevDetails) => prevDetails = item.id)
                setLazyLoad((prev) => ({
                    ...prev, 
                    [items[0].id]: true
                }))
            }
        }, [desktop])

        const prevItems = (itemId) => {
            setCurrentIndex((prevIndex) => ({
                ...prevIndex,
                [itemId] : prevIndex[itemId] > 0 ? prevIndex[itemId] - 1 : 0 
            }))
        }

        const nextItems = (itemId, barangLength) => {
            setCurrentIndex((prevIndex) => ({
                ...prevIndex,
                [itemId] : prevIndex[itemId] < barangLength - 1 ? prevIndex[itemId] + 1 : prevIndex[itemId] 
            }))
        }

        const toggleDetail = (itemId) => {
            setDetail(prevDetails => (prevDetails == itemId ? null : itemId))
            setLazyLoad((prev) => ({
                ...prev, 
                [itemId]: true
            }))
        }

        const imageDialog = (item, sources) => {
            // Buat konten gambar untuk SwiperSlide
            const images = item[sources].map((image, index) => (
                <SwiperSlide key={index} className="self-center">
                    <img src={`${apiUrl}${image}`} className="dialog-image max-h-[650px]" alt="Slide" />
                </SwiperSlide>
            ));
        
            // Buat dialog Framework7
            const dialog = f7.dialog.create({
                content: `<div id="kontainer-swiper"></div>`,
                closeByBackdropClick: true,
                cssClass: 'custom-dialog',
            });
        
            // Tampilkan dialog
            dialog.open();
        
            // Render komponen React ke dalam dialog setelah kontainer tersedia di DOM
            setTimeout(() => {
                const container = document.getElementById('kontainer-swiper');
                if (container) {
                    createRoot(container).render(
                        <div className="flex items-center">
                            <Swiper
                                modules={[Navigation]}
                                navigation={true}  // Mengaktifkan navigasi panah
                                slidesPerView={1}
                            >
                                {images}
                            </Swiper>
                        </div>
                    );
                }
            }, 50);
        };
        


    return (
            <div className={`bg-white rounded-md shadow-md mb-2 ${className}`} ref={ref}>
                <div className="content p-2">
                    <div className="upper-content flex max-h-12 items-center">
                        <img src={avatar} className='max-w-8 max-h-8 rounded-full' />
                        <div className="text ms-3">
                            <p className='capitalize font-bold text-sm'>{item.user?.name || item.username}</p>
                            <p className='text-xs'>{item.user?.department?.divisi?.kode || item.divisiKode}</p>
                        </div>  
                        {
                            !restore &&
                            <button className={`bg-slate-200 rounded-full w-24 ml-auto text-xs items-center flex justify-center text-red-500 ${item.status !== 'pending' && 'hidden'}`} onClick={() => deleteItems(item.id)}>
                                <i className='bx bxs-trash text-base'></i>
                                <p className='ms-1 font-semibold'>Delete</p>
                            </button> 
                        }
                    </div>
                    <div className={`lower-content ${detail == item.id ? 'opacity-0 absolute' : 'opacity-100'} transition-all ease-in-out duration-[3000ms]`}>
                        <div className={`grid grid-cols-2 mt-3 ${detail == item.id ? 'hidden' : ''} `}>
                            <div className="border-b pb-2  flex justify-between">
                                <button className={`w-fit font-bold text-base mt-3 ${currentIndex[item.id] > 0 ? '' : 'invisible'}`} disabled={item.barangs.length < 0} onClick={() => prevItems(item.id)}> &lt; </button>
                                <div className="flex justify-center items-center flex-col ">
                                    <p className='text-gray-400 text-xs'>Barang</p>
                                    <p className='font-bold capitalize max-w-40 max-sm:max-w-[106px] overflow-hidden whitespace-nowrap text-ellipsis ms-2'>{item.barangs[currentIndex[item.id]]?.unit_device || '-'}</p>
                                </div>
                                <button className={`w-fit font-bold text-base mt-3 ${currentIndex[item.id] < item.barangs?.length - 1 == 0 ? 'invisible' : ''}`} disabled={item.barangs.length < 0} onClick={() => nextItems(item.id, item.barangs.length)}> &gt; </button>
                            </div>
                            <div className="text-center border-b pb-2 ">
                                <p className='text-gray-400 text-xs'>Jenis Permintaan</p>
                                <p className='font-bold capitalize overflow-hidden text-ellipsis'>{item.jenis_permintaan.replace('_', ' ')}</p>
                            </div>
                            <div className="text-center pt-2">
                                <p className='text-gray-400 text-xs'>Status</p>
                                <p className={`font-bold capitalize ${item.status === 'reject' ? 'text-red-500' : 
                                                                    item.status === 'done' ? 'text-green-500' : 
                                                                    item.status === 'pending' ? 'text-yellow-500' : 
                                                                    item.status === 'in prosess' ? 'text-blue-500' : ''}`}
                                                                    >{item.status}</p>
                            </div>
                            <div className="text-center pt-2">
                                <p className='text-gray-400 text-xs'>Tanggal MR</p>
                                <p className='font-bold capitalize'>{DateFormatToIDN(item.created_at?.slice(0, 10))}</p>
                            </div>
                        </div>
                    </div>
                    <div className={`${detail != item.id ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'} transition-all ease-in-out duration-[1500ms] overflow-hidden `}>
                        <div className="flex justify-between">
                            <div className="text ms-2 mt-3 w-3/4">
                            { item.barangs.length > 0 ? (
                                <Swiper>
                                    {item.barangs.map((barang, index) => (
                                        <SwiperSlide key={index}>
                                                <p className='text-gray-400 text-xs'>Barang</p>
                                                <p className='font-bold capitalize'>{barang.unit_device || '-'}</p>
                                                <p className='text-gray-400 text-xs mt-1'>Aset Kode</p>
                                                <p className='font-bold capitalize'>{barang.asset_kode || '-'}</p>
                                        </SwiperSlide>
                                        ))}
                                                <p className='text-gray-400 text-xs mt-1'>Status</p>
                                                <p className={`font-bold capitalize ${item.status === 'reject' ? 'text-red-500' :
                                                                                                    item.status === 'done' ? 'text-green-500' :
                                                                                                    item.status === 'pending' ? 'text-yellow-500' :
                                                                                                    item.status === 'in prosess' ? 'text-blue-500' : ''}`}>{item.status}</p>
                                                <p className='text-gray-400 text-xs mt-1'>Jenis Permintaan</p>
                                                <p className='font-bold capitalize'>{item.jenis_permintaan.replace('_', ' ')}</p>
                                                <p className='text-gray-400 text-xs mt-1'>Tanggal Make Request</p>
                                                <p className='font-bold capitalize'>{DateFormatToIDN(item.created_at?.slice(0, 10))}</p>
                                                <p className='text-gray-400 text-xs mt-1'>Tanggal Penerimaan</p>
                                                <p className='font-bold capitalize'>{DateFormatToIDN(item.tanggal_penerimaan) || '-'}</p>
                                                <p className='text-gray-400 text-xs mt-1'>Tanggal Penyerahan</p>
                                                <p className='font-bold capitalize'>{DateFormatToIDN(item.tanggal_penyerahan) || '-'}</p>
                                                <p className='text-gray-400 text-xs mt-1'>Deskripsi</p>
                                                <p className={`font-bold capitalize ${desktop ? '' : 'line-clamp-3 break-words'}`}>{item.description || '-'}</p>
                                                <p className='text-gray-400 text-xs mt-1'>Keperluan</p>
                                                <p className={`font-bold capitalize ${desktop ? '' : 'line-clamp-3 break-words'}`}>{item.keperluan || '-'}</p>
                                                <p className='text-gray-400 text-xs mt-1'>Kode Penyerahan</p>
                                                <p className='font-bold capitalize'>{item.kode_penyerahan || '-'}</p>
                                                {
                                            item.status === 'done' && (
                                                <>                                                
                                                    <p className='text-gray-400 text-xs mt-1'>Note</p>
                                                    <p className={`font-bold capitalize ${desktop ? '' : 'line-clamp-3 break-words'}`}>{item.note || '-'}</p>
                                                </>                                                
                                            )
                                        }
                                                
                                </Swiper>
                                ) : (
                                    <div>
                                        <p className='text-gray-400 text-xs'>Barang</p>
                                        <p className='font-bold capitalize'>-</p>
                                        <p className='text-gray-400 text-xs mt-1'>Aset Kode</p>
                                        <p className='font-bold capitalize'>-</p>
                                        <p className='text-gray-400 text-xs mt-1'>Status</p>
                                        <p className={`font-bold capitalize ${item.status === 'reject' ? 'text-red-500' :
                                                                                            item.status === 'done' ? 'text-green-500' :
                                                                                            item.status === 'pending' ? 'text-yellow-500' :
                                                                                            item.status === 'in prosess' ? 'text-blue-500' : ''}`}>{item.status}</p>
                                        <p className='text-gray-400 text-xs mt-1'>Jenis Permintaan</p>
                                        <p className='font-bold capitalize'>{item.jenis_permintaan.replace('_', ' ')}</p>
                                        <p className='text-gray-400 text-xs mt-1'>Tanggal Make Request</p>
                                        <p className='font-bold capitalize'>{item.created_at.slice(0, 10)}</p>
                                        <p className='text-gray-400 text-xs mt-1'>Tanggal Penerimaan</p>
                                        <p className='font-bold capitalize'>{item.tanggal_penerimaan || '-'}</p>
                                        <p className='text-gray-400 text-xs mt-1'>Tanggal Penyerahan</p>
                                        <p className='font-bold capitalize'>{item.tanggal_penyerahan || '-'}</p>
                                        <p className='text-gray-400 text-xs mt-1'>Deskripsi</p>
                                        <p className='font-bold capitalize break-words line-clamp-[15]'>{item.description || '-'}</p>
                                        <p className='text-gray-400 text-xs mt-1'>Keperluan</p>
                                        <p className='font-bold capitalize break-words line-clamp-[14]'>{item.keperluan || '-'}</p>
                                        <p className='text-gray-400 text-xs mt-1'>Kode Penyerahan</p>
                                        <p className='font-bold capitalize'>{item.kode_penyerahan || '-'}</p>
                                        {
                                            item.status === 'done' && (
                                                <>                                                
                                                    <p className='text-gray-400 text-xs mt-1'>Note</p>
                                                    <p className='font-bold capitalize'>{item.note || '-'}</p>
                                                </>                                                
                                            )
                                        }

                                </div>
                                )}
                            </div>
                            
                            <div className="image me-4">
                            { lazyLoad[item.id]  && (
                                <div className='flex flex-col gap-2'>
                                    <div>
                                        <p className='text-center text-gray-400 text-xs mt-4 mb-1'>Bukti User</p>
                                        {item.bukti.length > 0 ?
                                        (
                                        <button onClick={() => imageDialog(item, 'bukti')} className='flex justify-center'>
                                            <img className='max-xs:max-w-16 max-w-20 max-h-28 mx-auto' src={item.bukti && `${apiUrl}${item.bukti[0]}`} alt="" />
                                        </button>
                                        ) : 
                                        <p className='text-center font-bold'>-</p>
                                        }
                                    </div>
                                    <div className={`flex-col flex justify-center mt-3 ${item.status !== 'done' && 'hidden'}`}>
                                        <p className='text-center text-gray-400 text-xs'>Bukti Admin</p>
                                        {item.imgAfter.length > 0 ?
                                        (
                                        <button onClick={() => imageDialog(item, 'imgAfter')}>
                                            <img className='max-xs:max-w-16 max-w-20 max-h-28 mx-auto' src={item.bukti && `${apiUrl}${item.imgAfter[0]}`} alt="" />
                                        </button>
                                        ) : 
                                        <p className='text-center font-bold'>-</p>
                                        }
                                    </div>
                                </div>
                                )}
                            </div>
                        </div>

                        {/* Untuk MR Personal User */}
                            {
                                item.user?.name == name  && !restore && item.status == 'pending' && 
                                <div className={`edit_button flex justify-center border-b`}>
                                    <button className='bg-yellow-400 text-white rounded-md mt-4 w-1/2 h-9 mb-4' onClick={() => UpdateMR(item.id)}>
                                        Edit MR 
                                    </button>
                                </div>
                            }                        
                        {/* {
                            (item.status == 'done' && item.tanggal_penerimaan == null) && (role == 'admin') && 
                            <div className='border-b flex justify-center'>
                                <button onClick={() => doneMR(item.id, item)}  className={`bg-green-400 text-white rounded-lg py-2 mt-2 mb-4 w-1/2`}>Done</button>
                            </div>
                        } */}
                    </div>
                    <div className="lower_button flex gap-x-2 mt-5 h-9">
                        {
                            role !== 'user' && !restore && !desktop ?
                            <>
                                <button onClick={() => handleReject(item ,item.id)} className={`bg-red-400 text-white rounded-lg ${item.status === 'reject' || item.status === 'done' ? 'invisible' : ''}`}>Reject</button>
                                <button onClick={() => toggleDetail(item.id)} className={`bg-slate-500 text-white rounded-lg order-2]`}>{detail == item.id ? 'Close' : 'Detail'}</button>
                                <button onClick={() => handleProsess(item)} className={`bg-blue-400 text-white rounded-lg ${item.status === 'reject' || item.status === 'done' ? 'invisible' : item.status === 'in prosess' ? 'hidden' : ''}`}>Accept</button>
                                <button onClick={() => doneMR(item.id, item)}  className={`bg-green-400 text-white rounded-lg ${item.status !== 'in prosess' ? 'hidden' : ''}`}>Done</button>
                            </>
                            :
                            !restore && !desktop && <button onClick={() => toggleDetail(item.id)} className={`bg-slate-500 text-white rounded-lg mx-20`}>{detail == item.id ? 'Close' : 'Detail'}</button>
                        }
                        
                        {
                            restore && 
                            <>
                                <button onClick={() => toggleDetail(item.id)} className={`bg-slate-500 text-white rounded-lg order-2]`}>{detail == item.id ? 'Close' : 'Detail'}</button>
                                <button onClick={() => restoreItems(item.id)} className={`bg-cyan-400 text-white rounded-lg order-2]`}>Restore</button>
                            </>
                        }

                        {
                            desktop && 
                            <>
                            <button onClick={() => handleReject(item ,item.id)} className={`bg-red-400 text-white rounded-lg ${item.status === 'reject' || item.status === 'done' ? 'invisible' : ''}`}>Reject</button>
                            <button onClick={() => handleProsess(item)} className={`bg-blue-400 text-white rounded-lg ${item.status === 'reject' || item.status === 'done' ? 'invisible' : item.status === 'in prosess' ? 'hidden' : ''}`}>Accept</button>
                            <button onClick={() => doneMR(item.id, item)}  className={`bg-green-400 text-white rounded-lg ${item.status !== 'in prosess' ? 'hidden' : ''}`}>Done</button>
                            </>
                        }
                    </div>
                </div>
            </div>
            )
    })

    export default MRCards