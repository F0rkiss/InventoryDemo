import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Block } from 'framework7-react';
import Swal from 'sweetalert2';

import api from '../../api/api';
import { useAuth } from '../../auth/AuthContext';
import { DecryptID } from '../../helper/EncryptHelper';
import DateFormat from '../../helper/DateFormatHelper';

import Layout from '../component/Layout';
import Back from '../component/Back';
import Transition from '../component/Transition';
import ModalPurchaseRequest from '../component/modal/ModalPurchaseRequest';

import ImagePreviewModal from '../component/modal/ImagePreviewModal';

function CreatePurchaseRequest() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { role } = useAuth();

    // === State ===
    const [item, setItem] = useState({});
    const [decryptedId, setDecryptedId] = useState('');
    const [loading, setLoading] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [kodeValue, setKodeValue] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);

    const [openModal, setOpenModal] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [initialModalData, setInitialModalData] = useState({
        selectedBarang: null,
        qty: '',
    });

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');

    const apiUrl = import.meta.env.VITE_URL;

    // === Effects ===
    useEffect(() => {
        const decId = DecryptID(id);
        setDecryptedId(decId);
        if (!decId) navigate(-1);
    }, [id, navigate]);

    useEffect(() => {
        if (decryptedId) fetchItems();
    }, [decryptedId]);

    // === API ===
    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await api.get(`purchaseRequest-makeRequest/detail/${decryptedId}`);
            setItem(res.data?.data || res.data); // antisipasi struktur response
            // console.log('API Response:', res.data);
        } catch (err) {
            console.error('Error fetching items:', err);
        } finally {
            setLoading(false);
            setTimeout(() => setContentVisible(true), 50);
        }
    };

    // === Handlers ===
    const handleCreatePurchaseRequest = async () => {
        if (selectedItems.length === 0) {
            return Swal.fire({
                icon: 'warning',
                title: 'Tidak ada barang dipilih',
                text: 'Silakan pilih minimal satu barang untuk purchase request.',
            });
        }

        try {
            setSubmitting(true);

            await api.post(`/purchaseRequest-create/${decryptedId}`, {
                make_request_id: decryptedId,
                kode: kodeValue,
                note: 'Purchase request created from make request',
                tanggal: new Date().toISOString().split('T')[0],
                barangIds: selectedItems.map(it => it.selectedBarang?.id).filter(Boolean),
                qty: selectedItems.map(it => it.qty),
            });

            Swal.fire({
                title: 'Purchase Request berhasil dibuat!',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });

            setTimeout(() => navigate('/purchase-request/list-make-purchase-request'), 1200);
        } catch (err) {
            console.error('Error creating purchase request:', err);
            Swal.fire({
                icon: 'error',
                title: 'Gagal membuat Purchase Request',
                text: err.response?.data?.msg || 'Ada kesalahan dalam sistem',
            });
        } finally {
            setSubmitting(false);
        }
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


    return (
        <Layout title="Create Purchase Request">
            <Block>
                <div className="px-4">
                    <Transition contentVisible={contentVisible}>
                        {/* === Header === */}
                        <div className="flex items-center justify-between mb-4">
                            <Back goHome={() => navigate('/make-purchase-request/list-make-purchase-request')} />
                            <p
                                className={`py-2 px-2 rounded-md ${
                                item.is_full_approval
                                    ?
                                    'text-green-700 bg-green-200'
                                    :
                                    'text-amber-700 bg-amber-200'
                                }`}
                            >
                                {item.is_full_approval ? 'Approved': 'Pending'}
                            </p>
                        </div>

                        {/* === Main & Detail === */}
                        <div className="flex flex-col lg:flex-row gap-4 mt-3">
                            {/* Main Information */}
                            <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                                <p className="font-semibold text-gray-400 mb-2 text-xl">Main Information</p>
                                <p className="text-xl font-bold capitalize">{item.kode}</p>
                                <p className="text-lg mb-4">{DateFormat(item.tanggal, false)}</p>

                                <div className="space-y-3">
                                    <InfoRow label="Employee Name" value={item.user?.EmpName} />
                                    <InfoRow label="Employee Code" value={item.user?.EmpCode} />
                                    <InfoRow label="Employee Email" value={item.user?.email} />
                                </div>
                            </div>

                            {/* Detail */}
                            <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                                <p className="font-semibold text-gray-400 mb-4 text-xl">Detail</p>
                                {item.details?.length === 0 ? (
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
                                            {item.details?.map((d, i) => (
                                                <tr
                                                    key={d.id || i}
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
                        </div>

                        {/* === Barang Selection === */}
                        <div className="bg-white border rounded-md p-6 mt-6">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-xl text-gray-400 font-semibold">Pilih Barang</p>
                                <div className="text-sm text-gray-500">
                                    {selectedItems.length} dari {item.details?.length || 0} barang dipilih
                                </div>
                            </div>

                            {/* Selected Items Table */}
                            <div className="mb-4">
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
                                                <th className="px-3 py-1">Jumlah</th>
                                                <th className="px-3 py-1 rounded-r-md">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedItems.map((sItem, i) => (
                                                <tr
                                                    key={i}
                                                    className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                                                >
                                                    <td className="px-4 py-4 rounded-l-md">{i + 1}</td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {sItem.selectedBarang?.image && (
                                                                <img
                                                                    src={`${apiUrl}${sItem.selectedBarang.image}`}
                                                                    alt={sItem.selectedBarang.name}
                                                                    className="max-w-[10rem] object-cover rounded shadow cursor-pointer"
                                                                    onClick={() => handleImageClick(`${apiUrl}${sItem.selectedBarang.image}`)}
                                                                />
                                                            )}
                                                            <div>
                                                                <p className="font-medium text-gray-900">
                                                                    {sItem.selectedBarang?.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {sItem.selectedBarang?.kode_barang}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">{sItem.qty}</td>
                                                    <td className="px-4 py-4 rounded-r-md">
                                                        <div className="flex gap-2">
                                                            {/* Edit Button */}
                                                            <button
                                                                onClick={() => {
                                                                    setEditIndex(i);
                                                                    setInitialModalData(sItem);
                                                                    setOpenModal(true);
                                                                }}
                                                                className="text-cyan-600 hover:text-cyan-700"
                                                                title="Edit"
                                                            >
                                                                <i className="bx bx-edit text-lg"></i>
                                                            </button>
                                                            {/* Delete Button */}
                                                            <button
                                                                onClick={() =>
                                                                    setSelectedItems(
                                                                        selectedItems.filter(
                                                                            (_, idx) => idx !== i
                                                                        )
                                                                    )
                                                                }
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
                            </div>

                            {/* Add Item Button */}
                            <div className="flex justify-center mt-5">
                                {selectedItems.length < (item.details?.length || 0) ? (
                                    <button
                                        type="button"
                                        className="text-3xl font-light text-gray-700 hover:text-gray-900"
                                        onClick={() => {
                                            setOpenModal(true);
                                            setEditIndex(null);
                                            setInitialModalData({ selectedBarang: null, qty: '' });
                                        }}
                                    >
                                        <i className="bx bx-plus"></i>
                                    </button>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">
                                        Maksimal {item.details?.length || 0} barang sesuai detail make request
                                    </p>
                                )}
                            </div>

                            {/* Kode Field */}
                            <div className="mt-6">
                                <label
                                    htmlFor="kode"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Kode
                                </label>
                                <input
                                    type="text"
                                    id="kode"
                                    value={kodeValue}
                                    onChange={e => setKodeValue(e.target.value)}
                                    placeholder="Masukkan kode..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                        placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* === Action Buttons === */}
                        <div className="flex justify-end mt-6 gap-3">
                            <button
                                onClick={handleCreatePurchaseRequest}
                                disabled={submitting || selectedItems.length === 0}
                                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 
                                    text-white px-6 py-2 rounded-md font-medium"
                            >
                                {submitting ? 'Creating...' : 'Create Purchase Request'}
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

            {/* === Modal === */}
            {openModal && (
                <ModalPurchaseRequest
                    open={openModal}
                    onClose={() => {
                        setOpenModal(false);
                        setEditIndex(null);
                    }}
                    onSave={data => {
                        if (editIndex !== null) {
                            setSelectedItems(
                                selectedItems.map((it, idx) => (idx === editIndex ? data : it))
                            );
                        } else {
                            setSelectedItems([...selectedItems, data]);
                        }
                        setOpenModal(false);
                        setEditIndex(null);
                    }}
                    initialData={initialModalData}
                    apiUrl={apiUrl}
                    existingItems={selectedItems}
                    maxItems={item.details?.length || 0}
                />
            )}
        </Layout>
    );
}


function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}

export default CreatePurchaseRequest;
