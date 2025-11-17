import React, { useEffect, useState } from 'react';
import Back from '../component/Back'
import { Page, Block } from 'framework7-react';
import api from '../../api/api';
import { replace, useNavigate, useParams } from 'react-router-dom';
import Layout from '../component/Layout';
import { DecryptID, encrypting } from '../../helper/EncryptHelper';
import Transition from '../component/Transition';
import DateFormat from '../../helper/DateFormatHelper'
import { useAuth } from '../../auth/AuthContext';
import ApprovalActions from '../component/ApprovalActions';
import Swal from 'sweetalert2';
import ImagePreviewModal from '../component/modal/ImagePreviewModal';
import ModalPurchaseRequest from '../component/modal/ModalPurchaseRequest';

function ApprovalMR() {
    const [item, setItem] = useState({})
    const mainMR = item.makeRequest?.MR || {};
    const detailMR = item.makeRequest?.detailsMR || []
    const navigate = useNavigate();
    const { id } = useParams();
    const { role } = useAuth()
    const [decryptedId, setDecryptedId] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const apiUrl = import.meta.env.VITE_URL
    
    const [contentVisible, setContentVisible] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    const [selectedItems, setSelectedItems] = useState([]);
    
    // Image preview states
    const [openModal, setOpenModal] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');
    const [editIndex, setEditIndex] = useState(null);

    const [initialModalData, setInitialModalData] = useState({
        selectedBarang: null
    });
    
    // Helper function to get today's date in YYYY-MM-DD format
    const getToday = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    useEffect(() => {
        const decryptedId = DecryptID(id)
        setDecryptedId(decryptedId)
        if (!decryptedId) {
            navigate(-1)
        }
        }, [id]);
        
        useEffect(() => {
        if (decryptedId) {
            fetchItems()
        }
        }, [decryptedId])

        const fetchItems = async () => {
        try {
            setLoading(true);
            const url = (`/inventMakeRequest-approval/detail/${decryptedId}`)
            const response = await api.get(url);
            const data = response.data.data;
            // console.log(item.isAdminApproved)
            setItem(data);
        } catch (error) {
            
        } finally {
            setLoading(false); 
            setTimeout(() => setContentVisible(true), 50)
        }
        };

        const handleApprove = async (itemId, note = '') => {
            const result = await Swal.fire({
                title: 'Apakah Anda yakin ingin menyetujui?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Ya, Setujui',
                cancelButtonText: 'Batal',
                });
            
                if (!result.isConfirmed) return;
            
                setActionLoading(true);
                setMessage('');
            
                try {
                let payload = {
                    note: note || 'Approved',
                    status: 'approved',
                    tanggal: getToday(),
                };
            
                // 🔹 hanya tambahkan barangIds kalau admin approved
                if (item?.isAdminApproved === 1) {
                    payload.barang_ids = selectedItems.map((i) => i.selectedBarang?.id).filter(Boolean);
                }
            
                console.log('Payload dikirim:', payload);
            
                await api.post(`/approvalStepHistory-create/${itemId}`, payload);
            
                Swal.fire({
                    title: 'Berhasil di Approve!',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            
                setTimeout(() => navigate('/notifications'), 1200);
                } catch (error) {
                console.error('Approve error:', error);
                Swal.fire({
                    title: 'Tidak berhasil di Approve!',
                    icon: 'error',
                    timer: 2000,
                    showConfirmButton: false,
                });
                } finally {
                setActionLoading(false);
                }
            };

        // Handle decline action
        const handleDecline = async (itemId, note = '') => {
            setActionLoading(true);
            setMessage('');
            try {
                await api.post(`/approvalStepHistory-create/${itemId}`, {
                    status: 'reject',
                    note: note || '',
                    tanggal: getToday(),
                });
                Swal.fire({
                    title: 'Berhasil di Reject!',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
                setTimeout(() => navigate('/notifications'), 1200);
            } catch (error) {
                Swal.fire({
                    title: 'Tidak berhasil di Tolak!',
                    icon: 'error',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } finally {
                setActionLoading(false);
            }
        }
    
        const cancelRequest = async () => {
        try {
            const result = await Swal.fire({
            title: `Apakah Anda Yakin Ingin Membatalkan Request Ini?`,
            icon: 'question',
            showDenyButton: true,
            confirmButtonText: 'Yes',
            denyButtonText: 'No',
            customClass: {
                actions: 'my-actions',
                confirmButton: 'order-2',
                denyButton: 'order-3',
            },
            });
            if (result.isConfirmed) {
            // console.log('Request cancelled:', id);
            const response = await api.delete(`/inventMakeRequest-delete/${decryptedId}`);
            
            // Cek jika respons mengandung pesan error walau status 200
            if (response?.data?.status === 'error' || response?.data?.message?.toLowerCase().includes('tidak ditemukan')) {
                Swal.fire({
                icon: 'error',
                title: 'Gagal Membatalkan',
                text: response.data.message || 'Data tidak ditemukan'
                });
            } else {
                Swal.fire('Request Dibatalkan!', '', 'success');
                navigate('/make-request/list-make-request');
            }
            }
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Membatalkan Request',
                text:'Ada Kesalahan Dalam Sistem'
            })
            console.error('Error cancelling request:', error);
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
        <Layout title={'Detail Make Request'}>
            <Block>
            <div className="px-4">
                {/* Main Info & Detail */}
                <Transition contentVisible={contentVisible}>
                <div className="flex items-center justify-between mb-4">
                    <Back goHome={() => navigate('/notifications')} />
                </div>
                <div className="flex items-center justify-between my-4">
                            <p className='lg:text-3xl text-2xl font-semibold capitalize'>{item.isAdminApproved ? 'Admin Approval' : 'User Approval' }</p>
                        </div>
                    <>
                    <div className="flex flex-col lg:flex-row gap-4 mt-3">
                    <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                        <p className="font-semibold text-gray-400 mb-2 text-xl">Main Information</p>
                        <p className="text-xl font-bold capitalize">{mainMR.kode}</p>
                        <p className="text-lg mb-4">{DateFormat(mainMR.tanggal, false)}</p>
                        <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Employee Name</span>
                            <span className='font-medium'>{mainMR.EmpName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Employee Code</span>
                            <span className='font-medium'>{mainMR.EmpCode}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Employee Email</span>
                            <span className='font-medium'>{mainMR.email}</span>
                        </div>
                        <div className='space-y-2 pt-3 border-t'>
                            <div className="flex justify-between ">
                            <span className="text-gray-500">Type Request</span>
                            <span className='font-medium'>{mainMR.type_name}</span>
                            </div>
                            <div className="flex justify-between">
                            <span className="text-gray-500">Jenis</span>
                            <span className='font-medium'>{mainMR.type_jenis}</span>
                            </div>
                            <div className="flex justify-between">
                            <span className="text-gray-500">Tanggal dibuat</span>
                            <span className="text-right font-medium">{DateFormat(mainMR.created_at, true)}</span>
                            </div>
                            <div className="flex justify-between">
                            <span className="text-gray-500">Tanggal diubah</span>
                            <span className="text-right font-medium">{DateFormat(mainMR.updated_at, true)}</span>
                            </div>
                        </div>
                        </div>
                    </div>
    
                    <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                        <p className="font-semibold text-gray-400 mb-4 text-xl">Detail</p>
                        { detailMR.length === 0 ? (
                        <p className="text-gray-400 italic">No detail data</p>
                        ) : (
                        <div className={"overflow-x-auto"}>
                            <table className="w-full text-sm text-left">
                                <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-3 py-2 rounded-l-md ">No</th>
                                    <th className="px-3 py-1">{item.isAdminApproved || item.is_stok ? 'Barang' : 'Note Barang'}</th>
                                    <th className="px-3 py-1 rounded-r-md">Quantity</th>
                                </tr>
                                </thead>
                                <tbody>
                                {detailMR.map((d, i) => (
                                    <tr key={d.id} className={` ${(i + 1) % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                    <td className="px-4 py-4 rounded-l-md">{i + 1}</td>
                                    {item.makeRequest.MR.is_stok === "ya" || item.makeRequest.MR.is_stok === "other" ? 
                                        
                                        <div className="flex items-center gap-3 px-4 py-4 rounded-l-md">
                                            {d?.image && (
                                                <img
                                                src={`${apiUrl}${d?.image}`}
                                                // alt={name}
                                                className="max-w-[10rem] object-cover rounded shadow cursor-pointer"
                                                onClick={() =>
                                                    handleImageClick(`${apiUrl}${d?.image}`)
                                                }
                                                />
                                                )}
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {d?.nameBarang}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Kode: {d?.kodeBarang}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Gudang: {d?.kodeGudang}
                                                </p>
                                            </div>
                                        </div>
                                        : 
                                    <>
                                        <td className="px-4 py-4">{d?.note_barang || d?.nameBarang || '-'}</td>
                                    </>
                                        
                                    }
                                    <td className="px-4 py-4 rounded-r-md">{d.qty}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        )}

                    </div>
                    </div>
                    {item.isAdminApproved ? (
                        // === Barang Selection ===
                        <div className="bg-white border rounded-md p-6 mt-6">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-xl text-gray-400 font-semibold">Pilih Barang</p>
                                <div className="text-sm text-gray-500">
                                    {selectedItems.length} dari {item.makeRequest?.detailsMR?.length || 0} barang dipilih
                                    {selectedItems.length === (item.makeRequest?.detailsMR?.length || 0) && (
                                        <span className="ml-2 text-green-600 font-medium">✓ Lengkap</span>
                                    )}
                                </div>
                            </div>

                            {/* Selected Items Table */}
                            <div className="mb-4">
                                {selectedItems.length === 0 ? (
                                    <p className="text-gray-400 italic text-center py-4">
                                        Belum ada barang dipilih
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="px-3 py-2 rounded-l-md">No</th>
                                                    <th className="px-3 py-1">Barang</th>
                                                    <th className="px-3 py-1 rounded-r-md">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedItems.map((sItem, i) => (
                                                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                                        <td className="px-4 py-4 rounded-l-md">{i + 1}</td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center gap-3">
                                                                {sItem.selectedBarang?.image && (
                                                                    <img
                                                                        src={`${apiUrl}${sItem.selectedBarang.image}`}
                                                                        alt={sItem.selectedBarang.name}
                                                                        className="max-w-[10rem] object-cover rounded shadow cursor-pointer"
                                                                        onClick={() =>
                                                                            handleImageClick(`${apiUrl}${sItem.selectedBarang.image}`)
                                                                        }
                                                                    />
                                                                )}
                                                                <div>
                                                                    <p className="font-medium text-gray-900">
                                                                        {sItem.selectedBarang?.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        Kode: {sItem.selectedBarang?.kode_barang}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        Gudang: {sItem.selectedBarang?.kode_gudang}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 rounded-r-md">
                                                            <div className="flex gap-2">
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
                                                                <button
                                                                    onClick={() =>
                                                                        setSelectedItems(selectedItems.filter((_, idx) => idx !== i))
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
                                    </div>
                                )}
                            </div>

                            {/* Add Item Button */}
                            <div className="flex mt-5">
                                {selectedItems.length < (item.makeRequest?.detailsMR?.length || 0) ? (
                                    <button
                                        type="button"
                                        className="w-full rounded-lg py-2 px-4 flex items-center justify-center font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200"
                                        onClick={() => {
                                            setOpenModal(true);
                                            setEditIndex(null);
                                            setInitialModalData({ selectedBarang: null, qty: '' });
                                        }}
                                    >
                                        <i className="bx bx-plus mr-2 font-semibold text-base"></i>
                                        <span>{selectedItems.length === 0 ? 'Tambah detail' : 'Tambah detail lain'}</span>
                                    </button>
                                ) : (
                                    <p className="text-sm text-gray-500 italic w-full text-center">
                                        Maksimal {item.makeRequest?.detailsMR?.length || 0} barang sesuai detail make request
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : null}
                    <div className="mt-4 px-4">
                    <ApprovalActions
                        itemId={decryptedId}
                        onApprove={handleApprove}
                        onDecline={handleDecline}
                        approveText="Setujui Request"
                        declineText="Tolak Request"
                        showReasonInput={true}
                        reasonRequired={true}
                        className="max-w-2xl mx-auto"
                        disabled={actionLoading}
                    />
                </div>
                    </>
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
                    makeRequestDetails={item.details || []}
                />
            )}
        </Layout>
    );
}  

export default ApprovalMR;
