import React, { useState, useEffect, useRef } from 'react';
import DateFormat from '../../helper/DateFormatHelper';
import Loader from './Loader';
import api from '../../api/api';
import Swal from 'sweetalert2';
import ViewerAccessModal from './ViewerAccessModal';

import 'react-quill/dist/quill.snow.css';

const MemoDetailView = ({ data, loading, onClose, goToUpdate, canUpdate, canDelete, handleDelete, initial }) => {
    // ... code sebelumnya tidak berubah ...
    
    // STATE (Sama seperti sebelumnya)
    const [configMode, setConfigMode] = useState(null); 
    const [configView, setConfigView] = useState('list'); 
    const [configDataList, setConfigDataList] = useState([]); 
    const [selectedConfigItem, setSelectedConfigItem] = useState(null); 
    const [loadingConfig, setLoadingConfig] = useState(false);
    
    const [showPopover, setShowPopover] = useState(false);
    const popoverRef = useRef(null);

    // FETCH DATA (Sama seperti sebelumnya)
    const fetchConfigData = async (mode) => {
        if (!data?.id) return;
        setLoadingConfig(true);
        try {
            let endpoint = '';
            if (mode === 'viewer') {
                endpoint = `dynamicViewers/${data.id}`;
            } else {
                endpoint = `dynamicApprovalMemo/${data.id}`; // Endpoint GET
            }
            
            const response = await api.get(endpoint);
            const resultList = response.data?.data?.data || response.data?.data || [];
            setConfigDataList(resultList);
        } catch (error) {
            console.error(`Gagal ambil data ${mode}:`, error);
        } finally {
            setLoadingConfig(false);
        }
    };

    // ... Handler Open, Edit, Delete (Sama seperti sebelumnya) ...
    const handleOpenConfig = (mode) => {
        setConfigMode(mode);
        setConfigView('list');
        setShowPopover(false);
        fetchConfigData(mode);
    };

    const handleAdd = () => {
        setSelectedConfigItem(null);
        setConfigView('form');
    };

    const handleEdit = (item) => {
        setSelectedConfigItem(item);
        setConfigView('form');
    };

    const handleBackToList = () => {
        setConfigView('list');
        setSelectedConfigItem(null);
    };

    const handleDeleteItem = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus data ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            try {
                const endpoint = configMode === 'viewer' 
                    ? `dynamicViewers-delete/${id}` 
                    : `dynamicApprovalMemo-delete/${id}`; // Pastikan endpoint delete benar
                await api.delete(endpoint);
                Swal.fire('Terhapus', 'Data berhasil dihapus', 'success');
                fetchConfigData(configMode);
            } catch (error) {
                Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus', 'error');
            }
        }
    };

    // --- BAGIAN INI DIPERBAIKI (HANDLE SAVE) ---
    const handleSaveData = async (formData) => {
        try {
            // formData hanya berisi { user_id, note } dari ViewerAccessModal
            
            let url = '';
            let method = '';
            
            // Inject memo_id otomatis disini
            let payload = { 
                ...formData, 
                memo_id: data.id 
            };

            if (configMode === 'viewer') {
                // ... logic viewer ...
                if (selectedConfigItem) {
                    url = `dynamicViewers-update/${selectedConfigItem.id}`;
                    method = 'put';
                } else {
                    url = `dynamicViewers-create/${data.id}`;
                    method = 'post';
                }
            } else {
                // Data yang dikirim: { user_id, note, memo_id }
                if (selectedConfigItem) {
                    url = `dynamicApprovalMemo-update/${selectedConfigItem.id}`;
                    method = 'put';
                } else {
                    url = `dynamicApprovalMemo-create/${data.id}`; // Sesuaikan jika endpoint butuh ID di URL atau tidak
                    method = 'post';
                }
            }

            // Eksekusi API
            await api[method](url, payload); 
            
            Swal.fire('Berhasil', 'Data berhasil disimpan', 'success');
            fetchConfigData(configMode); // Refresh list
            handleBackToList(); // Kembali ke list

        } catch (error) {
            console.error(error);
            Swal.fire('Gagal', error.response?.data?.message || 'Gagal menyimpan', 'error');
        }
    };

    // ... useEffect Close Popover & Render UI (Sama seperti sebelumnya) ...
    useEffect(() => {
        function handleClickOutside(event) {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setShowPopover(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [popoverRef]);

    if (loading) return <div className="p-8 flex justify-center"><Loader /></div>;
    if (!data) return null;

    return (
        <div className="bg-white rounded-2xl border xs:p-6 md:p-8 h-full shadow-sm flex flex-col relative animate-fade-in">
             {/* Header Mobile, Judul, Deskripsi ... (Sama) */}
             <div className="flex items-center justify-between lg:hidden">
                <button onClick={onClose} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-4 w-fit">
                    <i className='bx bx-arrow-back text-2xl'></i>
                </button>
                 <p className="text-gray-500 flex items-center self-center gap-2 xs:text-xs md:text-sm">{DateFormat(data.tanggal)}</p>
            </div>
            
            <p className="text-xl font-bold text-gray-900 ">{data.name}</p>
            <div className="flex items-center gap-2 mt-2 mb-2 pb-3 border-b">
                <span className={`
                        px-3 py-1 rounded-full text-[12px] font-semibold border
                        ${data.is_full_approval 
                            ? 'bg-green-50 text-green-600 border-green-200' 
                            : 'bg-amber-50 text-amber-600 border-amber-200'}
                    `}>
                        {data.is_full_approval ? 'Sudah diapprove' : 'Proses Approval'}
                    </span>
                    
                    {/* Badge Tipe */}
                    <span className={`px-3 py-1 rounded-full text-[12px] font-semibold ${data.jenis_memo?.is_dynamic ? "bg-purple-50 text-purple-600 border border-purple-200" : "bg-cyan-50 text-cyan-700 border border-cyan-200"} `}>
                        {data.jenis_memo?.is_dynamic ? "Dinamis" : "Statis"}
                    </span>

                    <span className={`px-3 py-1 rounded-full text-[12px] font-semibold ${data.is_public ? "bg-teal-50 text-teal-600 border border-teal-200" : "bg-red-50 text-red-700 border border-red-200"} `}>
                        {data.is_public ? "Public" : "Private"}
                    </span>
            </div>
            <div className="text-gray-600 leading-relaxed text-base space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar relative ql-snow">
                 <div 
                    className="prose max-w-none rich-text-content ql-editor" 
                    dangerouslySetInnerHTML={{ __html: data.description }} 
                 />
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">

                {initial === 'admin' && (
                    <div className="flex self-start items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                            <i className='bx bxs-user'></i>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-medium">{data.user?.EmpName || "User"}</span>
                            <span className="text-xs text-gray-500 font-regular">{data.user?.email || "User"}</span>
                        </div>
                    </div>
                )}
                
                {   initial !== 'admin' &&
                    initial !== 'information' &&
                    !(data.is_public && !data.jenis_memo?.is_dynamic) && (
                    <div className="relative w-full md:w-auto" ref={popoverRef}>
                        <button 
                            onClick={() => setShowPopover(!showPopover)}
                            className="flex items-center justify-between gap-3 px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm text-gray-600 text-sm font-medium w-full md:w-auto"
                        >
                            {showPopover ? <i className='bx bx-chevron-down text-[20px]'></i> : <i className='bx bx-chevron-up text-[20px]'></i>}
                            <span>Konfigurasi</span>
                            <i className='bx bxs-cog text-lg text-gray-400'></i>
                        </button>

                        {showPopover && (
                            <div className="absolute bottom-full left-0 mb-2 w-full md:w-[280px] bg-white border border-gray-200 rounded-xl shadow-xl z-20 animate-fade-in p-1 overflow-hidden">
                                <div className="flex flex-col">
                                    
                                    {/* OPSI 1: Muncul jika Private (is_public = false) */}
                                    { !data.is_public && (
                                        <button
                                            onClick={() => handleOpenConfig('viewer')} 
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors border-b border-gray-50 last:border-0"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                <i className='bx bxs-show text-lg'></i>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">Dapat dilihat oleh siapa saja</span>
                                        </button>
                                    )}
                                    
                                    {/* OPSI 2: Muncul jika Dynamic (is_dynamic = true) */}
                                    { data.jenis_memo?.is_dynamic && (
                                        <button
                                            onClick={() => handleOpenConfig('approver')}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors border-b border-gray-50 last:border-0"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                                <i className='bx bxs-user-check text-lg'></i>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">Pengaturan Approval</span>
                                        </button>
                                    )}

                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-3 w-full md:w-auto">
                   {(canUpdate && data.canBeUpdated) && (
                        <button onClick={() => goToUpdate(data.id)} className="px-5 py-2 rounded-lg update-button flex items-center text-center gap-2 text-sm">
                            <i className='bx bx-edit'></i> Update
                        </button>
                    )} 
                   {(canDelete) && (
                        <button onClick={() => handleDelete(data.id)} className="px-5 py-2 rounded-lg delete-button flex items-center gap-2 text-sm">
                            <i className='bx bx-trash'></i> Delete
                        </button>
                    )} 
                </div>
            </div>

            {/* Modal */}
            <ViewerAccessModal
                show={!!configMode}
                mode={configMode} 
                view={configView} 
                dataList={configDataList}
                loading={loadingConfig}
                onClose={() => setConfigMode(null)}
                
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDeleteItem}
                onBack={handleBackToList}
                onSave={handleSaveData}
                
                selectedItem={selectedConfigItem}
            />
        </div>
    );
};

export default MemoDetailView;