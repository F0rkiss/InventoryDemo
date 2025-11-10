import React, { useEffect, useState, useMemo } from 'react';
import { Block } from 'framework7-react';
import { useNavigate, useParams } from 'react-router-dom';

import api from '../../api/api';
import Layout from '../component/Layout';
import Back from '../component/Back';
import Transition from '../component/Transition';
import DateFormat from '../../helper/DateFormatHelper';
import InfoRow from '../component/infoRow';
import { DecryptID } from '../../helper/EncryptHelper';
import { useAuth } from '../../auth/AuthContext';
import ImagePreviewModal from '../component/modal/ImagePreviewModal';
import Swal from 'sweetalert2';
import { isMobileSafari } from '../../helper/DeviceHelper';

function DetailPurchaseRequest() {
    const [item, setItem] = useState({});
    const [detailPR, setDetailPR] = useState([]);
    const [prDetailQty, setPrDetailQty] = useState([]);
    const [decryptedId, setDecryptedId] = useState('');
    const [loading, setLoading] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

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
        } catch (error) {
            console.error('Error fetchPurchaseRequest:', error);
        } finally {
            setLoading(false);
            setTimeout(() => setContentVisible(true), 50);
        }
    };

    const cancelOrder = async () => {
        try {
            const result = await Swal.fire({
                title: `Apakah Anda Yakin Ingin Menghapus Order Ini?`,
                icon: 'question',
                showDenyButton: true,
                confirmButtonText: 'Yes',
                denyButtonText: 'No',
            });
            if (result.isConfirmed) {
                const response = await api.delete(`/purchaseRequest-delete/${decryptedId}`);
                if (response?.data?.status === 'error' || response?.data?.message?.toLowerCase().includes('tidak ditemukan')) {
                    Swal.fire({ icon: 'error', title: 'Gagal Menghapus', text: response.data.message || 'Data tidak ditemukan' });
                } else {
                    Swal.fire('Order Dihapus!', '', 'success');
                    navigate('/purchase-request/list-purchase-request');
                }
            }
        } catch (error) {
            Swal.fire({ icon:'error', title:'Tidak Dapat Menghapus Order', text:'Ada Kesalahan Dalam Sistem' });
        }
    }

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

    const handleClosePreview = () => {
        setIsPreviewOpen(false);
        setSelectedImageUrl('');
    };

    const handleImageClick = (imageUrl) => {
        setSelectedImageUrl(imageUrl);
        setIsPreviewOpen(true);
    };

    const handlePreview = async () => {
        if (isPreviewLoading) return;
        setIsPreviewLoading(true);
        try {
            const response = await api.get(`/pdf/preview_pr/${decryptedId}`, {
                responseType: 'blob',
            });

            if (response.data.type === 'application/pdf') {
                const file = new Blob([response.data], { type: 'application/pdf' });
                const fileURL = URL.createObjectURL(file);
                
                // Logika untuk iOS Safari
                if (isMobileSafari()) {
                    // Untuk iOS Safari, buka di tab yang sama.
                    // Ini adalah satu-satunya cara yang andal untuk blob URL.
                    window.location.href = fileURL;
                    // Kita tidak bisa revoke URL di sini karena navigasi baru saja dimulai
                } else {
                    // Logika lama untuk browser lain (Chrome, Firefox, PC)
                    const newWindow = window.open(fileURL, '_blank');

                    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                        Swal.fire({
                            icon: 'info',
                            title: 'Preview Gagal Dibuka',
                            text: 'Browser Anda mungkin memblokir tab baru. Memulai unduhan PDF...',
                            timer: 2500,
                            showConfirmButton: false
                        });

                        const link = document.createElement('a');
                        link.href = fileURL;
                        const fileName = item.kode ? `${item.kode}.pdf` : 'preview-pr.pdf';
                        link.setAttribute('download', fileName);
                        document.body.appendChild(link);
                        link.click();
                        
                        document.body.removeChild(link);
                        URL.revokeObjectURL(fileURL);

                    } else {
                        setTimeout(() => {
                            URL.revokeObjectURL(fileURL);
                        }, 1000 * 60); 
                    }
                }

            } else {
                const errText = await response.data.text();
                let errJson = {};
                try {
                    errJson = JSON.parse(errText);
                } catch(e) {
                    errJson = { message: 'Format respons tidak valid.' }
                }
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Membuat Preview',
                    text: errJson.message || 'Format respons tidak valid.'
                });
            }
        } catch (error) {
            console.error("Error generating preview: ", error);
            Swal.fire({
                icon: 'error',
                title: 'Gagal Membuat Preview',
                text: error.message || 'Terjadi kesalahan pada server.'
            });
        } finally {
            setIsPreviewLoading(false);
        }
    };

    return (
        <Layout title="Detail Purchase Request">
            <Block>
                <div className="px-2 lg:px-4">
                    <Transition contentVisible={contentVisible}>
                        <Back goHome={() => navigate('/purchase-request/list-purchase-request')} />
                        <div className="flex items-center justify-between my-4">
                            <p className='lg:text-3xl text-2xl font-semibold capitalize'>Detail Purchase Request</p>
                        </div>

                        <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={handlePreview}
                            disabled={isPreviewLoading}
                            className="flex items-center gap-2 py-2 px-3 w-fit rounded-md border border-slate-300 font-medium text-sm bg-white text-gray-700 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                            title="Preview PDF"
                        >
                            <i className={`bx ${isPreviewLoading ? 'bx-loader-alt bx-spin' : 'bx-file'}`}></i>
                            <span className="sm:inline">
                                {isPreviewLoading ? 'Loading...' : 'Preview'}
                            </span>
                        </button>

                        <p className={`flex py-1 px-2 lg:py-2 lg:px-3 items-center text-xs lg:text-sm text-center gap-1 rounded-md font-medium ${!item.can_be_deleted ? 'text-green-700 bg-green-100 border border-green-500' : 'text-amber-700 bg-amber-100 border border-amber-500'}`}>
                            {!item.can_be_deleted ? 'Sudah Masuk Purchase Order' : 'Belum Masuk Purchase Order'}
                        </p>
                        </div>

                        {/* MAIN INFO + MR INFO */}
                        <div className="flex flex-col lg:flex-row gap-4 mt-3">
                            {/* MAIN INFO */}
                            <div className="bg-white border rounded-md p-4 lg:p-6 flex-1 min-h-[200px]">
                                <p className="font-semibold text-gray-400 mb-2 text-lg lg:text-xl">Purchase Request Information</p>
                                <p className="text-lg lg:text-xl font-bold capitalize">{item.kode}</p>
                                <p className="text-sm lg:text-lg mb-4">{DateFormat(item.tanggal, false)}</p>
                                <div className="space-y-2 lg:space-y-3">
                                    <InfoRow label="Employee Name" value={item.user?.EmpName} />
                                    <InfoRow label="Employee Code" value={item.user?.EmpCode} />
                                    <InfoRow label="Employee Email" value={item.user?.email} />
                                    <InfoRow label="Status Purchase Order" value={
                                        <p className={`flex py-1 px-2 lg:py-2 lg:px-3 items-center text-xs lg:text-sm text-center gap-1 rounded-md font-medium ${!item.can_be_deleted ? 'text-green-700 bg-green-100 border border-green-500' : 'text-amber-700 bg-amber-100 border border-amber-500'}`}>
                                            {!item.can_be_deleted ? 'Sudah Masuk Purchase Order' : 'Belum Masuk Purchase Order'}
                                        </p>
                                    }/>
                                </div>
                            </div>

                            {/* MR INFO */}
                            <div className="bg-white border rounded-md p-4 lg:p-6 flex-1 min-h-[200px]">
                                <div className='flex justify-between items-start'>
                                    <p className="font-semibold text-gray-400 mb-2 text-lg lg:text-xl">Material Request Information</p>
                                    <p className={`flex py-1 px-2 lg:py-2 lg:px-3 items-center text-xs lg:text-sm text-center gap-1 rounded-md font-medium ${item.make_request?.is_full_approval ? 'text-green-700 bg-green-100 border border-green-500' : 'text-amber-700 bg-amber-100 border border-amber-500'}`}>
                                        {item.make_request?.is_full_approval ? 'Approved':'Pending'}
                                    </p>
                                </div>
                                <p className="text-lg font-bold">{mainMR.kode}</p>
                                <p className="text-sm text-gray-500 mb-4">{DateFormat(mainMR.tanggal, false)}</p>
                                <div className="space-y-2 lg:space-y-3">
                                    <InfoRow label="Pembuat Permintaan" value={mainMR.user?.EmpName} />
                                    <InfoRow label="Email" value={mainMR.user?.email} />
                                    <InfoRow label="Type Request" value={mainMR.type_request?.name} />
                                    <InfoRow label="Jenis" value={mainMR.type_request?.jenis} />
                                    <InfoRow label="Deskripsi" value={mainMR.type_request?.description} />
                                </div>
                            </div>
                        </div>

                        {/* DETAIL PR */}
                        <div className="bg-white border rounded-md p-4 lg:p-6 mt-6">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-lg lg:text-xl text-gray-400 font-semibold">Detail Purchase Request</p>
                                <div className="text-sm text-gray-500">{detailPR.length} barang</div>
                            </div>
                            <InfoRow label="Tanggal" value={item.tanggal} />
                            <InfoRow label="Note" value={item.note} />
                            {detailPR.length === 0 ? (
                                <p className="text-gray-400 italic text-center py-4 pt-4">Belum ada barang dipilih</p>
                            ) : (
                                <div className='overflow-x-auto pt-4'>
                                    <table className="w-full text-sm text-left min-w-[600px]">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="px-3 py-2 rounded-l-md">No</th>
                                                <th className="px-3 py-1">Barang</th>
                                                <th className="px-3 py-1">Jumlah Diminta</th>
                                                <th className="px-3 py-1">Jumlah Sudah Dipesan</th>
                                                <th className="px-3 py-1 rounded-r-md">Jumlah Belum Dipesan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detailPR.map((pr, i) => (
                                                <tr key={pr.id ?? i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                                    <td className="px-4 py-4 rounded-l-md">{i + 1}</td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {pr.barangs?.image && (
                                                                <img 
                                                                    src={`${apiUrl}${pr.barangs.image}`}
                                                                    alt={pr.barangs.name}
                                                                    className="max-w-[6rem] lg:max-w-[10rem] object-cover rounded shadow cursor-pointer"
                                                                    onClick={() => handleImageClick(`${apiUrl}${pr.barangs.image}`)}
                                                                />
                                                            )}
                                                            <div className="break-words">
                                                                <p className="font-medium text-gray-900">{pr.barangs?.name}</p>
                                                                <p className="text-xs text-gray-500">{pr.barangs?.kode_barang}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">{getQty(pr, 'requested_qty')}</td>
                                                    <td className="px-4 py-4">{getQty(pr, 'used_qty')}</td>
                                                    <td className="px-4 py-4 rounded-r-md">{getQty(pr, 'sisa')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {item.can_be_deleted ? (
                                <>
                                    <div className='flex justify-end mt-5'>
                                    <button
                                        onClick={cancelOrder}
                                        className='delete-button transition-colors duration-200 max-w-xs py-2 rounded-md text-white font-medium'
                                    >
                                        Delete Order
                                    </button>
                                    </div>

                                    {/* <button
                                        className='px-3 py-1.5 update-button text-sm sm:text-base'
                                        onClick={() => goToPR(item.id)}
                                    >
                                        Update
                                    </button> */}
                                </>
                                ) : (
                                <></>
                            )}
                        </div>
                    </Transition>
                </div>
            </Block>
            <ImagePreviewModal isOpen={isPreviewOpen} onClose={handleClosePreview} imageUrl={selectedImageUrl} />
        </Layout>
    );
}

export default DetailPurchaseRequest;
