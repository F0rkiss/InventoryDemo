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
        setPrDetailQty(data.data.qty || []);

        if (data.data.make_request?.id) {
            const makeRequestId = data.data.make_request.id;
            const url = role === "admin"
            ? `/inventMakeRequest-admin/detail/${makeRequestId}`
            : `/inventMakeRequest-detail/${makeRequestId}`;

            const makeRequestResponse = await api.get(url);
            const mrData = makeRequestResponse.data.data.makeRequest.MR;
            const details = makeRequestResponse.data.data.makeRequest.detailsMR || [];
            setMakeRequestData(mrData);
            setDetailMR(details);
        }

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

    const qtyMap = useMemo(() => {
        const map = new Map();
        (prDetailQty || []).forEach(q => map.set(String(q.barang_id), q));
        return map;
    }, [prDetailQty]);

    const getQty = (prRow, type = 'requested_qty') => {
        if (!prRow) return '-';
        const barangId = prRow.invent_barangs_id ?? prRow.barangs?.id;
        if (!barangId) return '-';
        const found = qtyMap.get(String(barangId));
        return found?.[type] ?? '-';
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

    // === Validation Functions ===
    const validateItemCount = () => {
        const maxItems = detailMR.length;
        if (selectedItems.length !== maxItems) {
            Swal.fire({
                icon: 'warning',
                title: 'Jumlah Detail Barang Tidak Sesuai',
                text: `Jumlah detail barang harus sesuai dengan make request. Saat ini: ${selectedItems.length} dari ${maxItems} barang yang diperlukan.`,
            });
            return false;
        }
        return true;
    };

    const validateQuantity = () => {
        // Create a map of make request details for quantity validation
        const mrDetailsMap = new Map();
        detailMR.forEach(detail => {
            if (detail.invent_barang_id) {
                mrDetailsMap.set(String(detail.invent_barang_id), detail.qty);
            }
        });

        // Check each selected item's quantity against make request
        for (const selectedItem of selectedItems) {
            const barangId = selectedItem.selectedBarang?.id;
            if (barangId) {
                const mrQty = mrDetailsMap.get(String(barangId));
                if (mrQty && selectedItem.qty > mrQty) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Jumlah Quantity Tidak Sesuai',
                        text: `Quantity untuk barang "${selectedItem.selectedBarang.name}" (${selectedItem.qty}) melebihi permintaan make request (${mrQty}).`,
                    });
                    return false;
                }
            }
        }
        return true;
    };

    const handleUpdatePurchaseRequest = async () => {
        if (selectedItems.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Tidak ada barang dipilih', text: 'Silakan pilih minimal satu barang.' });
        return;
        }

        // Validate item count
        if (!validateItemCount()) {
            return;
        }

        // Validate quantity
        if (!validateQuantity()) {
            return;
        }

        try {
        setSubmitting(true);
        const barangIds = selectedItems.map(item => item.selectedBarang?.id).filter(Boolean);
        const qty = selectedItems.map(item => item.qty);

        await api.put(`/purchaseRequest-update/${decryptedId}`, {
            invent_make_request_id: makeRequestData?.id,
            kode: item.kode,
            note: 'Latest Update Purchase Request',
            tanggal: new Date().toISOString().split('T')[0],
            barangIds,
            qty,
        });

        Swal.fire({ title: 'Purchase Request berhasil diupdate!', icon: 'success', timer: 2000, showConfirmButton: false });
        setTimeout(() => navigate('/purchase-request/list-purchase-request'), 1200);
        } catch (error) {
        console.error('Error updating purchase request:', error);
        Swal.fire({ icon: 'error', title: 'Gagal mengupdate Purchase Request', text: error.response?.data?.msg || 'Ada kesalahan dalam sistem' });
        } finally { setSubmitting(false); }
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
                    Detail Purchase Request
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
                            <td className="px-2 sm:px-4 py-2">{d.note_barang}</td>
                            <td className="px-2 sm:px-4 py-2 rounded-r-md">{d.qty}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                )}
                </div>

                {/* PR DETAIL */}
                <div className="bg-white border rounded-md p-4 sm:p-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-lg sm:text-xl text-gray-400 font-semibold">Detail Purchase Request</p>
                    <div className="text-sm sm:text-base text-gray-500">
                        {selectedItems.length} dari {detailMR.length} barang
                        {selectedItems.length === detailMR.length && (
                            <span className="ml-2 text-green-600 font-medium">✓ Lengkap</span>
                        )}
                    </div>
                </div>

                {selectedItems.length === 0 ? (
                    <p className="text-gray-400 italic text-center py-4">Belum ada barang dipilih</p>
                ) : (
                    <div className="overflow-x-auto max-h-[300px] sm:max-h-[400px]">
                    <table className="w-full text-sm sm:text-base text-left">
                        <thead>
                        <tr className="bg-gray-100">
                            <th className="px-2 sm:px-3 py-1 rounded-l-md">No</th>
                            <th className="px-2 sm:px-3 py-1">Barang</th>
                            <th className="px-2 sm:px-3 py-1">Jumlah Diminta</th>
                            <th className="px-2 sm:px-3 py-1 rounded-r-md">Aksi</th>
                        </tr>
                        </thead>
                        <tbody>
                        {selectedItems.map((item, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="px-2 sm:px-4 py-2 rounded-l-md">{i + 1}</td>
                            <td className="px-2 sm:px-4 py-2">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                                {item.selectedBarang?.image && (
                                    <img
                                    src={`${apiUrl}${item.selectedBarang.image}`}
                                    alt={item.selectedBarang.name}
                                    className="max-w-[8rem] sm:max-w-[10rem] object-cover rounded shadow cursor-pointer"
                                    onClick={() => handleImageClick(`${apiUrl}${item.selectedBarang.image}`)}
                                    />
                                )}
                                <div>
                                    <p className="font-medium text-gray-900">{item.selectedBarang?.name}</p>
                                    <p className="text-xs sm:text-sm text-gray-500">{item.selectedBarang?.kode_barang}</p>
                                </div>
                                </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2">{item.qty}</td>
                            <td className="px-2 sm:px-4 py-2 rounded-r-md">
                                <div className="flex gap-2">
                                <button onClick={() => handleOpenModal(item, i)} className="text-cyan-600 hover:text-cyan-700" title="Edit">
                                    <i className="bx bx-edit text-lg"></i>
                                </button>
                                <button onClick={() => handleRemoveItem(i)} className="text-red-500 hover:text-red-600" title="Hapus">
                                    <i className="bx bx-trash text-lg"></i>
                                </button>
                                </div>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                )}

                {/* Add Item Button */}
                <div className="flex mt-5">
                    <button
                    type="button"
                    className="w-full rounded-lg py-2 px-4 flex items-center justify-center font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200"
                    onClick={() => handleOpenModal()}
                    >
                    <i className='bx bx-plus mr-2 font-semibold text-base'></i>
                    <span>{ selectedItems.length === 0 ? 'Tambah detail' : 'Tambah detail lain'}</span>
                    </button>
                </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end mt-6 gap-3">
                <button
                    onClick={handleUpdatePurchaseRequest}
                    disabled={submitting || selectedItems.length === 0}
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
