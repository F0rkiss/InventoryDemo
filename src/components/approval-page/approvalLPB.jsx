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
import ApprovalActions from '../component/ApprovalActions';

function ApprovalLPB() {
    const [item, setItem] = useState({});
    const [detailLPB, setDetailLPB] = useState([]);
    const [prDetailQty, setPrDetailQty] = useState([]);
    const [decryptedId, setDecryptedId] = useState('');
    const [loading, setLoading] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedImageUrl, setSelectedImageUrl] = useState('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const { id } = useParams();
    const { role } = useAuth();
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_URL;

    const infoPO = item?.purchase_order ?? {};
    const infoPR = item?.purchase_request ?? item?.purchase_order?.purchase_request ?? {};

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
            const { data } = await api.get(`/laporanPenerimaanBarang-detail/${decryptedId}`);
            setItem(data.data);
            setDetailLPB(data.data.details || []);
            setPrDetailQty(data.data.qty || []);
        } catch (error) {
            console.error('Error fetchLPB:', error);
        } finally {
            setLoading(false);
            setTimeout(() => setContentVisible(true), 50);
        }
    };

    const handleApprove = async (itemId, note = '') => {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin ingin menyetujui?',
            text: 'Tindakan ini akan menyetujui request.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Setujui',
            cancelButtonText: 'Batal',
        });
        if (!result.isConfirmed) return;

        setActionLoading(true);
        setMessage('');
        try {
            await api.post(`/approvalHistoriesLPB-create/${itemId}`, {
                status: 'approved',
                note: note || '',
                tanggal: getToday(),
            });
            Swal.fire({ title: 'Berhasil di Approve!', icon: 'success', timer: 2000, showConfirmButton: false });
            setTimeout(() => navigate('/notifications'), 1200);
        } catch {
            Swal.fire({ title: 'Tidak berhasil di Approve!', icon: 'error', timer: 2000, showConfirmButton: false });
        } finally {
            setActionLoading(false);
        }
    };

    const handleDecline = async (itemId, note = '') => {
        setActionLoading(true);
        setMessage('');
        try {
            await api.post(`/approvalHistoriesLPB-create/${itemId}`, {
                status: 'reject',
                note: note || '',
                tanggal: getToday(),
            });
            Swal.fire({ title: 'Berhasil di Reject!', icon: 'success', timer: 2000, showConfirmButton: false });
            setTimeout(() => navigate('/notifications'), 1200);
        } catch {
            Swal.fire({ title: 'Tidak berhasil di Tolak!', icon: 'error', timer: 2000, showConfirmButton: false });
        } finally {
            setActionLoading(false);
        }
    };

    const qtyMap = useMemo(() => {
        const map = new Map();
        (prDetailQty || []).forEach(q => map.set(String(q.barang_id), q));
        return map;
    }, [prDetailQty]);

    const handleImageClick = (imageUrl) => {
        setSelectedImageUrl(imageUrl);
        setIsPreviewOpen(true);
    };

    const handleClosePreview = () => {
        setIsPreviewOpen(false);
        setSelectedImageUrl('');
    };

    const getToday = () => new Date().toISOString().split('T')[0];

    return (
        <Layout title="Detail Penerimaan Barang">
            <Block>
                <div className="px-4">
                    <Transition contentVisible={contentVisible}>
                        <div className="flex items-center justify-between mb-4">
                            <Back goHome={() => navigate('/notifications')} />
                        </div>

                        <div className="flex flex-col lg:flex-row gap-4 mt-3">
                            <div className="bg-white border rounded-md p-6 flex-1">
                                <p className="font-semibold text-gray-400 mb-2 text-xl">Purchase Request Information</p>
                                <p className="text-xl font-bold capitalize">{item.kode}</p>
                                <p className="text-lg mb-4">{DateFormat(item.tanggal, false)}</p>
                                <div className="space-y-3">
                                    <InfoRow label="Penerima" value={item.penerima} />
                                    <InfoRow label="Note" value={item.note} />
                                    <InfoRow label="Tanggal" value={item.tanggal} />
                                    <InfoRow label="Status Approval LPB"
                                        value={
                                            <p className={`py-1 px-4 text-xs font-medium rounded ${item.is_full_approval ? 'text-green-700 bg-green-200' : 'text-amber-600 bg-amber-100'}`}>
                                                {item.is_full_approval ? 'Sudah Di Approve' : 'Belum Di Approve'}
                                            </p>
                                        }
                                    />
                                </div>
                            </div>

                            <div className="bg-white border rounded-md p-6 flex-1">
                                <p className="font-semibold text-gray-400 mb-2 text-xl">Purchase Order Information</p>
                                <p className="text-lg font-bold">{infoPO.kode}</p>
                                <p className="text-sm text-gray-500 mb-4">{DateFormat(infoPO.tanggal, false)}</p>
                                <div className="space-y-3">
                                    <InfoRow label="Pembuat Permintaan" value={infoPO.user?.EmpName} />
                                    <InfoRow label="Keterangan" value={infoPO.keterangan} />
                                    <InfoRow label="Estimasi Tanggal Penyerahan" value={DateFormat(infoPO.tanggal_penyerahan)} />
                                    <InfoRow label="Kode Suplier" value={infoPO.suplier?.nama_perusahaan} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border rounded-md p-6 mt-6">
                            <div className="flex justify-between items-center mb-4 ">
                                <p className="text-xl text-gray-400 font-semibold">Detail Penerimaan Barang</p>
                                <div className="text-sm text-gray-500">{detailLPB.length} barang</div>
                            </div>
                            {detailLPB.length === 0 ? (
                                <p className="text-gray-400 italic text-center py-4">Belum ada barang dipilih</p>
                            ) : (
                                <div className='overflow-x-auto'>

                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="px-3 py-2">No</th>
                                            <th className="px-3 py-1">Barang</th>
                                            <th className="px-3 py-1">Jumlah Diminta</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detailLPB.map((pr, i) => (
                                            <tr key={pr.id ?? i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                                <td className="px-4 py-4">{i + 1}</td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {pr.barangs?.image && (
                                                            <img src={`${apiUrl}${pr.barangs.image}`} alt={pr.barangs.name}
                                                                className="max-w-[10rem] object-cover rounded shadow cursor-pointer"
                                                                onClick={() => handleImageClick(`${apiUrl}${pr.barangs.image}`)}
                                                            />
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-gray-900">{pr.barangs?.name}</p>
                                                            <p className="text-xs text-gray-500">{pr.barangs?.kode_barang}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">{pr.qty}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                </div>
                            )}
                        </div>

                        {/* BUKTI SECTION */}
                    <div className="bg-white border rounded-md p-4 lg:p-6 mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-lg lg:text-xl text-gray-400 font-semibold">Bukti Penerimaan</p>
                            <div className="text-sm text-gray-500">{(item?.bukti?.length || 0)} gambar</div>
                        </div>

                        {!item?.bukti || item.bukti.length === 0 ? (
                            <p className="text-gray-400 italic text-center py-4">Tidak ada bukti diunggah</p>
                        ) : (
                            <div className="rounded-md border border-dashed border-gray-300 p-3">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full">
                                    {item.bukti.map((b, i) => {
                                        let src = b
                                        if (typeof b === 'string') {
                                            if (b.startsWith('http')) src = b
                                            else if (b.startsWith('/')) src = `${apiUrl}${b}`
                                            else src = `${apiUrl}/${b}`
                                        }
                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                className="relative rounded border overflow-hidden aspect-[4/3]"
                                                onClick={() => handleImageClick(src)}
                                            >
                                                <img src={src} alt={`bukti-${i}`} className="w-full h-full object-cover" />
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                        <ApprovalActions
                            itemId={decryptedId}
                            onApprove={handleApprove}
                            onDecline={handleDecline}
                            approveText="Setujui Request"
                            declineText="Tolak Request"
                            showReasonInput
                            reasonRequired
                            className="max-w-2xl mx-auto mt-4"
                            disabled={actionLoading}
                        />
                    </Transition>
                </div>
            </Block>

            <ImagePreviewModal isOpen={isPreviewOpen} onClose={handleClosePreview} imageUrl={selectedImageUrl} />
        </Layout>
    );
}

export default ApprovalLPB;
