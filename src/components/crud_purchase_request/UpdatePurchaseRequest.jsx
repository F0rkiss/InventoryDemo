import React, { useEffect, useState, useMemo } from 'react';
import { Block } from 'framework7-react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import api from '../../api/api';
import Layout from '../component/Layout';
import Back from '../component/Back';
import Transition from '../component/Transition';
import DateFormat from '../../helper/DateFormatHelper';
import { DecryptID } from '../../helper/EncryptHelper';
import { useAuth } from '../../auth/AuthContext';
import ModalPurchaseRequest from '../component/modal/ModalPurchaseRequest';
import ImagePreviewModal from '../component/modal/ImagePreviewModal';
import InfoRow from '../component/infoRow';

function UpdatePurchaseRequest() {
    const [item, setItem] = useState({});
    const [detailPR, setDetailPR] = useState([]);
    const [prDetailQty, setPrDetailQty] = useState([]);
    const [makeRequestData, setMakeRequestData] = useState({});
    const [detailMR, setDetailMR] = useState([]);
    const [decryptedId, setDecryptedId] = useState('');
    const [loading, setLoading] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [initialModalData, setInitialModalData] = useState({ selectedBarang: null, qty: '' });
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');
    const [errors, setErrors] = useState({});
    const [originalItem, setOriginalItem] = useState({});
    const [originalSelectedItems, setOriginalSelectedItems] = useState([]);


    const { id } = useParams();
    const { role } = useAuth();
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_URL;

    const mainMR = item.make_request || {};

    useEffect(() => {
        const decId = DecryptID(id);
        setDecryptedId(decId);
        if (!decId) navigate(-1);
    }, [id]);

    useEffect(() => {
        if (decryptedId) fetchPurchaseRequest();
    }, [decryptedId]);

    const fetchPurchaseRequest = async () => {
        try {
        setLoading(true);
        const { data } = await api.get(`/purchaseRequest-detail/${decryptedId}`);
        setItem(data.data);
        setDetailPR(data.data.details || []);
        setDetailMR(data.data.details || []);
        setPrDetailQty(data.data.qty || []);

        setItem(data.data);
        setOriginalItem(data.data);

        setSelectedItems(convertedItems);
        setOriginalSelectedItems(convertedItems);

        const qtyDataMap = new Map();
        (data.data.qty || []).forEach(q => qtyDataMap.set(String(q.barang_id), q));

        const convertedItems = (data.data.details || []).map((pr, index) => {
            const qtyData = qtyDataMap.get(String(pr.barangs?.id || pr.invent_barangs_id));
            return { selectedBarang: pr.barangs, qty: qtyData?.requested_qty || 0, originalIndex: index };
        });
        setSelectedItems(convertedItems);
        } catch (error) {
        console.error("Error fetchPurchaseRequest:", error);
        } finally {
        setLoading(false);
        setTimeout(() => setContentVisible(true), 50);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setItem((prev) => ({ ...prev, [name]: value }));
        };

        const validateForm = () => {
            const newErrors = {};
            if (!item.tanggal) newErrors.tanggal = 'Tanggal wajib diisi';
            if (!item.note || item.note.trim() === '') newErrors.note = 'Note wajib diisi';
        
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };

    const handleOpenModal = (item = null, index = null) => {
        if (item && index !== null) {
        setEditIndex(index);
        setInitialModalData(item);
        } else {
        setEditIndex(null);
        setInitialModalData({ selectedBarang: null, qty: '' });
        }
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditIndex(null);
    };

    const handleSave = (data) => {
        if (editIndex !== null) {
        setSelectedItems(selectedItems.map((item, idx) => (idx === editIndex ? data : item)));
        } else {
        setSelectedItems([...selectedItems, data]);
        }
        setOpenModal(false);
        setEditIndex(null);
    };

    const handleRemoveItem = (index) => setSelectedItems(selectedItems.filter((_, idx) => idx !== index));

    const handleClosePreview = () => {
        setIsPreviewOpen(false);
        setSelectedImageUrl('');
    };

    const handleImageClick = (imageUrl) => {
        setSelectedImageUrl(imageUrl);
        setIsPreviewOpen(true);
    };


    const handleUpdatePurchaseRequest = async () => {
        if (!validateForm()) return;
    
        const isItemChanged = JSON.stringify(item) !== JSON.stringify(originalItem);
        const isSelectedChanged = JSON.stringify(selectedItems) !== JSON.stringify(originalSelectedItems);
    
        if (!isItemChanged && !isSelectedChanged) {
            Swal.fire({
                icon: 'info',
                title: 'Tidak ada perubahan',
                text: 'Data masih sama seperti sebelumnya',
                timer: 1500,
                showConfirmButton: false
            });
            setTimeout(() => navigate('/purchase-request/list-purchase-request'), 1000);
            return;
        }
    
        try {
            setSubmitting(true);
            const barangIds = selectedItems.map(item => item.selectedBarang?.id).filter(Boolean);
            const qty = selectedItems.map(item => item.qty);
    
            await api.put(`/purchaseRequest-update/${decryptedId}`, {
                invent_make_request_id: item.make_request?.id,
                note: item.note,
                tanggal: item.tanggal,
            });
    
            Swal.fire({
                title: 'Purchase Request berhasil diPerbarui!',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            setTimeout(() => navigate('/purchase-request/list-purchase-request'), 1200);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal mengupdate Purchase Request',
                text: error.response?.data?.msg || 'Ada kesalahan dalam sistem'
            });
        } finally {
            setSubmitting(false);
        }
    };
    

    return (
        <Layout title="Update Purchase Request">
        <Block>
            <div className="px-4 sm:px-6 md:px-10">
            <Transition contentVisible={contentVisible}>
                {/* HEADER */}
                <div className="flex items-center justify-between mb-4">
                <Back goHome={() => navigate('/purchase-request/list-purchase-request')} />
        
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-semibold capitalize">
                    Update Purchase Request
                </p>

                <div className="flex flex-col lg:flex-row gap-4 mt-3">
                {/* MAIN INFO */}
                <div className="bg-white border rounded-md p-4 sm:p-6 flex-1 min-h-[200px]">
                    <p className="font-semibold text-gray-400 mb-2 text-lg sm:text-xl">Purchase Request Information</p>
                    <p className="text-lg sm:text-xl font-bold capitalize">{item.kode}</p>
                    <p className="text-sm sm:text-lg mb-4">{DateFormat(item.tanggal, false)}</p>
                    <div className="space-y-2 sm:space-y-3">
                    <InfoRow label="Employee Name" value={item.user?.EmpName} />
                    <InfoRow label="Employee Code" value={item.user?.EmpCode} />
                    <InfoRow label="Employee Email" value={item.user?.email} />
                    <InfoRow label="Status Purchase Order" value={
                        <p className={`py-1 px-3 text-xs sm:text-sm font-medium rounded ${item.can_be_deleted ? 'text-amber-600 bg-amber-100' : 'text-green-700 bg-green-200'}`}>
                        {item.can_be_deleted ? 'Belum Masuk Purchase Order' : 'Sudah Masuk Purchase Order'}
                        </p>
                    } />
                    </div>
                </div>

                {/* MR INFO */}
                <div className="bg-white border rounded-md p-4 sm:p-6 flex-1 min-h-[200px]">
                    <p className="font-semibold text-gray-400 mb-2 text-lg sm:text-xl">Make Request Information</p>
                    <p className="text-base sm:text-lg font-bold">{mainMR.kode}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mb-4">{DateFormat(mainMR.tanggal, false)}</p>
                    <div className="space-y-2 sm:space-y-3">
                    <InfoRow label="Pembuat Permintaan" value={mainMR.user?.EmpName} />
                    <InfoRow label="Email" value={mainMR.user?.email} />
                    <InfoRow label="Type Request" value={mainMR.type_request?.name} />
                    <InfoRow label="Jenis" value={mainMR.type_request?.jenis} />
                    <InfoRow label="Deskripsi" value={mainMR.type_request?.description} />
                    </div>
                </div>
                </div>

                {/* MR DETAIL */}
                <div className="bg-white border rounded-md p-4 sm:p-6 mt-6 overflow-x-auto">
                <p className="font-semibold text-gray-400 mb-4 text-lg sm:text-xl">Make Request Details</p>
                
                {detailMR.length === 0 ? (
                    <p className="text-gray-400 italic">No detail data</p>
                ) : (
                    <div className='overflow-x-auto'>
                    <table className="w-full text-sm sm:text-base text-left">
                    <thead>
                        <tr className="bg-gray-100">
                        <th className="px-2 sm:px-3 py-1 rounded-l-md">No</th>
                        <th className="px-2 sm:px-3 py-1">Note Barang</th>
                        <th className="px-2 sm:px-3 py-1 rounded-r-md">Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {detailMR.map((d, i) => (
                        <tr key={d.id} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="px-2 sm:px-4 py-2 rounded-l-md">{i + 1}</td>
                            <div className="flex items-center gap-3 px-4 py-4 rounded-l-md">
                                {d?.barangs.image && (
                                    <img
                                    src={`${apiUrl}${d?.barangs.image}`}
                                    // alt={name}
                                    className="max-w-[10rem] object-cover rounded shadow cursor-pointer"
                                    onClick={() =>
                                        handleImageClick(`${apiUrl}${d?.barangs.image}`)
                                    }
                                    />
                                    )}
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {d?.barangs.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Kode: {d?.barangs.kode_barang}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Gudang: {d?.barangs.kode_gudang}
                                    </p>
                                </div>
                            </div>
                            <td className="px-2 sm:px-4 py-2 rounded-r-md">{d.qty}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                    </div>
                )}
                </div>

                {/* PR DETAIL */}
                <div className="p-6 mt-4 bg-white shadow-sm rounded-lg border">
                            <form onSubmit={handleUpdatePurchaseRequest} className='space-y-5'>

                            <div className="mb-4">
                                    <div className="flex justify-between items-center">
                                        <label className='font-semibold'>Tanggal</label>
                                        {errors.tanggal && <span className="text-red-500 text-sm">{errors.tanggal}</span>}
                                    </div>
                                    <div className={`bg-white p-2 rounded-md border mt-2 ${errors.tanggal ? 'border-red-500' : 'border-gray-300'}`}>
                                    <input 
                                        type="date" 
                                        name="tanggal" 
                                        value={item.tanggal || ''} 
                                        onChange={handleChange}
                                        className="w-full p-2 placeholder:text-gray-400"
                                        placeholder="Tanggal"
                                    />

                                    </div>
                                </div>
                                <div className="mb-4">
                                    <div className="flex justify-between items-center">
                                        <label className='font-semibold'>note</label>
                                        {errors.note && <span className="text-red-500 text-sm">{errors.note}</span>}
                                    </div>
                                    <div className={`bg-white p-2 rounded-md border mt-2 ${errors.keterangan ? 'border-red-500' : 'border-gray-300'}`}>
                                    <textarea
                                        name="note" 
                                        value={item.note || ''} 
                                        onChange={handleChange}
                                        className="w-full min-h-fit p-2 placeholder:text-gray-400"
                                        maxLength={225}
                                        placeholder="Note"
                                        rows="3"
                                    />
                                    </div>
                                </div>
                            </form>
                        </div>

                {/* Action Buttons */}
                <div className="flex justify-end mt-6 gap-3">
                <button
                    onClick={handleUpdatePurchaseRequest}
                    disabled={submitting}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium"
                >
                    {submitting ? 'Updating...' : 'Update Purchase Request'}
                </button>
                </div>
            </Transition>
            </div>
        </Block>

        <ImagePreviewModal isOpen={isPreviewOpen} onClose={handleClosePreview} imageUrl={selectedImageUrl} />

        {openModal && (
            <ModalPurchaseRequest
            open={openModal}
            onClose={handleCloseModal}
            onSave={handleSave}
            initialData={initialModalData}
            apiUrl={apiUrl}
            existingItems={selectedItems}
            makeRequestDetails={detailMR}
            />
        )}
        </Layout>
    );
}

export default UpdatePurchaseRequest;
