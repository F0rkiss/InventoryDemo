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

function DetailMakeRequest() {
    const [item, setItem] = useState({});
    const details = item.details || []
    const navigate = useNavigate();
    const { id } = useParams();
    const { role } = useAuth()
    const [decryptedId, setDecryptedId] = useState('')
    const [loading, setLoading] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [message, setMessage] = useState('')
    
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
        let response;
        response = await api.get(`/approvalStepHistory-makeRequest/detail/${decryptedId}`);
        const data = response.data.data;
        setItem(data);
        } catch (error) {
        } finally {
        setLoading(false); 
        setTimeout(() => setContentVisible(true), 50)
        }
    };

    // Helper to get today's date in YYYY-MM-DD
    const getToday = () => {
        const d = new Date();
        return d.toISOString().slice(0, 10);
    }

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
            await api.post(`/approvalStepHistory-create/${itemId}`, {
                status: 'approved',
                note: note || '',
                tanggal: getToday(),
            });
            Swal.fire({
                title: 'Berhasil di Approve!',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
            setTimeout(() => navigate('/notifications'), 1200);
        } catch (error) {
            Swal.fire({
                title: 'Tidak berhasil di Approve!',
                icon: 'error',
                timer: 2000,
                showConfirmButton: false,
            });
        } finally {
            setActionLoading(false);
        }
    }

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
                title: 'Tidak berhasil di Reject!',
                icon: 'error',
                timer: 2000,
                showConfirmButton: false,
            });
        } finally {
            setActionLoading(false);
        }
    }

    return (
        <Layout title={'Detail Make Request'}>
        <Block>
            <Back goHome={() => navigate('/notifications')}/>
                <Transition contentVisible={contentVisible}>
                <div className='flex flex-col items-center lg:items-start lg:flex-row gap-6 px-4 justify-center'>
                    <div className="bg-white py-8 px-8 mt-6 rounded-lg border border-gray-300 max-w-2xl">
                    <div className="flex flex-col items-center text-center mb-6">
                        <p className="text-xl font-bold capitalize">{item.EmpName}</p>
                        <p className="text-gray-500 text-base">{item.user?.EmpCode}</p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex">
                        <div className="w-44 font-medium text-left">Type Request:</div>
                        <div className="flex-1 text-right">{item.type_request?.name || item.nameTypeRequest}</div>
                        </div>
                        <div className="flex">
                        <div className="w-44 font-medium text-left">Jenis:</div>
                        <div className="flex-1 text-right">{item.type_request?.jenis || item.jenisTypeRequest}</div>
                        </div>
                        {item.type_request?.description && (
                        <div className="flex items-start">
                            <div className="w-44 font-medium text-left pt-1">Description:</div>
                            <div className="flex-1 text-right whitespace-pre-line break-words">
                            {item.type_request?.description}
                            </div>
                        </div>
                        )}
                        <div className="flex">
                        <div className="w-44 font-medium text-left">Tanggal Dibuat:</div>
                        <div className="flex-1 text-right">{DateFormat(item.created_at)}</div>
                        </div>
                        <div className="flex">
                        <div className="w-44 font-medium text-left">Tanggal Dirubah:</div>
                        <div className="flex-1 text-right">{DateFormat(item.updated_at)}</div>
                        </div>
                    </div>
                    </div>
                    {details.length > 0 && (
                    <div className="bg-white py-8 px-8 mt-6 rounded-lg border border-gray-300 max-w-xl w-full">
                        <p className="font-bold text-lg mb-2 text-center">Detail Barang</p>
                        <table className="w-full text-center">
                        <thead>
                            <tr className='border-b'>
                            <th className=" px-3 py-1">No</th>
                            <th className=" px-3 py-1">Quantity</th>
                            <th className=" px-3 py-1">Note Barang</th>
                            </tr>
                        </thead>
                        <tbody>
                            {details.map((detail, index) => (
                            <tr key={detail.id}>
                                <td className=" px-3 py-1">{index + 1}</td>
                                <td className=" px-3 py-1">{detail.qty}</td>
                                <td className=" px-3 py-1">{detail.note_barang}</td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    )}
                </div>
                <div className="mt-6 px-4">
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
                </Transition>
        </Block>
        </Layout>
    );
}

export default DetailMakeRequest;
