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
import MemoDetailView from '../component/DetailMemoView';
import MemoDetailPage from '../crud_memo/DetailMemo';

function ApprovalMemoDinamis() {
    const [item, setItem] = useState({});
    const [detailData, setDetailData] = useState(null);
    const [prDetailQty, setPrDetailQty] = useState([]);
    const [decryptedId, setDecryptedId] = useState('');
    const [loading, setLoading] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [loadingDetail, setLoadingDetail] = useState(false);
    

    const user = item.user || {};
    const jenisMemo = item.jenis_memo || {};
    const approvalSteps = item.approval_histories || []; // Asumsi key history

    const { id } = useParams();
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
            setLoadingDetail(true);
            const { data } = await api.get(`/memo-detail/${decryptedId}`);
            setItem(data.data);
            setDetailData(data.data);
            setPrDetailQty(data.data.qty || []);
        } catch (error) {
            console.error('Error fetchPurchaseRequest:', error);
        } finally {
            setLoading(false);
            setLoadingDetail(false);
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
            await api.post(`/approvalMemoDynamic-create/${itemId}`, {
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
            await api.post(`/approvalMemoDynamic-create/${itemId}`, {
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

    const handleBackToDesktop = () => {
        // Back functionality - if needed, navigate back
        navigate('/notifications');
    }

    const getToday = () => new Date().toISOString().split('T')[0];

    return (
        <Layout title="Approval Memo ">
            <Block>
                <div className="px-4">
                    <Transition contentVisible={contentVisible}>
                    <Back goHome={() => navigate('/notifications')} />
                        {/* --- Main Content Split (Kiri: Info, Kanan: Isi Memo) --- */}
                        <div className="flex flex-col lg:flex-row gap-4 mt-3">
                            
                            {/* KIRI: Main Information */}
                            <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                                <div className="overflow-x-clip">
                                    <p className="font-semibold text-gray-400 mb-2 text-xl">Main Information</p>
                                    <p className="lg:text-xl text-lg font-bold capitalize">{item.name || '-'}</p>
                                    <p className="text-md mb-4">{DateFormat(item.tanggal, false)}</p>
                                </div>
                                
                                <div className="space-y-3 pt-3 border-t">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Employee Name</span>
                                        <span className='font-medium'>{user.EmpName || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Employee Code</span>
                                        <span className='font-medium'>{user.EmpCode || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Employee Email</span>
                                        <span className='font-medium'>{user.email || '-'}</span>
                                    </div>
                                    <div className='space-y-2 pt-3 border-t mt-3'>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Jenis Memo</span>
                                            <span className={`font-medium text-right px-2 py-0.5 rounded text-xs ${jenisMemo?.is_dynamic ? "bg-purple-100 text-purple-700" : "bg-cyan-100 text-cyan-700"}`}>
                                                {jenisMemo?.is_dynamic ? "Dinamis" : "Statis"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Dibuat pada</span>
                                            <span className="text-right font-medium text-sm">{DateFormat(item.created_at, true)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* KANAN: Memo Content (Description & Notes) */}
                            <div className="w-full lg:w-7/12 sticky top-24 h-[calc(100vh-150px)] overflow-y-auto animate-fade-in">
                            <MemoDetailView 
                                data={detailData} 
                                loading={loadingDetail}
                                onClose={handleBackToDesktop}
                                initial="approval"
                                isOwner={false}
                                showViewerManagement={false}
                            />
                        </div>
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

export default ApprovalMemoDinamis;
