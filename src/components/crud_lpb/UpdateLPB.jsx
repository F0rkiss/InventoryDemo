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
import PurchaseRequestBarang from '../component/PurchaseRequestBarang';
import ModalPurchaseRequest from '../component/modal/ModalPurchaseRequest';
import ImagePreviewModal from '../component/modal/ImagePreviewModal';

function UpdatePurchaseRequest() {
    // ==============================
    // State
    // ==============================
    const [item, setItem] = useState({});
    const [detailPR, setDetailPR] = useState([]);       // detail barang PR
    const [prDetailQty, setPrDetailQty] = useState([]); // qty dari API
    const [makeRequestData, setMakeRequestData] = useState({}); // make request data
    const [detailMR, setDetailMR] = useState([]);       // detail make request
    const [decryptedId, setDecryptedId] = useState('');
    const [loading, setLoading] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [initialModalData, setInitialModalData] = useState({
        selectedBarang: null,
        qty: '',
    });

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');

    const { id } = useParams();
    const { role } = useAuth();
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_URL;

    // Extract MR data dari purchase request
    const mainMR = item.make_request || {};

    // =======================================================================================
    // Effects
    // =======================================================================================
    useEffect(() => {
        const decId = DecryptID(id);
        setDecryptedId(decId);
        if (!decId) navigate(-1);
    }, [id]);

    useEffect(() => {
        if (decryptedId) {
        fetchPurchaseRequest();
        }
    }, [decryptedId]);

    // ==============================
    // API Call
    // ==============================
const fetchPurchaseRequest = async () => {
        try {
        setLoading(true);
    
        // Fetch purchase request data
        const { data } = await api.get(`/purchaseRequest-detail/${decryptedId}`);
        setItem(data.data);
        setDetailPR(data.data.details || []);   // barang detail
        setPrDetailQty(data.data.qty || []);    // qty barang
    
        // Fetch make request data
        if (data.data.make_request?.id) {
            const makeRequestId = data.data.make_request.id;
            const url =
            role === "admin"
                ? `/inventMakeRequest-admin/detail/${makeRequestId}`
                : `/inventMakeRequest-detail/${makeRequestId}`;
    
            const makeRequestResponse = await api.get(url);
    
            const mrData = makeRequestResponse.data.data.makeRequest.MR;
            const details = makeRequestResponse.data.data.makeRequest.detailsMR || [];
    
            setMakeRequestData(mrData);
            setDetailMR(details);
        }
    
        // Convert detailPR to selectedItems format for modal
        const qtyDataMap = new Map();
        (data.data.qty || []).forEach((q) => {
            qtyDataMap.set(String(q.barang_id), q);
        });
    
        const convertedItems = (data.data.details || []).map((pr, index) => {
            const qtyData = qtyDataMap.get(
            String(pr.barangs?.id || pr.invent_barangs_id)
            );
            return {
            selectedBarang: pr.barangs,
            qty: qtyData?.requested_qty || 0,
            originalIndex: index,
            };
        });
        setSelectedItems(convertedItems);
        } catch (error) {
        console.error("Error fetchPurchaseRequest:", error);
        } finally {
        setLoading(false);
        setTimeout(() => setContentVisible(true), 50);
        }
        // console.log(makeRequestData.id)
    };
    

    // ==============================
    // Helpers
    // ==============================
    const qtyMap = useMemo(() => {
        const map = new Map();
        (prDetailQty || []).forEach(q => {
        map.set(String(q.barang_id), q);
        });
        return map;
    }, [prDetailQty]);

    const getQty = (prRow, type = 'requested_qty') => {
        if (!prRow) return '-';
        const barangId = prRow.invent_barangs_id ?? prRow.barangs?.id;
        if (!barangId) return '-';

        const found = qtyMap.get(String(barangId));
        return found?.[type] ?? '-';
    };

    // ==============================
    // Modal Handlers
    // ==============================
    const handleOpenModal = (item = null, index = null) => {
        if (item && index !== null) {
            // Edit mode
            setEditIndex(index);
            setInitialModalData(item);
        } else {
            // Add mode
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
            // Update existing item
            setSelectedItems(
                selectedItems.map((item, idx) => (idx === editIndex ? data : item))
            );
        } else {
            // Add new item
            setSelectedItems([...selectedItems, data]);
        }
        setOpenModal(false);
        setEditIndex(null);
    };

    const handleRemoveItem = (index) => {
        setSelectedItems(
            selectedItems.filter((_, idx) => idx !== index)
        );
    };

    // ==============================
    // Image Preview
    // ==============================

    const handleClosePreview = () => {
        setIsPreviewOpen(false);
        setSelectedImageUrl('');
        };

    const handleImageClick = (imageUrl) => {
        setSelectedImageUrl(imageUrl);
        setIsPreviewOpen(true);
        };


    // ==============================
    // Update Purchase Request
    // ==============================
    const handleUpdatePurchaseRequest = async () => {
        if (selectedItems.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Tidak ada barang dipilih',
            text: 'Silakan pilih minimal satu barang untuk purchase request.',
        });
        return;
        }

        try {
        setSubmitting(true);

        const barangIds = selectedItems
            .map(item => item.selectedBarang?.id)
            .filter(Boolean);

        const qty = selectedItems.map(item => item.qty);

        console.log('Payload dikirim:', {
            invent_make_request_id: makeRequestData?.id,
            kode: item.kode,
            note: item.note,
            tanggal: new Date().toISOString().split('T')[0],
            barangIds,
            qty,
        });

        await api.put(`/purchaseRequest-update/${decryptedId}`, {
            invent_make_request_id: makeRequestData?.id,
            kode: item.kode,
            note: 'Latest Update Purchase Request',
            tanggal: new Date().toISOString().split('T')[0],
            barangIds,
            qty,
        });

        Swal.fire({
            title: 'Purchase Request berhasil diupdate!',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
        });

        setTimeout(() => {
            navigate('/purchase-request/list-purchase-request');
        }, 1200);
        } catch (error) {
        console.error('Error updating purchase request:', error);
        Swal.fire({
            icon: 'error',
            title: 'Gagal mengupdate Purchase Request',
            text: error.response?.data?.msg || 'Ada kesalahan dalam sistem',
        });
        } finally {
        setSubmitting(false);
        }
    };

    // ==============================
    // Render
    // ==============================
    return (
        
        <Layout title="Update Purchase Request">
        <Block>
            <div className="px-4">
            <Transition contentVisible={contentVisible}>
                {/* HEADER */}
                <div className="flex items-center justify-between mb-4">
                <Back goHome={() => navigate('/purchase-request/list-purchase-request')} />
                <p
                    className={`py-2 px-2 rounded-md ${
                    item.is_full_approval
                        ? 'text-amber-700 bg-amber-200'
                        : 'text-green-700 bg-green-200'
                    }`}
                >
                    {item.is_full_approval ? 'Pending' : 'Approved'}
                </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 mt-3">
                {/* MAIN INFO */}
                <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                <p className="font-semibold text-gray-400 mb-2 text-xl">Purchase Request Information</p>
                <p className="text-xl font-bold capitalize">{item.kode}</p>
                <p className="text-lg mb-4">{DateFormat(item.tanggal, false)}</p>

                <div className="space-y-3">
                <InfoRow label="Employee Name" value={item.user?.EmpName} />
                <InfoRow label="Employee Code" value={item.user?.EmpCode} />
                <InfoRow label="Employee Email" value={item.user?.email} />
                <InfoRow label="Status Purchase Order" value={<p
                    className={`py-1 px-4 text-xs font-medium rounded ${
                    item.can_be_deleted
                        ? 'text-amber-600 bg-amber-100'
                        : 'text-green-700 bg-green-200'
                    }`}
                >
                    {item.can_be_deleted
                    ? 'Belum Masuk Purchase Order'
                    : 'Sudah Masuk Purchase Order'}
                </p>} />
                </div>

                </div>

                {/* MR INFO */}
                <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                <p className="font-semibold text-gray-400 mb-2 text-xl">Make Request Information</p>
                <p className="text-lg font-bold">{mainMR.kode}</p>
                <p className="text-sm text-gray-500 mb-4">{DateFormat(mainMR.tanggal, false)}</p>

                <div className="space-y-3">
                    <InfoRow label="Pembuat Permintaan" value={mainMR.user?.EmpName} />
                    <InfoRow label="Email" value={mainMR.user?.email} />
                    <InfoRow label="Type Request" value={mainMR.type_request?.name} />
                    <InfoRow label="Jenis" value={mainMR.type_request?.jenis} />
                    <InfoRow label="Deskripsi" value={mainMR.type_request?.description} />
                </div>
                </div>
                </div>

                {/*
                // ========================================================================================================================
                // MR DETAIL
                // ========================================================================================================================
                */}
                <div className="bg-white border rounded-md p-6 mt-6">
                <p className="font-semibold text-gray-400 mb-4 text-xl">Make Request Details</p>
                {detailMR.length === 0 ? (
                    <p className="text-gray-400 italic">No detail data</p>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead>
                        <tr className="bg-gray-100">
                            <th className="px-3 py-2 rounded-l-md">No</th>
                            <th className="px-3 py-1">Note Barang</th>
                            <th className="px-3 py-1 rounded-r-md">Qty</th>
                        </tr>
                        </thead>
                        <tbody>
                        {detailMR.map((d, i) => (
                            <tr
                            key={d.id}
                            className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                            >
                            <td className="px-4 py-4 rounded-l-md">{i + 1}</td>
                            <td className="px-4 py-4">{d.note_barang}</td>
                            <td className="px-4 py-4 rounded-r-md">{d.qty}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
                </div>

            {/*
                // ========================================================================================================================
                // PR DETAIL
                // ========================================================================================================================
            */}
                <div className="bg-white border rounded-md p-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-xl text-gray-400 font-semibold">Detail Purchase Request</p>
                    <div className="text-sm text-gray-500">
                    {selectedItems.length} barang
                    </div>
                </div>

                {selectedItems.length === 0 ? (
                    <p className="text-gray-400 italic text-center py-4">
                    Belum ada barang dipilih
                    </p>
                ) : (
                    <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="bg-gray-100">
                        <th className="px-3 py-2 rounded-l-md">No</th>
                        <th className="px-3 py-1">Barang</th>
                        <th className="px-3 py-1">Jumlah Diminta</th>
                        <th className="px-3 py-1 rounded-r-md">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedItems.map((item, i) => (
                        <tr
                            key={i}
                            className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                        >
                            <td className="px-4 py-4 rounded-l-md">{i + 1}</td>
                            <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                                {item.selectedBarang?.image && (
                                <img
                                    src={`${apiUrl}${item.selectedBarang.image}`}
                                    alt={item.selectedBarang.name}
                                    className="max-w-[10rem] object-cover rounded shadow cursor-pointer"
                                    onClick={() => handleImageClick(`${apiUrl}${item.selectedBarang.image}`)}
                                />
                                )}
                                <div>
                                <p className="font-medium text-gray-900">{item.selectedBarang?.name}</p>
                                <p className="text-xs text-gray-500">{item.selectedBarang?.kode_barang}</p>
                                </div>
                            </div>
                            </td>
                            <td className="px-4 py-4">{item.qty}</td>
                            <td className="px-4 py-4 rounded-r-md">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenModal(item, i)}
                                    className="text-cyan-600 hover:text-cyan-700"
                                    title="Edit"
                                >
                                    <i className="bx bx-edit text-lg"></i>
                                </button>
                                <button
                                    onClick={() => handleRemoveItem(i)}
                                    className="text-red-500 hover:text-red-600"
                                    title="Hapus"
                                >
                                    <i className="bx bx-trash text-lg"></i>
                                </button>
                            </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                )}

                {/* Add Item Button */}
                <div className="flex justify-center mt-5">
                    <button
                        type="button"
                        className="text-3xl font-light text-gray-700 hover:text-gray-900"
                        onClick={() => handleOpenModal()}
                    >
                        <i className="bx bx-plus"></i>
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

        <ImagePreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        imageUrl={selectedImageUrl}
        />

        {/* Modal */}
        {openModal && (
            <ModalPurchaseRequest
                open={openModal}
                onClose={handleCloseModal}
                onSave={handleSave}
                initialData={initialModalData}
                apiUrl={apiUrl}
                existingItems={selectedItems}
            />
        )}
        </Layout>
    );
    }

    // ==============================
    // Small Reusable Components
    // ==============================
    const InfoRow = ({ label, value }) => (
    <div className="flex justify-between">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium">{value || '-'}</span>
    </div>
);

export default UpdatePurchaseRequest;
