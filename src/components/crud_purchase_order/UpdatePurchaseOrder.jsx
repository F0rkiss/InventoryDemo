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

function UpdatePurchaseOrder() {
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

    useEffect(() => {
        // Wait until original data is loaded
        if (!originalItems || !originalDetails) return;

        // Compare all top-level fields
        const prChanged = items.purchase_request?.value !== originalItems.purchase_request?.value;
        const dateChanged = items.tanggal !== originalItems.tanggal;
        const kodeChanged = items.kode !== originalItems.kode;
        const kodeSuplierChanged = items.kode_suplier !== originalItems.kode_suplier;
        const keteranganChanged = items.keterangan !== originalItems.keterangan;
        const alamatChanged = items.alamat !== originalItems.alamat;
        const pembayaranChanged = items.cara_pembayaran !== originalItems.cara_pembayaran;
        const datePenyerahanChanged = items.tanggal_penyerahan !== originalItems.tanggal_penyerahan;

        // Compare details array deeply
        let detailsChanged = false;
        if (details.length !== originalDetails.length) {
            detailsChanged = true;
        } else {
            detailsChanged = details.some((detail, index) => {
            const orig = originalDetails[index];
            return (
                detail.invent_barangs_id !== orig.invent_barangs_id ||
                detail.qty !== orig.qty ||
                detail.harga_sub_total !== orig.harga_sub_total 
            );
            });
        }

        // If any field changed, mark as changed
        const hasChanges =
            prChanged ||
            dateChanged ||
            kodeChanged ||
            kodeSuplierChanged ||
            keteranganChanged ||
            alamatChanged ||
            pembayaranChanged ||
            datePenyerahanChanged ||
            detailsChanged;

        setIsUnchanged(!hasChanges);
    }, [items, details, originalItems, originalDetails]);


    const fetchItem = async () => {
        try {
            const response = await api.get(`purchaseOrder-detail/${decryptedId}`);
            const data = response.data.data;
            const fetchedItems = {
                purchase_request : data.purchase_request ? { value: data.purchase_request?.id, label: data.purchase_request?.kode } : null,
                tanggal : data.tanggal,
                kode_suplier: data.kode_suplier,
                kode: data.kode,
                alamat: data.alamat,
                keterangan: data.keterangan,
                cara_pembayaran: data.cara_pembayaran,
                tanggal_penyerahan: data.tanggal_penyerahan,
            };
            const fetchedDetails = data.details || [];
            setItems(fetchedItems);
            setDetails(fetchedDetails);
            setOriginalItems(fetchedItems);
            setOriginalDetails(fetchedDetails);
        } catch (error) {

        } finally { 
            setTimeout(() => setContentVisible(true), 50)
         }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (disabled) return;
            setDisabled(true);

            // basic validations
            if (!items.purchase_request?.value || !items.tanggal) {
                Swal.fire({ icon:'warning', title:'Data belum lengkap',
                text:'Silakan lengkapi Purchase Request dan Tanggal!' });
                setDisabled(false); return;
            }
            if (!details.length) {
                Swal.fire({ icon:'warning', title:'Detail kosong',
                text:'Tambahkan minimal satu detail barang.' });
                setDisabled(false); return;
            }

            // per-row validation
            for (let i=0;i<details.length;i++){
                const d = details[i];
                const barangId = d.barangs?.id ?? d.selectedBarang?.value;
                if (!barangId) throw new Error(`Baris #${i+1}: barang belum dipilih`);
                if (!d.qty || Number(d.qty) <= 0) throw new Error(`Baris #${i+1}: qty harus > 0`);
                if (d.harga_sub_total == null || Number.isNaN(Number(String(d.harga_sub_total).replaceAll(',','')))) {
                    throw new Error(`Baris #${i+1}: harga_sub_total wajib angka`);
                }
            }

            // Build FormData exactly like backend examples
            const fd = new FormData();
            fd.append('invent_purchase_request_id', items.purchase_request.value);
            fd.append('tanggal', items.tanggal);
            if (items.kode_suplier) fd.append('kode_suplier', items.kode_suplier);
            if (items.kode) fd.append('kode', items.kode);
            if (items.alamat) fd.append('alamat', items.alamat);
            if (items.tanggal_penyerahan) fd.append('tanggal_penyerahan', items.tanggal_penyerahan);
            if (items.keterangan) fd.append('keterangan', items.keterangan);
            if (items.cara_pembayaran) fd.append('cara_pembayaran', items.cara_pembayaran);

            // arrays must be appended once per value: field[]
            details.forEach(d => {
                const barangId = d.barangs?.id ?? d.selectedBarang?.value;
                fd.append('invent_barangs_id[]', String(barangId));
                fd.append('qty[]', String(d.qty));
                // use provided subtotal; if you store price+qty separately, compute here
                fd.append('harga_sub_total[]', String(d.harga_sub_total));
            });

            // Laravel method override (screenshot shows _method=PUT)
            fd.append('_method', 'PUT');

            // Use the correct endpoint for this contract
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
            resetValue(); // <-- call it
        } catch (err) {
            const msg = err?.response?.data?.message
            ?? (err?.message || 'Ada Kesalahan Dalam Sistem');
            Swal.fire({ 
                icon:'error',
                title:'Gagal mengubah make request',
                text: 'Kesalahan dalam sistem'});
            console.log('Update error:', err?.response?.data || err);
            resetValue(); // <-- call it
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
                <Back goHome={() => navigate('/purchase-order/list-purchase-order')} />
                <p className='lg:text-3xl text-2xl font-semibold capitalize my-4'>Update Purchase Order</p>
                <Transition contentVisible={contentVisible}>
                <div className="p-8 bg-white shadow-sm rounded-lg border">
                    <form onSubmit={handleSubmit} className='space-y-5'>
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

                        <div className="md:grid md:grid-cols-2 md:gap-x-4">
                            {/* Kode Supplier Input */}
                            <div className='mb-4'>
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

                            {/* Kode Input */}
                            <div>
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
                        </div>

                         <div className="mb-4">
                            <label className='font-semibold'>Alamat</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border mt-2'>
                            <textarea
                                name="alamat" 
                                value={items.alamat} 
                                onChange={e => setItems({ ...items, alamat: e.target.value })}
                                className="w-full min-h-fit p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light "
                                maxLength={255}
                                placeholder='Alamat'
                                required
                                rows="3"
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
                            <textarea
                                name="keterangan" 
                                value={items.keterangan} 
                                onChange={e => setItems({ ...items, keterangan: e.target.value })}
                                className="w-full min-h-fit p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light "
                                maxLength={225}
                                placeholder='Keterangan'
                                required
                                rows="3"
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
                                    {/* Image */}
                                    <div className="overflow-hidden rounded-lg bg-gray-50 w-full aspect-[4/3]">
                                    {item.barangs?.image ? (
                                        <img
                                        src={`${apiUrl}${item.barangs.image}`}
                                        alt={item.barangs?.name ?? 'barang'}
                                        className="w-full h-full object-cover cursor-pointer"
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
                                ))
                            )}
                            </div>

                            {/* This is the "Add another detail" button at the bottom */}
                            <div className="flex mt-4">
                                <button
                                    type="button"
                                    className="w-full rounded-lg py-2 px-4 flex items-center font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-color duration-200"
                                    onClick={() => {
                                        setOpenModal(!openModal);
                                        setEditIndex(null);
                                        setInitialDetails({ selectedBarang: null, qty: '', harga: '' });
                                    }}>
                                    <i className='bx bx-plus mr-2 font-semibold text-base'></i>
                                    <span>{ details.length === 0 ? 'Tambah detail' : 'Tambah detail lain'}</span>
                                </button>
                            </div>
                        <div className="flex flex-col items-center justify-self-center mt-10 max-w-full w-[25rem] space-y-2 text-center">
                            <button disabled={disabled || isUnchanged} type='submit' className='py-2 px-2 rounded-lg font-medium bg-blue-500/85 hover:bg-blue-500 transition-color duration-200 text-white disabled:bg-blue-200'>Update</button>
                            <button className='py-2 px-2 rounded-lg font-medium border border-red-200 bg-red-50 hover:bg-red-100 transition-color duration-200 text-red-600' onClick={resetValue} type='button'>Reset</button>
                        </div>
                    </form>
                </div>
                {
                    openModal && <ModalPO
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
                    initialData={initialDetails}
                    />
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