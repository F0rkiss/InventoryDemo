import React, { useEffect, useState, useMemo } from 'react';
import { Block } from 'framework7-react';
import { useNavigate, useParams } from 'react-router-dom';

import api from '../../api/api';
import Layout from '../component/Layout';
import Back from '../component/Back';
import Transition from '../component/Transition';
import DateFormat from '../../helper/DateFormatHelper';
import { DecryptID } from '../../helper/EncryptHelper';
import { useAuth } from '../../auth/AuthContext';
import ImagePreviewModal from '../component/modal/ImagePreviewModal';
import Swal from 'sweetalert2';
import InfoRow from '../component/infoRow';

function DetailLPB() {
    // ==============================
    // State
    // ==============================
    const [item, setItem] = useState({});
    const [detailLPB, setDetailLPB] = useState([]);       // detail barang PR
    const [prDetailQty, setPrDetailQty] = useState([]); // qty dari API
    const [decryptedId, setDecryptedId] = useState('');
    const [loading, setLoading] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);

    const [selectedImageUrl, setSelectedImageUrl] = useState('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const { id } = useParams();
    const { role } = useAuth();
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_URL;

    // Extract MR data dari purchase request
    const infoPO = item?.purchase_order ?? {}
    const infoPR = item?.purchase_request ?? item?.purchase_order?.purchase_request ?? {}

    // ==============================
    // Effects
    // ==============================
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
        const { data } = await api.get(`/laporanPenerimaanBarang-detail/${decryptedId}`);

        setItem(data.data);
        setDetailLPB(data.data.details || []);   // barang detail
        setPrDetailQty(data.data.qty || []);    // qty barang
        } catch (error) {
        console.error('Error fetchLPB:', error);
        } finally {
        setLoading(false);
        setTimeout(() => setContentVisible(true), 50);
        }
    };

        const Avoid = async () => {
            try {
            const result = await Swal.fire({
                title: `Apakah Anda Yakin Ingin Menghapus Order Ini?`,
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
                const response = await api.delete(`/laporanPenerimaanBarang-delete/${decryptedId}`);
                
                // Cek jika respons mengandung pesan error walau status 200
                if (response?.data?.status === 'error' || response?.data?.message?.toLowerCase().includes('tidak ditemukan')) {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Menghapus',
                    text: response.data.message || 'Data tidak ditemukan'
                });
                } else {
                Swal.fire('Order Dihapus!', '', 'success');
                navigate('/lpb/list-lpb');
                }
            }
            } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Menghapus Order',
                text:'Ada Kesalahan Dalam Sistem'
            })
            }
        }

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

    const handleClosePreview = () => {
        setIsPreviewOpen(false);
        setSelectedImageUrl('');
        };

    const handleImageClick = (imageUrl) => {
        setSelectedImageUrl(imageUrl);
        setIsPreviewOpen(true);
        };

    // ==============================
    // Render
    // ==============================
    return (
            <Layout title="Detail Purchase Request">
            <Block>
                <div className="px-2 lg:px-4">
                <Transition contentVisible={contentVisible}>
                    <Back goHome={() => navigate('/lpb/list-lpb')} />
                    <div className="flex items-center justify-between my-4">
                        <p className='lg:text-3xl text-2xl font-semibold capitalize'>Detail Laporan Penerimaan Barang</p>
                    </div>
        
                    {/* MAIN INFO + PO INFO */}
                    <div className="flex flex-col lg:flex-row gap-4 mt-3">
                        {/* MAIN INFO */}
                        <div className="bg-white border rounded-md p-4 lg:p-6 flex-1 min-h-[200px]">
                            <p className="font-semibold text-gray-400 mb-2 text-lg lg:text-xl">Informasi Laporan Penerimaan Barang</p>
                            <p className="text-lg lg:text-xl font-bold capitalize">{item.kode}</p>
                            <p className="text-sm lg:text-lg mb-4">{DateFormat(item.tanggal, false)}</p>
                            <div className="space-y-2 lg:space-y-3">
                                <InfoRow label="Penerima" value={item.penerima} />
                                <InfoRow label="Note" value={item.note} />
                                <InfoRow label="Tanggal" value={DateFormat(item.tanggal)} />
                                <InfoRow
                                    label="Status Approval LPB"
                                    value={
                                        <p className={`flex py-1 px-2 lg:py-2 lg:px-3 items-center text-xs lg:text-sm text-center gap-1 rounded-md font-medium ${item.is_full_approval ? 'text-green-700 bg-green-100 border border-green-500' : 'text-amber-700 bg-amber-100 border border-amber-500'}`}>
                                            {item.is_full_approval ? 'Sudah Di Approve' : 'Belum Di Approve'}
                                        </p>
                                    }
                                />
                            </div>
                        </div>

                        {/* PO INFO */}
                        <div className="bg-white border rounded-md p-4 lg:p-6 flex-1 min-h-[200px]">
                            <p className="font-semibold text-gray-400 mb-2 text-lg lg:text-xl">Informasi Purchase Order</p>
                            <p className="text-lg font-bold">{infoPO.kode}</p>
                            <p className="text-sm text-gray-500 mb-4">{DateFormat(infoPO.tanggal, false)}</p>
                            <div className="space-y-2 lg:space-y-3">
                                <InfoRow label="Pembuat Permintaan" value={infoPO.user_id} />
                                <InfoRow label="Alamat" value={infoPO.alamat} />
                                <InfoRow label="Estimasi Tanggal Penyerahan" value={DateFormat(infoPO.tanggal_penyerahan)} />
                                <InfoRow label="Kode Suplier" value={infoPO.kode_suplier} />
                            </div>
                        </div>
                    </div>
        
                    {/* DETAIL LPB */}
                    <div className="bg-white border rounded-md p-4 lg:p-6 mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-lg lg:text-xl text-gray-400 font-semibold">Detail Penerimaan Barang</p>
                            <div className="text-sm text-gray-500">{detailLPB.length} barang</div>
                        </div>

                        {detailLPB.length === 0 ? (
                            <p className="text-gray-400 italic text-center py-4">Belum ada barang dipilih</p>
                        ) : (
                            <div className='overflow-x-auto'>
                                <table className="w-full text-sm text-left min-w-[600px]">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="px-3 py-2 rounded-l-md">No</th>
                                            <th className="px-3 py-1">Barang</th>
                                            <th className="px-3 py-1">Jumlah Diminta</th>
                                            <th className="px-3 py-1">Jumlah Barang Masuk</th>
                                            <th className="px-3 py-1 rounded-r-md">Jumlah Belum Datang</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detailLPB.map((pr, i) => (
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
        
                        {item.can_be_deleted && (
                            <div className='flex justify-end mt-5'>
                                <button onClick={() => Avoid()} className='bg-red-500 hover:bg-red-600 transition-colors duration-200 max-w-xs py-2 rounded-md text-white font-medium'>
                                    Delete Order
                                </button>
                            </div>
                        )}
                    </div>
                </Transition>
                </div>
            </Block>
            <ImagePreviewModal isOpen={isPreviewOpen} onClose={handleClosePreview} imageUrl={selectedImageUrl} />
            </Layout>
        );
    }
export default DetailLPB;
