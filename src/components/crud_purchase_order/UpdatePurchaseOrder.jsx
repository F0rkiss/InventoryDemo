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
import Loader from '../component/Loader'

function UpdatePurchaseOrder() {
    const [items, setItems] = useState({
        purchase_request: '', // FIXED: Changed from null to empty string for consistency
        purchase_request_id: null, // ADDED: State to hold the ID for submission
        tanggal: '',
        kode_suplier: '',
        kode: '',
        alamat: '',
        keterangan: '',
        cara_pembayaran: null,
        tanggal_penyerahan: '',
        is_ppn: 0,
    }) 
    const [details, setDetails] = useState([]);
    const { id } = useParams()
    const [decryptedId, setDecryptedId] = useState('')
    const [editIndex, setEditIndex] = useState(null);
    const [initialDetails, setInitialDetails] = useState({
        selectedBarang: null,
        qty: '',
        harga: '',
    })
    const [contentVisible, setContentVisible] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [disabled, setDisabled] = useState(false)
    const [isUnchanged, setIsUnchanged] = useState(true);
    const { role } = useAuth()
    const apiUrl = import.meta.env.VITE_URL
    const navigate = useNavigate()
    const [originalItems, setOriginalItems] = useState(null);
    const [originalDetails, setOriginalDetails] = useState([]);

    // --- BARU: State untuk menyimpan info Purchase Request ---
    const [prInfo, setPrInfo] = useState(null);

    const [ loading, setLoading ] = useState(false);

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');

    useEffect(() => {
        const decryptedIds = DecryptID(id)
            setDecryptedId(decryptedIds)
            if (!decryptedIds) {
                navigate(-1)
        }
    }, [id, navigate]) // FIXED: Added navigate to dependency array

    useEffect(() => {
        if (decryptedId) {
            fetchItem()
        }
    }, [decryptedId])

    useEffect(() => {
        if (!originalItems || !originalDetails) return;

        const itemsChanged =
            items.tanggal !== originalItems.tanggal ||
            items.kode_suplier !== originalItems.kode_suplier ||
            items.keterangan !== originalItems.keterangan ||
            items.alamat !== originalItems.alamat ||
            items.cara_pembayaran?.id !== originalItems.cara_pembayaran?.id ||
            items.tanggal_penyerahan !== originalItems.tanggal_penyerahan ||
            items.is_ppn !== originalItems.is_ppn;

        let detailsChanged = false;
        if (details.length !== originalDetails.length) {
            detailsChanged = true;
        } else {
            detailsChanged = details.some((detail, index) => {
            const orig = originalDetails[index];
            return (
                detail.invent_barangs_id !== orig.invent_barangs_id ||
                String(detail.qty) !== String(orig.qty) || // FIXED: Compare as strings for consistency
                String(detail.harga_sub_total) !== String(orig.harga_sub_total) 
            );
            });
        }

        const hasChanges = itemsChanged || detailsChanged;
        setIsUnchanged(!hasChanges);
    }, [items, details, originalItems, originalDetails]);


    const fetchItem = async () => {
        try {
            setLoading(true);
            const response = await api.get(`purchaseOrder-detail/${decryptedId}`);
            const data = response.data.data;

            // --- BARU: Simpan data purchase_request yang terhubung ---
            if (data.purchase_request) {
                setPrInfo(data.purchase_request);
            }
            // ----------------------------------------------------

            const fetchedItems = {
                purchase_request : data.purchase_request.kode, // This is the display code
                purchase_request_id: data.purchase_request.id, // FIXED: Store the actual ID
                tanggal : data.tanggal,
                kode_suplier: data.kode_suplier,
                alamat: data.alamat,
                keterangan: data.keterangan,
                cara_pembayaran: data.payment ? {value: data.payment?.id, label: data.payment?.cara_pembayaran} : null,
                is_ppn: data.is_ppn,
                tanggal_penyerahan: data.tanggal_penyerahan,
            };
            const fetchedDetails = data.details || [];
            setItems(fetchedItems);
            setDetails(fetchedDetails);
            setOriginalItems(fetchedItems);
            setOriginalDetails(fetchedDetails);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            Swal.fire({ icon: 'error', title: 'Gagal Memuat Data', text: 'Tidak dapat mengambil detail Purchase Order.' });
        } finally { 
            setTimeout(() => {
                setContentVisible(true);
                setLoading(false);
            }, 50)
         }
    };

    // In UpdatePurchaseOrder.jsx

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        if (disabled) return;
        setDisabled(true);

        if (!items.purchase_request_id || !items.tanggal) {
            Swal.fire({ icon:'warning', title:'Data belum lengkap', text:'Silakan pastikan Purchase Request terhubung dan Tanggal telah diisi!' });
            setDisabled(false); return;
        }
        if (!details.length) {
            Swal.fire({ icon:'warning', title:'Detail kosong', text:'Tambahkan minimal satu detail barang.' });
            setDisabled(false); return;
        }

        // Per-row validation
        for (let i=0; i < details.length; i++){
            const d = details[i];
            
            // FIXED: Check for the ID in the correct order of priority.
            // 1. `selectedBarang.id` (for new/edited items)
            // 2. `barang_id` (for initial items loaded from the API)
            // 3. `barang_detail.id` (from initial load, new structure)
            const barangId = d.selectedBarang?.id ?? d.barang_detail?.id ?? d.barang_id;
            
            if (!barangId) {
                throw new Error(`Baris #${i+1}: Barang belum dipilih.`);
            }
            if (!d.qty && !d.requested_qty || Number(d.qty || d.requested_qty) <= 0) {
                throw new Error(`Baris #${i+1}: Kuantitas (Qty) harus lebih dari 0.`);
            }
            if (d.harga_sub_total == null || isNaN(Number(String(d.harga_sub_total).replace(/,/g, '')))) {
                throw new Error(`Baris #${i+1}: Harga Sub Total tidak valid.`);
            }
        }

        const fd = new FormData();
        fd.append('invent_purchase_request_id', items.purchase_request_id); 
        fd.append('tanggal', items.tanggal);
        if (items.kode_suplier) fd.append('kode_suplier', items.kode_suplier);
        if (items.alamat) fd.append('alamat', items.alamat);
        if (items.tanggal_penyerahan) fd.append('tanggal_penyerahan', items.tanggal_penyerahan);
        if (items.keterangan) fd.append('keterangan', items.keterangan);
        if (items.cara_pembayaran) fd.append('cara_pembayaran', items.cara_pembayaran?.value);
        
        // --- PERBAIKAN: Selalu kirim nilai is_ppn ---
        fd.append('is_ppn', items.is_ppn); // Kirim 1 atau 0

        details.forEach(d => {
            // FIXED: Use the same robust logic to find the ID for submission
            const barangId = d.selectedBarang?.id ?? d.barang_detail?.id ?? d.barang_id;
            const quantity = d.qty || d.requested_qty; // Use new qty if available, otherwise fallback to original

            // The backend expects 'invent_barangs_id[]' based on your Postman screenshot
            fd.append('invent_barangs_id[]', String(barangId)); 
            fd.append('qty[]', String(quantity));
            fd.append('harga_sub_total[]', String(d.harga_sub_total).replace(/,/g, ''));
        });

        fd.append('_method', 'PUT');

        const res = await api.post(`purchaseOrder-update/${decryptedId}`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        Swal.fire({
            title:'Purchase Order berhasil diubah!',
            icon:'success', 
            timer:2000,
            showConfirmButton:false
        });
        navigate('/purchase-order/list-purchase-order');
    
    } catch (err) {
        const msg = err.message || err?.response?.data?.message || 'Terjadi kesalahan pada sistem.';
        Swal.fire({ 
            icon:'error',
            title:'Gagal Mengubah Purchase Order',
            text: msg
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
            // FIXED: Ensure state structure is consistent on reset
            setItems({
                purchase_request: '',
                purchase_request_id: null,
                tanggal: '',
                kode_suplier: '',
                kode: '',
                alamat: '',
                keterangan: '',
                cara_pembayaran: null,
                tanggal_penyerahan: '',
            });
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
                <div className='xs:px-0 md:px-4'>
                    <Back goHome={() => navigate('/purchase-order/list-purchase-order')} />
                    <p className='lg:text-3xl text-2xl font-semibold capitalize my-4'>Update Purchase Order</p>
                    { loading && <Loader Class="mt-44"/> }
                    <Transition contentVisible={contentVisible}>
                    {/* <div className="p-7 bg-white rounded-lg border border-gray-300 shadow-xl shadow-gray-200">
                        <div className='flex justify-between items-center mb-4'>
                            <p className="text-xl text-gray-400 font-semibold mb-2">Purchase Request</p>
                            <p className={`flex py-2 px-3 items-center lg:text-[14px] xs:text-xs text-center gap-1 rounded-md font-medium ${purchaseRequest.is_completed ? 'text-green-700 bg-green-100 border border-green-500' : 'text-amber-700 bg-amber-100 border border-amber-500'}`}>
                            {purchaseRequest.is_completed ? <><i className='bx bxs-check-circle lg/md:text-sm xs:text-lg pe-1'></i>Selesai</> : <><i className='bx bxs-time lg/md:text-sm xs:text-lg pe-1'></i>Belum selesai</> }</p>
                        </div>
                        { !purchaseRequest ?
                            (
                            <p className="text-gray-400 italic">No purchase request data</p>
                            ) : (
                            <>
                                <p className="font-bold text-lg">{purchaseRequest?.kode}</p>
                                <p className="">{purchaseRequest?.note}</p>
                                <p className="mb-4">{DateFormat(purchaseRequest?.tanggal)}</p>
                                <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-3 py-2 rounded-l-md">No</th>
                                        <th className="px-3 py-1">Barang</th>
                                        <th className="px-3 py-1 rounded-r-md">Quantity</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {detailPR?.map((item, i) => (
                                        <tr key={item.id} className={` ${item.id % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                        <td className="px-4 py-4 rounded-l-md">{i + 1}</td>
                                        <td className="px-4 py-4 rounded-r-md">
                                            <div className='flex items-center gap-3'>
                                            <img src={`${apiUrl}${item.barangs?.image}`} alt="item image" className="max-w-[10rem] object-cover rounded shadow cursor-pointer"
                                                onClick={() => handleImageClick(`${apiUrl}${item.barangs?.image}`)}
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900">{item.barangs?.name}</p>
                                                <p className="text-xs text-gray-500">{item.barangs?.kode_barang}</p>
                                            </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 rounded-r-md">{item.qty}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                </div>
                            </>
                            )
                        }
                    </div> */}
                    <div className="p-7 bg-white rounded-lg border border-gray-300 shadow-xl shadow-gray-200">
                        <form onSubmit={handleSubmit} className='space-y-5'>
                            <div className="mb-5 space-y-2">
                                <label className='font-semibold'>Purchase Request</label>
                                <div className='bg-gray-200 px-4 py-2 rounded-md border border-gray-300'>
                                    <input 
                                        type="text" 
                                        name="purchase_request" 
                                        value={items.purchase_request} 
                                        readOnly // Use readOnly instead of onChange for disabled fields
                                        className="w-full p-2 bg-transparent placeholder:text-gray-400"
                                        placeholder='Purchase Request'
                                        disabled
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className='font-semibold'>Tanggal</label>
                                <div className='bg-white py-2 px-4 rounded-md border border-gray-300 mt-2'>
                                <input 
                                    type="date" 
                                    name="tanggal" 
                                    value={items.tanggal} 
                                    onChange={e => setItems({ ...items, tanggal: e.target.value })}
                                    className="w-full placeholder:text-gray-400"
                                    required
                                />
                                </div>
                            </div>

                            <div className='mb-4'>
                                <label className='font-semibold'>Kode Supplier</label>
                                <div className='bg-white py-2 px-4 rounded-md border-solid border-gray-300 border mt-2'>
                                <input 
                                    type="text" 
                                    name="kode_suplier" 
                                    value={items.kode_suplier} 
                                    onChange={e => setItems({ ...items, kode_suplier: e.target.value })}
                                    className="w-full p-2 placeholder:text-gray-400"
                                    maxLength={80}
                                    placeholder='Kode Supplier'
                                    required
                                />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className='font-semibold'>Alamat</label>
                                <div className='bg-white p-2 rounded-md border-solid border-gray-300 border mt-2'>
                                <textarea
                                    name="alamat" 
                                    value={items.alamat} 
                                    onChange={e => setItems({ ...items, alamat: e.target.value })}
                                    className="w-full p-2 placeholder:text-gray-400"
                                    maxLength={255}
                                    placeholder='Alamat'
                                    required
                                    rows="3"
                                />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className='font-semibold'>Tanggal Penyerahan</label>
                                <div className='bg-white px-4 py-2 rounded-md border border-gray-300 mt-2'>
                                <input 
                                    type="date" 
                                    name="tanggal_penyerahan" 
                                    value={items.tanggal_penyerahan} 
                                    onChange={e => setItems({ ...items, tanggal_penyerahan: e.target.value })}
                                    className="w-full p-2 placeholder:text-gray-400"
                                    required
                                />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className='font-semibold'>Keterangan</label>
                                <div className='bg-white p-2 rounded-md border-solid border-gray-300 border mt-2'>
                                <textarea
                                    name="keterangan" 
                                    value={items.keterangan} 
                                    onChange={e => setItems({ ...items, keterangan: e.target.value })}
                                    className="w-full p-2 placeholder:text-gray-400"
                                    maxLength={225}
                                    placeholder='Keterangan'
                                    required
                                    rows="3"
                                />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="mb-4">
                                    <div className="flex justify-between items-center">
                                        <label className='font-semibold'>Metode Pembayaran</label>
                                        {/* {errors.cara_pembayaran && <span className="text-red-500 text-sm">{errors.cara_pembayaran}</span>} */}
                                    </div>
                                    <SelectPaginate 
                                        source={'paymentType'}
                                        selectValue={items.cara_pembayaran}
                                        selectName="Metode pembayaran"
                                        itemLabel={['payment']}
                                        handleSelectChange={(cara_pembayaran) => setItems({...items, cara_pembayaran})}
                                        className="w-full pt-2 placeholder:text-gray-400"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className='font-semibold'>PPN</label>
                                    <div className="bg-white p-2 rounded-md mt-2 flex items-center h-fit"> 
                                        <label htmlFor="is_ppn_checkbox" className="flex items-center cursor-pointer w-full">
                                            <input 
                                                type="checkbox" 
                                                id="is_ppn_checkbox"
                                                name="is_ppn" 
                                                checked={items.is_ppn == 1} // Cek jika value = 1
                                                onChange={(value) => setItems({...items, is_ppn: value.target.checked ? 1 : 0})}
                                                className="w-6 h-6 text-blue-600 bg-gray-100 border-gray-100 rounded focus:ring-blue-500"
                                            />
                                            <span className="ml-3 text-gray-700">Dikenakan PPN</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2 pt-3">
                            <p className='text-lg font-semibold'>Detail</p>
                            </div>
                                <div className="space-y-3 my-3">
                                {details.length === 0 ? (
                                    <p className="text-center py-2 text-gray-400">Belum ada data.</p>
                                ) : (
                                    details.map((item, id) => (
                                    <div
                                        key={id}
                                        className="
                                        border border-gray-300 rounded-xl p-3
                                        grid grid-cols-[80px,1fr] md:grid-cols-[160px,1fr,80px,160px,64px]
                                        items-center gap-x-4
                                        "
                                    >
                                        <div className="overflow-hidden rounded-lg bg-gray-50 w-full aspect-[4/3]">
                                            {(() => {
                                                const imageSource = item.barang_detail || item.selectedBarang;

                                                // Check if a valid source with an image exists
                                                if (imageSource && imageSource.image) {
                                                    return (
                                                        <div className="flex items-center">
                                                            <img
                                                                src={`${apiUrl}${imageSource.image}`}
                                                                alt={imageSource.name ?? 'barang'}
                                                                className="w-full h-full object-cover cursor-pointer"
                                                                onClick={() => handleImageClick(`${apiUrl}${imageSource.image}`)}
                                                            />
                                                        </div>
                                                    );
                                                } else {
                                                    // If no valid image source is found
                                                    return (
                                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                                            No Image
                                                        </div>
                                                    );
                                                }
                                            })()}
                                        </div>

                                        <div className="flex flex-col justify-between flex-grow p-1 md:p-0 md:contents">
                                            {/* Item Name */}
                                            <div>
                                                <div className="font-semibold text-gray-800">
                                                    {item.barang_detail?.name || item.selectedBarang?.name || 'Item Name'}
                                                </div>
                                            </div>

                                            {/* MODIFIED: This div now stacks its children vertically on small screens */}
                                            <div className="flex flex-col items-start mt-2 md:mt-0 md:contents">
                                                <div className="font-medium">
                                                    <span className="font-normal text-sm text-gray-400">Biaya: </span>
                                                    {PriceFormat(item.harga_sub_total) || item.selectedBarang?.harga_sub_total}
                                                </div>
                                                <div className="font-medium md:text-right">
                                                    <span className="font-normal text-sm text-gray-400">Qty: </span>
                                                    {item.requested_qty || item.qty}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* MODIFIED: This div now starts in column 2 and centers the buttons on small screens */}
                                        <div className="col-start-2 flex items-center justify-center w-full gap-2 mt-2 divide-x-2 md:col-auto md:divide-x-0 md:mt-0 md:justify-self-end md:border-l-2 md:pl-3">
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
                                                className="pl-2" // Add padding to compensate for the removed divider gap on desktop
                                            >
                                                <i className="bx bx-trash text-xl text-red-500"></i>
                                            </button>
                                        </div>

                                    </div>
                                    ))
                                    )}
                                </div>

                                <div className="flex mt-4">
                                    <button
                                        type="button"
                                        className="w-full rounded-lg py-2 px-4 flex items-center font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200"
                                        onClick={() => {
                                            setOpenModal(!openModal);
                                            setEditIndex(null);
                                            setInitialDetails({ selectedBarang: null, qty: '', harga: '' });
                                        }}>
                                        <i className='bx bx-plus mr-2 font-semibold text-base'></i>
                                        <span>{ details.length === 0 ? 'Tambah detail' : 'Tambah detail lain'}</span>
                                    </button>
                                </div>
                            <div className="flex flex-col items-center justify-center mt-10 mx-auto max-w-full w-[25rem] space-y-2 text-center">
                                <button disabled={disabled || isUnchanged} type='submit' className='w-full py-2 px-2 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 transition-colors duration-200 text-white disabled:bg-blue-300'>Update</button>
                                <button className='w-full py-2 px-2 rounded-lg font-medium border border-red-200 bg-red-50 hover:bg-red-100 transition-colors duration-200 text-red-600' onClick={resetValue} type='button'>Reset</button>
                            </div>
                        </form>
                    </div>
                    { openModal &&
                        (() => { // IIFE untuk deklarasi variabel
                            // --- LOGIKA FLEKSIBEL ---
                            // Buat array 'prItems' yang dinormalisasi
                            // Ini akan memetakan ulang array 'details' dari 'prInfo'
                            // Ini membuat properti 'barang_detail' baru, mengisinya dengan 'item.barang_detail' (jika ada)
                            // atau 'item.barangs' (jika 'barang_detail' tidak ada).
                            const normalizedPrItems = prInfo?.details?.map(item => ({
                                ...item,
                                // Fleksibel: Ambil data barang dari 'barang_detail' ATAU 'barangs'
                                barang_detail: item.barang_detail || item.barangs
                            })) || [];

                            return (
                                <ModalPO
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
                                    setOpenModal(false);
                                    setEditIndex(null);
                                }}
                                initialData={initialDetails}
                                apiUrl={apiUrl}
                                // --- DIUBAH: Gunakan data yang sudah dinormalisasi ---
                                prItems={normalizedPrItems}
                                existingItems={details}
                                // ---------------------------------
                                />
                            );
                        })()
                    }
                    </Transition>
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

export default UpdatePurchaseOrder;

