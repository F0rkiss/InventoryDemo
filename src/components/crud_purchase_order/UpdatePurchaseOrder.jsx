import React, { useEffect, useState } from 'react' // --- PERUBAHAN: Menghapus useRef ---
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
import PriceFormat from '../../helper/PriceFormatHelper' // Helper ini sudah support mata uang
import ImagePreviewModal from '../component/modal/ImagePreviewModal'
import Loader from '../component/Loader'

function UpdatePurchaseOrder() {
    const [items, setItems] = useState({
        purchase_request: '', 
        purchase_request_id: null,
        tanggal: '',
        supplier: null, // Untuk SelectPaginate Supplier
        kode: '',
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
        selectedMataUang: null,
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

    // State untuk menyimpan info Purchase Request
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
    }, [id, navigate])

    useEffect(() => {
        if (decryptedId) {
            fetchItem()
        }
    }, [decryptedId])

    useEffect(() => {
        if (!originalItems || !originalDetails) return;

        // Logika pengecekan perubahan
        const itemsChanged =
            items.tanggal !== originalItems.tanggal ||
            items.supplier?.value !== originalItems.supplier?.value ||
            items.keterangan !== originalItems.keterangan ||
            items.cara_pembayaran?.id !== originalItems.cara_pembayaran?.id ||
            items.tanggal_penyerahan !== originalItems.tanggal_penyerahan ||
            items.is_ppn !== originalItems.is_ppn;

        let detailsChanged = false;
        if (details.length !== originalDetails.length) {
            detailsChanged = true;
        } else {
            detailsChanged = details.some((detail, index) => {
            const orig = originalDetails[index];
            const newMataUangId = detail.selectedMataUang?.id || detail.mata_uang_id;
            const oldMataUangId = orig.selectedMataUang?.id || orig.mata_uang_id;

            return (
                detail.invent_barangs_id !== orig.invent_barangs_id ||
                String(detail.qty) !== String(orig.qty) || 
                String(detail.harga_sub_total) !== String(orig.harga_sub_total) ||
                newMataUangId !== oldMataUangId
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

            if (data.purchase_request) {
                setPrInfo(data.purchase_request);
            }

            // Disesuaikan dengan state baru
            const fetchedItems = {
                purchase_request : data.purchase_request.kode, 
                purchase_request_id: data.purchase_request.id, 
                tanggal : data.tanggal,
                supplier: data.supplier ? { value: data.supplier.id, label: data.supplier.nama_perusahaan } : null,
                keterangan: data.keterangan,
                cara_pembayaran: data.payment ? {value: data.payment?.id, label: data.payment?.cara_pembayaran} : null,
                is_ppn: data.is_ppn,
                tanggal_penyerahan: data.tanggal_penyerahan,
            };

            // Normalisasi details untuk menyertakan selectedMataUang
            const fetchedDetails = data.details?.map(d => ({
                ...d,
                selectedMataUang: d.mata_uang ? { id: d.mata_uang.id, kode: d.mata_uang.kode } : null
            })) || [];

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (disabled) return;
            setDisabled(true);

            // Validasi supplier
            if (!items.purchase_request_id || !items.tanggal || !items.supplier) {
                Swal.fire({ icon:'warning', title:'Data belum lengkap', text:'Pastikan PR, Tanggal, dan Supplier telah diisi!' });
                setDisabled(false); return;
            }
            if (!details.length) {
                Swal.fire({ icon:'warning', title:'Detail kosong', text:'Tambahkan minimal satu detail barang.' });
                setDisabled(false); return;
            }

            // Per-row validation
            for (let i=0; i < details.length; i++){
                const d = details[i];
                
                const barangId = d.selectedBarang?.id ?? d.barang_detail?.id ?? d.barang_id;
                const mataUangId = d.selectedMataUang?.id || d.mata_uang_id;
                
                if (!barangId) {
                    throw new Error(`Baris #${i+1}: Barang belum dipilih.`);
                }
                if (!d.qty && !d.requested_qty || Number(d.qty || d.requested_qty) <= 0) {
                    throw new Error(`Baris #${i+1}: Kuantitas (Qty) harus lebih dari 0.`);
                }
                if (d.harga_sub_total == null || isNaN(Number(String(d.harga_sub_total).replace(/,/g, '')))) {
                    throw new Error(`Baris #${i+1}: Harga Sub Total tidak valid.`);
                }
                if (!mataUangId) {
                    throw new Error(`Baris #${i+1}: Mata Uang belum dipilih.`);
                }
            }

            const fd = new FormData();
            fd.append('invent_purchase_request_id', items.purchase_request_id); 
            fd.append('tanggal', items.tanggal);
            
            if (items.supplier) fd.append('invent_suplier_id', items.supplier.value);
            if (items.tanggal_penyerahan) fd.append('tanggal_penyerahan', items.tanggal_penyerahan);
            if (items.keterangan) fd.append('keterangan', items.keterangan);
            if (items.cara_pembayaran) fd.append('cara_pembayaran', items.cara_pembayaran?.value);
            
            fd.append('is_ppn', items.is_ppn); 

            details.forEach(d => {
                const barangId = d.selectedBarang?.id ?? d.barang_detail?.id ?? d.barang_id;
                const quantity = d.qty || d.requested_qty;
                const mataUangId = d.selectedMataUang?.id || d.mata_uang_id;

                fd.append('invent_barangs_id[]', String(barangId)); 
                fd.append('qty[]', String(quantity));
                fd.append('harga_sub_total[]', String(d.harga_sub_total).replace(/,/g, ''));
                fd.append('mata_uang_id[]', String(mataUangId));
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
            setItems({
                purchase_request: '',
                purchase_request_id: null,
                tanggal: '',
                supplier: null,
                keterangan: '',
                cara_pembayaran: null,
                tanggal_penyerahan: '',
                is_ppn: 0,
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
                    <div className="p-7 bg-white rounded-lg border border-gray-300 shadow-xl shadow-gray-200">
                        <form onSubmit={handleSubmit} className='space-y-5'>
                            <div className="mb-5 space-y-2">
                                <label className='font-semibold'>Purchase Request</label>
                                <div className='bg-gray-200 px-4 py-2 rounded-md border border-gray-300'>
                                    <input 
                                        type="text" 
                                        name="purchase_request" 
                                        value={items.purchase_request} 
                                        readOnly 
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
                                <label className='font-semibold'>Supplier</label>
                                <div className={`bg-white rounded-md mt-2`}>
                                <SelectPaginate 
                                    selectName="Supplier"
                                    source={'suplier'} 
                                    selectValue={items.supplier} 
                                    itemLabel={['nama_perusahaan']}
                                    handleSelectChange={(value) => setItems({...items, supplier: value})}
                                    className="w-full placeholder:text-gray-400"
                                    required
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
                                                checked={items.is_ppn == 1} 
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
                                        grid grid-cols-[80px,1fr] md:grid-cols-[160px,1fr,auto,auto,64px]
                                        items-center gap-x-4
                                        "
                                    >
                                        <div className="overflow-hidden rounded-lg bg-gray-50 w-full aspect-[4/3]">
                                            {(() => {
                                                const imageSource = item.barang_detail || item.selectedBarang;

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
                                                    return (
                                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                                            No Image
                                                        </div>
                                                    );
                                                }
                                            })()}
                                        </div>

                                        <div className="flex flex-col justify-between flex-grow p-1 md:p-0 md:contents">
                                            <div>
                                                <div className="font-semibold text-gray-800">
                                                    {item.barang_detail?.name || item.selectedBarang?.name || 'Item Name'}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-start mt-2 md:mt-0 md:contents">
                                                <div className="font-medium">
                                                    {PriceFormat(
                                                        item.harga_sub_total, 
                                                        item.selectedMataUang?.kode || item.mata_uang?.kode // Cek baru atau lama
                                                    )}
                                                </div>
                                                <div className="font-medium md:text-right">
                                                    <span className="font-normal text-sm text-gray-400">Qty: </span>
                                                    {item.requested_qty || item.qty}
                                                </div>
                                            </div>
                                        </div>
                                        
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
                                                className="pl-2" 
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
                                            setInitialDetails({ selectedBarang: null, qty: '', harga: '', selectedMataUang: null });
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
                        (() => { 
                            const normalizedPrItems = prInfo?.details?.map(item => ({
                                ...item,
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
                                prItems={normalizedPrItems}
                                existingItems={details}
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