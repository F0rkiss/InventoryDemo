import React, { useEffect, useState } from 'react'
import { Page, Block } from 'framework7-react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/api'
import Back from '../component/Back'
import Layout from '../component/Layout'
import Swal from 'sweetalert2'
import SelectPaginate from '../component/SelectPaginate'
import ModalPO from '../component/modal/ModalPurchaseOrder'
import { DecryptID } from '../../helper/EncryptHelper'
import Transition from '../component/Transition'
import { useAuth } from '../../auth/AuthContext'
import PriceFormat from '../../helper/PriceFormatHelper'
import ImagePreviewModal from '../component/modal/ImagePreviewModal'

function CreatePurchaseOrderPR() {
    const [items, setItems] = useState({
        purchase_request: null,
        tanggal: '',
        kode_suplier: '',
        kode: '',
        alamat: '',
        keterangan: '',
        cara_pembayaran: '',
        tanggal_penyerahan: '',
    }) 
    const { id } = useParams()
    const [details, setDetails] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [contentVisible, setContentVisible] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [disabled, setDisabled] = useState(false)
    const apiUrl = import.meta.env.VITE_URL
    const navigate = useNavigate()
    const [originalItems, setOriginalItems] = useState(null);
    const [originalDetails, setOriginalDetails] = useState([]);
    const [decryptedId, setDecryptedId] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Image preview state
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');

     useEffect(() => {
        const decryptedIds = DecryptID(id)
            setDecryptedId(decryptedIds)
            if (!decryptedIds) {
                navigate(-1)
        }
    }, [id])

    useEffect(() => {
        if (decryptedId) {
            fetchItem()
        }
    }, [decryptedId])

    // Fungsi untuk validasi input
    const validate = () => {
        const newErrors = {};
        if (!items.purchase_request) newErrors.purchase_request = 'Purchase Request wajib diisi.';
        if (!items.tanggal) newErrors.tanggal = 'Tanggal wajib diisi.';
        if (!items.kode_suplier) newErrors.kode_suplier = 'Kode Supplier wajib diisi.';
        // if (!items.kode) newErrors.kode = 'Kode wajib diisi.';
        if (!items.alamat) newErrors.alamat = 'Alamat wajib diisi.';
        if (!items.tanggal_penyerahan) newErrors.tanggal_penyerahan = 'Tanggal Penyerahan wajib diisi.';
        if (!items.keterangan) newErrors.keterangan = 'Keterangan wajib diisi.';
        if (!items.cara_pembayaran) newErrors.cara_pembayaran = 'Metode Pembayaran wajib diisi.';
        if (details.length === 0) newErrors.details = 'Tambahkan minimal satu detail barang.';
        
        setErrors(newErrors);
        // Mengembalikan true jika tidak ada error, false jika ada
        return Object.keys(newErrors).length === 0;
    };

    const fetchItem = async () => {
        try {
            const response = await api.get(`purchaseRequest-detail/${decryptedId}`);
            const data = response.data.data;
            const fetchedItems = {
                purchase_request : data.kode,
            };
            setItems(fetchedItems);
        } catch (error) {

        } finally { 
            setTimeout(() => setContentVisible(true), 50)
         }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Jalankan validasi
        if (!validate()) {
            // Jika validasi gagal, tampilkan peringatan dan jangan lanjutkan
            Swal.fire({ icon:'warning', title:'Form Tidak Lengkap', text:'Harap isi semua field yang wajib diisi.' });
            return;
        }

        try {
            if (isSubmitting) return; 
            setIsSubmitting(true);
            setDisabled(true);

            const payload = {
                invent_purchase_request_id: items.purchase_request.value,
                tanggal: items.tanggal,
                kode_suplier: items.kode_suplier,
                alamat: items.alamat,
                tanggal_penyerahan: items.tanggal_penyerahan,
                keterangan: items.keterangan,
                cara_pembayaran: items.cara_pembayaran,
                invent_barangs_id: details.map(d => d.barangs?.id ),
                qty: details.map(d => d.qty ),
                harga_sub_total: details.map(d => d.harga_sub_total)
            };
            
            const res = await api.post(`purchaseOrder-create/${decryptedId}`, payload);

            Swal.fire({
                title:'Purchase Order berhasil dibuat!',
                icon:'success', 
                timer: 2000,
                showConfirmButton: false
            });
            navigate('/purchase-order-pr/list-purchase-order-pr');
            
        } catch (err) {
            Swal.fire({ 
                icon:'error',
                title:'Gagal Membuat Purchase Order',
                text: err?.response?.data?.msg || 'Kesalahan pada sistem'
            });
            console.log('Update error:', err?.response?.data || err);
        } finally {
            setIsSubmitting(false);
            setDisabled(false);
        }
    };
    
    // Fungsi untuk menangani perubahan input dan menghapus error saat user mengetik
    const handleChange = (e) => {
        const { name, value } = e.target;
        setItems(prevItems => ({ ...prevItems, [name]: value }));
        // Hapus error untuk field yang sedang diisi
        if (errors[name]) {
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[name];
                return newErrors;
            });
        }
    };
    
    const handleSelectChange = (name, value) => {
        setItems(prevItems => ({ ...prevItems, [name]: value }));
         if (errors[name]) {
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[name];
                return newErrors;
            });
        }
    };


    const resetValue = () => {
        if (originalItems && originalDetails) {
            setItems(originalItems);
            setDetails(originalDetails);
        } else {
            setItems({ purchase_request: null, tanggal: '' });
            setDetails([]);
        }
        setErrors({}); // Reset error juga
    }

    const handleClosePreview = () => {
        setIsPreviewOpen(false);
        setSelectedImageUrl('');
    };

    const handleImageClick = (imageUrl) => {
        setSelectedImageUrl(imageUrl);
        setIsPreviewOpen(true);
    };

    return (
    <Layout title={'Create Purchase Order'}>
        <Block>
            <div className='px-4'>
                <Back goHome={() => navigate('/purchase-order-pr/list-purchase-order-pr')} />
                <p className='lg:text-3xl text-2xl font-semibold capitalize my-4'>Create Purchase Order</p>
                <Transition contentVisible={contentVisible}>
                    <div className="p-8 bg-white shadow-sm rounded-lg border">
                        <form onSubmit={handleSubmit} className='space-y-5'>
                            <div className="mb-4">
                                <div className="flex justify-between items-center">
                                    <label className='font-semibold'>Tanggal</label>
                                    {errors.tanggal && <span className="text-red-500 text-sm">{errors.tanggal}</span>}
                                </div>
                                <div className={`bg-white p-2 rounded-md border mt-2 ${errors.tanggal ? 'border-red-500' : 'border-gray-300'}`}>
                                <input 
                                    type="date" 
                                    name="tanggal" 
                                    value={items.tanggal} 
                                    onChange={handleChange}
                                    className="w-full p-2 placeholder:text-gray-400"
                                    placeholder='Tanggal'
                                />
                                </div>
                            </div>
                            <div className='mb-4'>
                                <div className="flex justify-between items-center">
                                    <label className='font-semibold'>Kode Supplier</label>
                                    {errors.kode_suplier && <span className="text-red-500 text-sm">{errors.kode_suplier}</span>}
                                </div>
                                <div className={`bg-white p-2 rounded-md border mt-2 ${errors.kode_suplier ? 'border-red-500' : 'border-gray-300'}`}>
                                <input 
                                    type="text" 
                                    name="kode_suplier" 
                                    value={items.kode_suplier} 
                                    onChange={handleChange}
                                    className="w-full p-2 placeholder:text-gray-400"
                                    maxLength={80}
                                    placeholder='Kode Supplier'
                                />
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="flex justify-between items-center">
                                    <label className='font-semibold'>Alamat</label>
                                    {errors.alamat && <span className="text-red-500 text-sm">{errors.alamat}</span>}
                                </div>
                                <div className={`bg-white p-2 rounded-md border mt-2 ${errors.alamat ? 'border-red-500' : 'border-gray-300'}`}>
                                <textarea
                                    name="alamat" 
                                    value={items.alamat} 
                                    onChange={handleChange}
                                    className="w-full min-h-fit p-2 placeholder:text-gray-400"
                                    maxLength={225}
                                    placeholder='Alamat'
                                    rows="3"
                                />
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="flex justify-between items-center">
                                    <label className='font-semibold'>Tanggal Penyerahan</label>
                                    {errors.tanggal_penyerahan && <span className="text-red-500 text-sm">{errors.tanggal_penyerahan}</span>}
                                </div>
                                <div className={`bg-white p-2 rounded-md border mt-2 ${errors.tanggal_penyerahan ? 'border-red-500' : 'border-gray-300'}`}>
                                <input 
                                    type="date" 
                                    name="tanggal_penyerahan" 
                                    value={items.tanggal_penyerahan} 
                                    onChange={handleChange}
                                    className="w-full p-2 placeholder:text-gray-400"
                                    placeholder='Tanggal Penyerahan'
                                />
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="flex justify-between items-center">
                                    <label className='font-semibold'>Keterangan</label>
                                    {errors.keterangan && <span className="text-red-500 text-sm">{errors.keterangan}</span>}
                                </div>
                                <div className={`bg-white p-2 rounded-md border mt-2 ${errors.keterangan ? 'border-red-500' : 'border-gray-300'}`}>
                                <textarea
                                    name="keterangan" 
                                    value={items.keterangan} 
                                    onChange={handleChange}
                                    className="w-full min-h-fit p-2 placeholder:text-gray-400"
                                    maxLength={225}
                                    placeholder='Keterangan'
                                    rows="3"
                                />
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="flex justify-between items-center">
                                    <label className='font-semibold'>Metode Pembayaran</label>
                                    {errors.cara_pembayaran && <span className="text-red-500 text-sm">{errors.cara_pembayaran}</span>}
                                </div>
                                <div className={`bg-white p-2 rounded-md border mt-2 ${errors.cara_pembayaran ? 'border-red-500' : 'border-gray-300'}`}>
                                <input 
                                    type="text" 
                                    name="cara_pembayaran" 
                                    value={items.cara_pembayaran} 
                                    onChange={handleChange}
                                    className="w-full p-2 placeholder:text-gray-400"
                                    maxLength={80}
                                    placeholder='Metode Pembayaran'
                                />
                                </div>
                            </div>
                            <div className="mt-2 pt-3">
                            <div className="flex justify-between items-center">
                                    <p className='text-lg font-semibold'>Detail</p>
                                    {errors.details && <span className="text-red-500 text-sm">{errors.details}</span>}
                                </div>
                            </div>
                            <div className="space-y-3 my-3">
                                {details.map((item, id) => (
                                <div
                                    key={id}
                                    className="
                                    border border-gray-300 rounded-xl p-3
                                    grid grid-cols-[80px,1fr] md:grid-cols-[160px,1fr,80px,160px,64px]
                                    items-center gap-x-4
                                    "
                                >
                                {/* Image */}
                                <div className="overflow-hidden rounded-lg bg-gray-50 w-full aspect-[4/3]">
                                {item.barangs?.image ? (
                                    <img
                                    src={`${apiUrl}${item.barangs.image}`}
                                    alt={item.barangs?.name ?? 'barang'}
                                    className="w-full h-full object-cover"
                                    onClick={() => handleImageClick(`${apiUrl}${item.barangs?.image}`)}                                
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                    No Image
                                    </div>
                                )}
                                </div>

                                {/* Wrapper for all other content. Stacks vertically on mobile. */}
                                <div className="flex flex-col items-start h-full md:contents">
                                    {/* Spacer (for desktop layout) */}
                                    <div className="hidden md:block" />
                                    {/* Wrapper for Qty & Price text */}
                                    <div className="md:contents">
                                        {/* Qty */}
                                        <div className="font-medium tabular-nums md:text-right">
                                            <span className="text-sm text-gray-400 ">Qty: </span>
                                            {item.qty}
                                        </div>

                                        {/* Price */}
                                        <div className="mt-1 font-medium md:mt-0 md:text-right">
                                            <span className="text-sm text-gray-400">Subtotal: </span>
                                            {PriceFormat(item.harga_sub_total)}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 mt-2 w-full justify-end md:w-auto md:mt-0 md:justify-self-end md:border-l-2 md:pl-3">
                                        <button
                                            type="button"
                                            onClick={e => {
                                            e.preventDefault();
                                            setEditIndex(id);
                                            // setInitialDetails(details[id]); // This should be handled inside ModalPO if needed
                                            setOpenModal(true);
                                            }}
                                        >
                                            <i className="bx bx-edit text-xl text-cyan-600"></i>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={e => {
                                            e.preventDefault();
                                            const newDetails = details.filter((_, i) => i !== id);
                                            setDetails(newDetails);
                                            // Also clear details error if it was there and now details are not empty
                                            if (newDetails.length > 0 && errors.details) {
                                                setErrors(prev => ({...prev, details: undefined}))
                                            }
                                            }}
                                        >
                                            <i className="bx bx-trash text-xl text-red-500"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            ))}
                            </div>

                                {/* This is the "Add another detail" button at the bottom */}
                                <div className="flex mt-4">
                                    <button
                                        type="button"
                                        className="w-full rounded-lg py-2 px-4 flex items-center font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-color duration-200"
                                        onClick={() => {
                                            setOpenModal(!openModal);
                                            setEditIndex(null);
                                        }}>
                                        <i className='bx bx-plus mr-2 font-semibold text-base'></i>
                                        <span>{ details.length === 0 ? 'Tambah detail' : 'Tambah detail lain'}</span>
                                    </button>
                                </div>
                            <div className="flex flex-col items-center justify-self-center mt-10 max-w-full w-[25rem] space-y-2 text-center">
                                <button 
                                    disabled={isSubmitting} 
                                    type='submit' 
                                    className='py-2 px-4 w-full rounded-lg font-medium bg-blue-500 hover:bg-blue-600 transition-color duration-200 text-white disabled:bg-blue-300'
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                                <button className='py-2 px-4 w-full rounded-lg font-medium border border-red-200 bg-red-50 hover:bg-red-100 transition-color duration-200 text-red-600' onClick={resetValue} type='button'>Reset</button>
                            </div>
                        </form>
                    </div>
                </Transition>
                {
                    openModal && <ModalPO
                    apiUrl={apiUrl}
                    open={openModal}
                    onClose={() => {
                        setOpenModal(false);
                        setEditIndex(null);
                    }}
                    onSave={data => {
                        if (editIndex !== null) {
                            setDetails(details.map((item, idx) => idx === editIndex ? data : item));
                        } else {
                            setDetails([...details, data]);
                        }
                        // Clear details error after adding an item
                        if(errors.details) {
                             setErrors(prev => ({...prev, details: undefined}))
                        }
                        setOpenModal(false);
                        setEditIndex(null);
                    }}
                    />
                }
            </div>
        </Block>
        <ImagePreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        imageUrl={selectedImageUrl}
        />
    </Layout>
    )
}

export default CreatePurchaseOrderPR;