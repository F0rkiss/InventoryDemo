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
    const [details, setDetails] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [contentVisible, setContentVisible] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [disabled, setDisabled] = useState(false)
    const { role } = useAuth()
    // const { id } = useParams()
    const apiUrl = import.meta.env.VITE_URL
    const navigate = useNavigate()
    const [originalItems, setOriginalItems] = useState(null);
    const [originalDetails, setOriginalDetails] = useState([]);
    const [decryptedId, setDecryptedId] = useState('')

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');

    // useEffect(() => {
    //     const decryptedIds = DecryptID(id)
    //         setDecryptedId(decryptedIds)
    //         if (!decryptedIds) {
    //             navigate(-1)
    //     }
    // }, [id])
    
    useEffect(() => {
        if (decryptedId) {
            fetchItem()
        }
    }, [decryptedId])

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (disabled) return;
            setDisabled(true);

            // --- Top-level form validation (already correct) ---
            const requiredFields = {
                'purchase_request': items.purchase_request?.value,
                'tanggal': items.tanggal,
                'kode_suplier': items.kode_suplier,
                'kode': items.kode,
                'alamat': items.alamat,
                'tanggal_penyerahan': items.tanggal_penyerahan,
                'keterangan': items.keterangan,
                'cara_pembayaran': items.cara_pembayaran,
            };

            for (const field in requiredFields) {
                if (!requiredFields[field]) {
                    const fieldName = field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                    Swal.fire({ 
                        icon:'warning', 
                        title:'Data Belum Lengkap',
                        text:`Silakan lengkapi kolom: ${fieldName}!` 
                    });
                    setDisabled(false); 
                    return;
                }
            }

            if (!details.length) {
                Swal.fire({ icon:'warning', title:'Detail kosong', text:'Tambahkan minimal satu detail barang.' });
                setDisabled(false); return;
            }

            // --- Start of FIX: Add validation for each detail item ---
            // for (let i = 0; i < details.length; i++) {
            //     const detail = details[i];
            //     const rowNum = i + 1;

            //     const barangId = detail.barangs?.id ?? detail.selectedBarang?.value;
            //     if (!barangId) {
            //         Swal.fire({ icon: 'warning', title: 'Detail Tidak Lengkap', text: `Baris #${rowNum}: Barang belum dipilih.` });
            //         setDisabled(false);
            //         return;
            //     }

            //     if (!detail.qty || Number(detail.qty) <= 0) {
            //         Swal.fire({ icon: 'warning', title: 'Detail Tidak Valid', text: `Baris #${rowNum}: Kuantitas (Qty) harus lebih besar dari 0.` });
            //         setDisabled(false);
            //         return;
            //     }

            //     if (detail.harga_sub_total == null || isNaN(Number(String(detail.harga_sub_total).replaceAll(',', '')))) {
            //         Swal.fire({ icon: 'warning', title: 'Detail Tidak Valid', text: `Baris #${rowNum}: Subtotal harga tidak valid atau kosong.` });
            //         setDisabled(false);
            //         return;
            //     }
            // }
            // --- End of FIX ---

            const payload = {
                invent_purchase_request_id: items.purchase_request.value,
                tanggal: items.tanggal,
                kode_suplier: items.kode_suplier,
                kode: items.kode,
                alamat: items.alamat,
                tanggal_penyerahan: items.tanggal_penyerahan,
                keterangan: items.keterangan,
                cara_pembayaran: items.cara_pembayaran,
                invent_barangs_id: details.map(d => d.barangs?.id ),
                qty: details.map(d => d.qty ),
                harga_sub_total: details.map(d => d.harga_sub_total)
            };
            
            const res = await api.post(`purchaseOrder-create`, payload);

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
                text: err?.response?.data?.message || 'Kesalahan pada sistem'
            });
            console.log('Update error:', err?.response?.data || err);
        } finally {
            setDisabled(false);
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
    <Layout title={'Update Purchase Order'}>
        <Block>
            <div className='px-4'>
                <Back goHome={() => navigate('/purchase-order-pr/list-purchase-order-pr')} />
                <p className='lg:text-3xl text-2xl font-semibold capitalize my-4'>Create Purchase Order</p>
                <div className="p-8 bg-white shadow-sm rounded-lg border">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-5 space-y-2">
                            <label className='font-semibold'>Purchase Request</label>
                            <SelectPaginate
                                source={'purchaseRequest'}
                                selectValue={items.purchase_request}
                                selectName={'Purchase request'}
                                itemLabel={['kode']}
                                handleSelectChange={purchase_request => setItems({...items, purchase_request})}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className='font-semibold'>Tanggal</label>
                            <div className='bg-white p-2 rounded-md border border-gray-300 mt-2'>
                            <input 
                                type="date" 
                                name="tanggal" 
                                value={items.tanggal} 
                                onChange={e => setItems({ ...items, tanggal: e.target.value })}
                                className="w-full p-2 placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                placeholder='Tanggal'
                                required
                            />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className='font-semibold'>Kode Supplier</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border mt-2'>
                            <input 
                                type="text" 
                                name="kode_suplier" 
                                value={items.kode_suplier} 
                                onChange={e => setItems({ ...items, kode_suplier: e.target.value })}
                                className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light "
                                maxLength={80}
                                placeholder='Kode Supplier'
                                required
                            />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className='font-semibold'>Kode</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border mt-2'>
                            <input 
                                type="text" 
                                name="kode" 
                                value={items.kode} 
                                onChange={e => setItems({ ...items, kode: e.target.value })}
                                className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light "
                                maxLength={80}
                                placeholder='Kode'
                                required
                            />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className='font-semibold'>Alamat</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border mt-2'>
                            <input 
                                type="text" 
                                name="alamat" 
                                value={items.alamat} 
                                onChange={e => setItems({ ...items, alamat: e.target.value })}
                                className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light "
                                maxLength={80}
                                placeholder='Alamat'
                                required
                            />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className='font-semibold'>Tanggal Penyerahan</label>
                            <div className='bg-white p-2 rounded-md border border-gray-300 mt-2'>
                            <input 
                                type="date" 
                                name="tanggal_penyerahan" 
                                value={items.tanggal_penyerahan} 
                                onChange={e => setItems({ ...items, tanggal_penyerahan: e.target.value })}
                                className="w-full p-2 placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                placeholder='Tanggal Penyerahan'
                                required
                            />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className='font-semibold'>Keterangan</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border mt-2'>
                            <input 
                                type="text" 
                                name="keterangan" 
                                value={items.keterangan} 
                                onChange={e => setItems({ ...items, keterangan: e.target.value })}
                                className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light "
                                maxLength={80}
                                placeholder='Keterangan'
                                required
                            />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className='font-semibold'>Metode Pembayaran</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border mt-2'>
                            <input 
                                type="text" 
                                name="cara_pembayaran" 
                                value={items.cara_pembayaran} 
                                onChange={e => setItems({ ...items, cara_pembayaran: e.target.value })}
                                className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light "
                                maxLength={80}
                                placeholder='Metode Pembayaran'
                                required
                            />
                            </div>
                        </div>
                        <div className="mt-2 pt-3">
                           <p className='text-lg font-semibold'>Detail</p>
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
                                        setInitialDetails(details[id]);
                                        setOpenModal(true);
                                        }}
                                    >
                                        <i className="bx bx-edit text-xl text-cyan-600"></i>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={e => {
                                        e.preventDefault();
                                        setDetails(details.filter((_, i) => i !== id));
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
                                        // setInitialDetails({ selectedBarang: null, qty: '', harga: '' });
                                    }}>
                                    <i className='bx bx-plus mr-2 font-semibold text-base'></i>
                                    <span>{ details.length === 0 ? 'Tambah detail' : 'Tambah detail lain'}</span>
                                </button>
                            </div>
                        {/* </div> */}
                        <div className="flex flex-col items-center justify-self-center mt-10 max-w-full w-[25rem] space-y-2 text-center">
                            <button disabled={disabled} type='submit' className='py-2 px-2 rounded-lg font-medium bg-blue-500/85 hover:bg-blue-500 transition-color duration-200 text-white disabled:bg-blue-200'>Submit</button>
                            <button className='py-2 px-2 rounded-lg font-medium border border-red-200 bg-red-50 hover:bg-red-100 transition-color duration-200 text-red-600' onClick={resetValue} type='button'>Reset</button>
                        </div>
                    </form>
                </div>
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
                            // Edit mode: update record at editIndex
                            setDetails(details.map((item, idx) => idx === editIndex ? data : item));
                        } else {
                            // Add mode: add new data
                            setDetails([...details, data]);
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