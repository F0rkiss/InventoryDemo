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

function ApprovalMR() {
    const [item, setItem] = useState({})
    const mainMR = item.makeRequest?.MR || {};
    const detailMR = item.makeRequest?.detailsMR || []
    const navigate = useNavigate();
    const { id } = useParams();
    const { role } = useAuth()
    const [decryptedId, setDecryptedId] = useState('')
    const [loading, setLoading] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [message, setMessage] = useState('')
    const apiUrl = import.meta.env.VITE_URL
    
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
            const url = role === 'admin' ?
            (`/inventMakeRequest-admin/detail/${decryptedId}`)
            : (`/inventMakeRequest-detail/${decryptedId}`)
            const response = await api.get(url);
            const data = response.data.data;
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
        
        return (
        <Layout title={'Detail Make Request'}>
            <Block>
            <div className="px-4">
                {/* Main Info & Detail */}
                <Transition contentVisible={contentVisible}>
                <div className="flex items-center justify-between mb-4">
                    <Back goHome={() => navigate('/notifications')} />
                    {/* {
                        role === 'admin' ? 
                        (
                        <p className='rounded-md bg-gray-300 p-2 text-gray-700'>{item.is_full_approval}</p>
                        ) : (
                        <p className={`${item.can_be_deleted ? 'text-amber-700 bg-amber-200 py-2 px-2' : 'text-green-700 bg-green-200 py-2 px-2'} rounded-md`}>{item.is_full_approval}</p>
                        )
                    } */}
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
                        <table className="w-full text-sm text-left">
                            <thead>
                            <tr className="bg-gray-100">
                                <th className="px-3 py-2 rounded-l-md">No</th>
                                <th className="px-3 py-1">Note Barang</th>
                                <th className="px-3 py-1 rounded-r-md">Quantity</th>
                            </tr>
                            </thead>
                            <tbody>
                            {detailMR.map((d, i) => (
                                <tr key={d.id} className={` ${(i + 1) % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
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
        </Layout>
    );
}  

export default ApprovalMR;
