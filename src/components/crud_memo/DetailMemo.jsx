import React, { useEffect, useState } from 'react';
import Back from '../component/Back'; // Pastikan path komponen ini benar
import { Block } from 'framework7-react';
import api from '../../api/api';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../component/Layout';
import { DecryptID, encrypting } from '../../helper/EncryptHelper';
import Transition from '../component/Transition';
import DateFormat from '../../helper/DateFormatHelper';
import { useAuth } from '../../auth/AuthContext';
import useMenuAccess from '../../hooks/useMenuAccess';
import Swal from 'sweetalert2';
import Loader from '../component/Loader'; // Pastikan ada Loader component

function MemoDetailPage() {
    const [item, setItem] = useState({});
    const [loading, setLoading] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);
    
    // Extract data spesifik (sesuaikan key API lu kalau beda)
    const user = item.user || {};
    const jenisMemo = item.jenis_memo || {};
    const approvalSteps = item.approval_histories || []; // Asumsi key history

    const navigate = useNavigate();
    const { id } = useParams(); // Ini ID terenkripsi dari URL
    const { role } = useAuth();
    const [decryptedId, setDecryptedId] = useState('');
    
    // Cek akses menu (opsional, sesuaikan nama menunya)
    const { canUpdate } = useMenuAccess('MemoPersonal'); 

    // 1. Decrypt ID saat mount
    useEffect(() => {
        const decoded = DecryptID(id);
        setDecryptedId(decoded);
        if (!decoded) {
            // Kalau gagal decrypt, tendang balik
            navigate(-1);
        }
    }, [id]);

    // 2. Fetch Data setelah ID ready
    useEffect(() => {
        if (decryptedId) {
            fetchItems();
        }
    }, [decryptedId]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const url = `memo-detail/personal/${decryptedId}`; // Endpoint API detail
            const response = await api.get(url);
            const data = response.data.data;
            setItem(data);
        } catch (error) {
            console.error("Error fetching memo:", error);
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: 'Data memo tidak ditemukan atau terjadi kesalahan.'
            });
        } finally {
            setLoading(false);
            setTimeout(() => setContentVisible(true), 50);
        }
    };

    const handleGoToUpdate = async () => {
        const encryptId = await encrypting(item.id);
        navigate(`/memo/update-memo/${encryptId}`);
    };

    if (loading && !contentVisible) {
        return (
            <Layout title={'Detail Memo'}>
                <div className='h-screen flex items-center justify-center'>
                    <Loader />
                </div>
            </Layout>
        )
    }

    return (
        <Layout title={'Detail Memo'}>
            <Block>
                <div className="xs:px-0 md:px-4">
                    <Transition contentVisible={contentVisible}>
                        {/* Tombol Back */}
                        <Back goHome={() => navigate('/memo/list-memo-personal')} /> 

                        {/* Header Section: Title & Badges */}
                        <div className="my-4">
                            <p className='lg:text-3xl text-2xl font-semibold capitalize'>Detail Memo Personal</p>
                            
                            <div className="flex items-center justify-between sm:gap-3 pt-4">
                                {/* Tombol Action (Update) */}
                                { (canUpdate && item.canBeUpdated) ? (
                                    <button
                                        type="button"
                                        onClick={handleGoToUpdate}
                                        className="flex items-center gap-2 py-2 px-3 w-fit rounded-md border border-blue-300 font-medium text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors duration-200"
                                    >
                                        <i className='bx bx-edit'></i>
                                        <span>Update Memo</span>
                                    </button>
                                ) : (
                                    <div></div> // Spacer kosong biar justify-between rapi
                                )}

                                {/* Status Approval Badge */}
                                <p className={`
                                    ${item.is_full_approval 
                                        ? 'text-green-700 bg-green-100 border border-green-500' 
                                        : 'text-amber-700 bg-amber-100 border border-amber-500'} 
                                    py-2 px-3 rounded-md font-medium text-sm
                                `}>
                                    {item.approval_message || (item.is_full_approval ? 'Approved' : 'Process')}
                                </p>
                            </div>
                        </div>

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
                            <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                                <p className="font-semibold text-gray-400 mb-4 text-xl">Memo Content</p>
                                
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-sm text-gray-500 font-semibold block mb-1">Deskripsi / Isi</span>
                                        <div className="bg-gray-50 p-4 rounded-md border text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                                            {item.description || "Tidak ada deskripsi."}
                                        </div>
                                    </div>

                                    {item.notes && (
                                        <div>
                                            <span className="text-sm text-gray-500 font-semibold block mb-1">Catatan Tambahan</span>
                                            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100 text-gray-700 text-sm">
                                                {item.notes}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Transition>
                </div>
            </Block>
        </Layout>
    );
}

export default MemoDetailPage;