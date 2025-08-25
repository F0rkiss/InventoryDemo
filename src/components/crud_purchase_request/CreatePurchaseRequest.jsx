import React, { useEffect, useState } from 'react';
import Back from '../component/Back';
import { Page, Block } from 'framework7-react';
import api from '../../api/api';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../component/Layout';
import { DecryptID } from '../../helper/EncryptHelper';
import Transition from '../component/Transition';
import DateFormat from '../../helper/DateFormatHelper';
import { useAuth } from '../../auth/AuthContext';
import Swal from 'sweetalert2';
import ModalPurchaseRequest from '../component/modal/ModalPurchaseRequest';
// import Loader from '../component/Loader';
// import GenerateBarangSearchField from '../component/GenerateBarangSearchField';

function CreatePurchaseRequest() {
    const [item, setItem] = useState({});
    const mainMR = item.makeRequest?.MR || {};
    const detailMR = item.makeRequest?.detailsMR || [];
    const navigate = useNavigate();
    const { id } = useParams();
    const { role } = useAuth();
    const [decryptedId, setDecryptedId] = useState('');
    const [loading, setLoading] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);
    const apiUrl = import.meta.env.VITE_URL;

    const [submitting, setSubmitting] = useState(false);
    const [kodeValue, setKodeValue] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [initialModalData, setInitialModalData] = useState({
        selectedBarang: null,
        qty: '',
    });
    const [selectedItems, setSelectedItems] = useState([]);
    const [cancelLoading, setCancelLoading] = useState(false);

    useEffect(() => {
        const decId = DecryptID(id);
        setDecryptedId(decId);
        if (!decId) navigate(-1);
    }, [id]);

    useEffect(() => {
        if (decryptedId) fetchItems();
    }, [decryptedId]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const url =
                role === 'admin'
                    ? `/inventMakeRequest-admin/detail/${decryptedId}`
                    : `/inventMakeRequest-detail/${decryptedId}`;
            const response = await api.get(url);
            setItem(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setTimeout(() => setContentVisible(true), 50);
        }
    };

    const handleCreatePurchaseRequest = async () => {
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

            const barangIds = selectedItems.map(item => item.selectedBarang?.id).filter(Boolean);
            const qty = selectedItems.map(item => item.qty);

            console.log("Payload dikirim:", {
                make_request_id: decryptedId,
                kode: kodeValue,
                note: 'Purchase request created from make request',
                tanggal: new Date().toISOString().split('T')[0],
                barangIds,
                qty,
            });

            await api.post(`/purchaseRequest-create/${decryptedId}`, {
                make_request_id: decryptedId,
                kode: kodeValue,
                note: 'Purchase request created from make request',
                tanggal: new Date().toISOString().split('T')[0],
                barangIds,
                qty,
            });

            Swal.fire({
                title: 'Purchase Request berhasil dibuat!',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });

            setTimeout(() => {
                navigate('/purchase-request/list-purchase-request');
            }, 1200);

        } catch (error) {
            console.error('Error creating purchase request:', error);
            Swal.fire({
                icon: 'error',
                title: 'Gagal membuat Purchase Request',
                text: error.response?.data?.msg || 'Ada kesalahan dalam sistem',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const cancelRequest = async () => {
        if (!decryptedId) return;

        try {
            const result = await Swal.fire({
                title: 'Batalkan Request?',
                text: 'Tindakan ini tidak dapat dibatalkan. Yakin ingin melanjutkan?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Ya, batalkan',
                cancelButtonText: 'Tidak',
            });

            if (!result.isConfirmed) return;

            setCancelLoading(true);
            const response = await api.delete(`/inventMakeRequest-delete/${decryptedId}`);

            if (response?.data?.status === 'error' ||
                response?.data?.message?.toLowerCase().includes('tidak ditemukan')) {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Membatalkan',
                    text: response.data.message || 'Data tidak ditemukan',
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Request Dibatalkan',
                    timer: 1500,
                    showConfirmButton: false,
                });
                navigate('/make-request/list-make-request');
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Kesalahan Sistem',
                text: 'Terjadi masalah saat membatalkan request.',
            });
        } finally {
            setCancelLoading(false);
        }
    };

    return (
        <Layout title="Create Purchase Request">
            <Block>
                <div className="px-4">
                    <Transition contentVisible={contentVisible}>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <Back goHome={() => navigate('/purchase-request/list-purchase-request')} />
                            <p className={`py-2 px-2 rounded-md ${item.can_be_deleted ? 'text-amber-700 bg-amber-200' : 'text-green-700 bg-green-200'}`}>
                                {item.is_full_approval}
                            </p>
                        </div>

                        {/* Main & Detail */}
                        <div className="flex flex-col lg:flex-row gap-4 mt-3">
                            {/* Main Information */}
                            <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                                <p className="font-semibold text-gray-400 mb-2 text-xl">Main Information</p>
                                <p className="text-xl font-bold capitalize">{mainMR.kode}</p>
                                <p className="text-lg mb-4">{DateFormat(mainMR.tanggal, false)}</p>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Employee Name</span>
                                        <span className="font-medium">{mainMR.EmpName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Employee Code</span>
                                        <span className="font-medium">{mainMR.EmpCode}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Employee Email</span>
                                        <span className="font-medium">{mainMR.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Detail */}
                            <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                                <p className="font-semibold text-gray-400 mb-4 text-xl">Detail</p>
                                {detailMR.length === 0 ? (
                                    <p className="text-gray-400 italic">No detail data</p>
                                ) : (
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="px-3 py-2 rounded-l-md">No</th>
                                                <th className="px-3 py-1">Note Barang</th>
                                                <th className="px-3 py-1 rounded-r-md">qty</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detailMR.map((d, i) => (
                                                <tr key={d.id} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
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

                        {/* Barang Selection */}
                        <div className="bg-white border rounded-md p-6 mt-6">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-xl text-gray-400 font-semibold">Pilih Barang</p>
                                <div className="text-sm text-gray-500">
                                    {selectedItems.length} dari {detailMR.length} barang dipilih
                                </div>
                            </div>
                            
                            {/* Selected Items Table */}
                            <div className="mb-4">
                                {selectedItems.length === 0 ? (
                                    <p className="text-gray-400 italic text-center py-4">Belum ada barang dipilih</p>
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
                                            {selectedItems.map((item, i) => (
                                                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                                    <td className="px-4 py-4 rounded-l-md">{i + 1}</td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {item.selectedBarang.image && (
                                                                <img
                                                                    src={`${apiUrl}${item.selectedBarang.image}`}
                                                                    alt={item.selectedBarang.name}
                                                                    className="w-8 h-8 object-cover rounded-md border"
                                                                />
                                                            )}
                                                            <div>
                                                                <p className="font-medium text-gray-900">{item.selectedBarang.name}</p>
                                                                <p className="text-xs text-gray-500">{item.selectedBarang.kode_barang}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">{item.qty}</td>
                                                    <td className="px-4 py-4 rounded-r-md">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditIndex(i);
                                                                    setInitialModalData(item);
                                                                    setOpenModal(true);
                                                                }}
                                                                className="text-cyan-600 hover:text-cyan-700"
                                                                title="Edit"
                                                            >
                                                                <i className="bx bx-edit text-lg"></i>
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedItems(selectedItems.filter((_, index) => index !== i));
                                                                }}
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
                                {selectedItems.length < detailMR.length ? (
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
                                        Maksimal {detailMR.length} barang sesuai detail make request
                                    </p>
                                )}
                            </div>
                            
                            {/* Kode Field */}
                            <div className="mt-6">
                                <label htmlFor="kode" className="block text-sm font-medium text-gray-700 mb-2">
                                    Kode
                                </label>
                                <input
                                    type="text"
                                    id="kode"
                                    value={kodeValue}
                                    onChange={(e) => setKodeValue(e.target.value)}
                                    placeholder="Masukkan kode..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end mt-6 gap-3">
                            {item.can_be_deleted && (
                                <button
                                    onClick={cancelRequest}
                                    disabled={cancelLoading}
                                    className={`px-6 py-2 rounded-md font-medium text-white ${cancelLoading ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'}`}
                                >
                                    {cancelLoading ? 'Cancelling...' : 'Cancel Request'}
                                </button>
                            )}
                            <button
                                onClick={handleCreatePurchaseRequest}
                                disabled={submitting || selectedItems.length === 0}
                                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium"
                            >
                                {submitting ? 'Creating...' : 'Create Purchase Request'}
                            </button>
                        </div>
                    </Transition>
                </div>
            </Block>
            
            {/* Modal */}
            {openModal && (
                <ModalPurchaseRequest
                    open={openModal}
                    onClose={() => {
                        setOpenModal(false);
                        setEditIndex(null);
                    }}
                    onSave={data => {
                        if (editIndex !== null) {
                            setSelectedItems(selectedItems.map((item, idx) => idx === editIndex ? data : item));
                        } else {
                            setSelectedItems([...selectedItems, data]);
                        }
                        setOpenModal(false);
                        setEditIndex(null);
                    }}
                    initialData={initialModalData}
                    apiUrl={apiUrl}
                    existingItems={selectedItems}
                    maxItems={detailMR.length}
                />
            )}
        </Layout>
    );
}

export default CreatePurchaseRequest;
