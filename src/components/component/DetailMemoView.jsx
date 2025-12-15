import React, { useState, useEffect, useRef } from 'react';
import DateFormat from '../../helper/DateFormatHelper';
import Loader from './Loader';
import api from '../../api/api';
import Swal from 'sweetalert2';
import SelectPaginate from '../component/SelectPaginate'; // Pastikan path ini benar
import { DecryptID } from '../../helper/EncryptHelper'; // Jika ID di URL terenkripsi

const MemoDetailView = ({ data, loading, onClose, goToUpdate, canUpdate, canDelete, handleDelete, initial, showViewerManagement = true }) => {
    const user = data?.user;
    const jenisMemo = data?.jenis_memo;

    const [showViewers, setShowViewers] = useState(false);
    const [viewers, setViewers] = useState([]);
    const [loadingViewers, setLoadingViewers] = useState(false);
    
    // State untuk Modal Add/Edit Viewer
    const [showViewerModal, setShowViewerModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); // Untuk SelectPaginate
    const [editingViewerId, setEditingViewerId] = useState(null); // Jika null berarti Create, jika ada ID berarti Update
    const [submittingViewer, setSubmittingViewer] = useState(false);

    const popoverRef = useRef(null);

    // --- FETCH VIEWERS ---
    const fetchViewers = async () => {
        if (!data?.id) return;
        setLoadingViewers(true);
        try {
            // Endpoint: dynamicViewers/{id}
            const response = await api.get(`dynamicViewers/${data.id}`);
            console.log("Fetched viewers:", response.data.data);
            setViewers(response.data.data.data || []);
        } catch (error) {
            console.error("Gagal ambil viewers:", error);
        } finally {
            setLoadingViewers(false);
        }
    };

    // Trigger fetch saat tombol "Dapat dilihat oleh" diklik
    const toggleViewers = () => {
        if (!showViewers) {
            fetchViewers();
        }
        setShowViewers(!showViewers);
    };

    // --- HANDLER CREATE / UPDATE VIEWER ---
    const handleSaveViewer = async (e) => {
        e.preventDefault();
        if (!selectedUser) {
            Swal.fire('Error', 'Silakan pilih user terlebih dahulu', 'warning');
            return;
        }

        setSubmittingViewer(true);
        try {
            if (editingViewerId) {
                // UPDATE: dynamicViewers-update
                // Asumsi payload: { user_id: ... } ke endpoint update/{id_viewer}
                await api.put(`dynamicViewers-update/${editingViewerId}`, {
                    user_id: selectedUser.value,
                    // memo_id: data.id 
                });
                Swal.fire('Berhasil', 'Viewer berhasil diupdate', 'success');
            } else {
                // CREATE: dynamicViewer-create
                await api.post(`dynamicViewers-create/${data.id}`, {
                    // memo_id: data.id,
                    user_id: selectedUser.value
                });
                Swal.fire('Berhasil', 'Viewer berhasil ditambahkan', 'success');
            }

            // Reset & Refresh
            setShowViewerModal(false);
            setSelectedUser(null);
            setEditingViewerId(null);
            fetchViewers(); // Refresh list

        } catch (error) {
            console.error(error);
            Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan', 'error');
        } finally {
            setSubmittingViewer(false);
        }
    };

    // --- HANDLER DELETE VIEWER ---
    const handleDeleteViewer = async (viewerId) => {
        const result = await Swal.fire({
            title: 'Hapus akses user ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            try {
                // DELETE: dynamicViewers-delete
                await api.delete(`dynamicViewers-delete/${viewerId}`);
                Swal.fire('Terhapus', 'Akses user dicabut', 'success');
                fetchViewers();
            } catch (error) {
                Swal.fire('Gagal', 'Tidak dapat menghapus viewer', 'error');
            }
        }
    };

    // Menyiapkan modal untuk Edit
    const prepareEdit = (viewer) => {
        setEditingViewerId(viewer.id);
        // Pre-fill select (Asumsi viewer punya struktur user yang sesuai)
        setSelectedUser({
            value: viewer.user_id,
            label: viewer.EmpName || viewer.name // Sesuaikan dengan respon API
        });
        setShowViewerModal(true);
    };

    // Menyiapkan modal untuk Create
    const prepareCreate = () => {
        setEditingViewerId(null);
        setSelectedUser(null);
        setShowViewerModal(true);
    };

    // Close popover on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setShowViewers(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [popoverRef]);


    if (loading) {
        return (
            <div className="bg-white rounded-2xl border p-8 h-full flex flex-col items-center justify-center min-h-[400px]">
                <Loader />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="bg-white rounded-2xl border xs:p-6 md:p-8 h-full shadow-sm flex flex-col relative animate-fade-in">
            {/* Close mobile button */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
                <button 
                    onClick={onClose} 
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-4 w-fit"
                >
                    <i className='bx bx-arrow-back text-2xl'></i>
                </button>
                 <p className="text-gray-500 flex items-center self-center gap-2 xs:text-xs md:text-sm">
                    {DateFormat(data.tanggal)}
                </p>
            </div>
            
            {/* Header Detail */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex gap-2">
                     <span className={`
                        px-3 py-1 rounded-full text-xs font-medium border
                        ${data.is_full_approval 
                            ? 'bg-green-50 text-green-600 border-green-200' 
                            : 'bg-amber-50 text-amber-600 border-amber-200'}
                    `}>
                        {data.approval_message || (data.is_full_approval ? 'Approval selesai' : 'Proses Approval')}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${jenisMemo?.is_dynamic ? "bg-purple-50 text-purple-600 border border-purple-200" : "bg-cyan-50 text-cyan-700 border border-cyan-200"}`}>
                        {jenisMemo?.is_dynamic ? "Dinamis" : "Statis"}
                    </span>
                </div>
                <p className="text-gray-500 lg:flex items-center self-center gap-2 xs:text-xs md:text-sm xs:hidden ">
                    {DateFormat(data.tanggal)}
                </p>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{data.name}</h1>

            {/* Description Body */}
            <div className="text-gray-600 leading-relaxed text-base space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
                <div 
                    className="prose max-w-none rich-text-content" 
                    dangerouslySetInnerHTML={{ __html: data.description }} 
                />
                
                {data.notes && (
                    <div className="bg-gray-50 p-4 rounded-lg mt-4 border border-gray-100">
                        <p className="font-semibold text-gray-700 mb-1">Catatan:</p>
                        <p className="text-sm whitespace-pre-wrap">{data.notes}</p>
                    </div>
                )}
            </div>

            {/* Footer Action & User Info */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                
                {/* KIRI: Tombol 'Dapat dilihat oleh' (Dynamic Viewers) */}
                {
                    (!data.is_public && initial !== 'admin' && showViewerManagement) &&        
                <div className="relative w-full md:w-auto" ref={popoverRef}>
                    <button 
                        onClick={toggleViewers}
                        className="flex items-center justify-between gap-3 px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm text-gray-600 text-sm font-medium w-full md:w-auto"
                    >
                        {showViewers ? <i className='bx bx-chevron-down text-[20px]'></i> : <i className='bx bx-chevron-up text-[20px]'></i>}
                        <span>Dapat dilihat oleh</span>
                        <i className='bx bxs-user text-gray-400'></i>
                    </button>

                    {/* POP-UP LIST VIEWERS */}
                    {showViewers && (
                        <div className="absolute bottom-full left-0 mb-2 w-full md:w-[320px] bg-white border border-gray-200 rounded-xl shadow-xl z-20 animate-fade-in p-1">
                            {/* Tombol Add (+) di pojok kanan atas pop-up */}
                            <button 
                                onClick={prepareCreate}
                                className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105 z-30"
                                title="Tambah Viewer"
                            >
                                <i className='bx bx-plus text-xl'></i>
                            </button>
                            { console.log("Rendering viewers:", viewers) }
                            <div className="max-h-[250px] overflow-y-auto custom-scrollbar p-2 space-y-2">
                                {loadingViewers ? (
                                    <div className="flex justify-center py-4"><Loader /></div>
                                ) : viewers.length === 0 ? (
                                    <p className="text-center text-xs text-gray-400 py-3">Belum ada viewer tambahan.</p>
                                ) : (
                                    viewers.map((v, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                                            <div className="overflow-hidden">
                                                {/* Sesuaikan key v.name / v.user.name dengan respon API */}
                                                <p className="text-sm font-semibold text-gray-700 truncate">{v.EmpName || v.name || 'User'}</p>
                                                <p className="text-xs text-gray-400 truncate">{v.user_email || v.email || 'No Email'}</p>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                                {/* Action Buttons: Update & Delete */}
                                                <button 
                                                    onClick={() => prepareEdit(v)}
                                                    className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-md transition-colors"
                                                    title="Edit"
                                                >
                                                    <i className='bx bx-edit text-lg'></i>
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteViewer(v.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Hapus"
                                                >
                                                    <i className='bx bx-trash text-lg'></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
                }

                {/* KANAN: Action Update/Delete Memo Utama */}
                <div className="flex justify-end gap-3 w-full md:w-auto">
                    {/* (Optional) User Info yang tadinya di kiri, bisa dipindah atau disembunyikan jika sempit */}
                    { initial === 'admin' && (
                         <div className="flex items-center gap-2 mr-4 border-r pr-4">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                <i className='bx bxs-user'></i>
                            </div>
                            <div className="ms-1">
                                <p className="text-xs font-bold text-gray-700">{user?.EmpName}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                    )}

                   {(canUpdate && data.canBeUpdated) && (
                        <button 
                            onClick={() => goToUpdate(data.id)}
                            className="px-5 py-2 rounded-lg update-button flex items-center gap-2 text-sm"
                        >
                            <i className='bx bx-edit'></i> Update
                        </button>
                    )} 
                   {(canDelete) && (
                        <button 
                            onClick={() => handleDelete(data.id)}
                            className="px-5 py-2 rounded-lg delete-button flex items-center gap-2 text-sm"
                        >
                            <i className='bx bx-trash'></i> Delete
                        </button>
                    )} 
                </div>
            </div>

            {/* --- MODAL ADD/EDIT VIEWER (OVERLAY) --- */}
            {showViewerModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px] rounded-2xl animate-fade-in">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-[90%] max-w-sm border border-gray-100">
                        <div className="w-full flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingViewerId ? 'Edit Akses User' : 'Tambah Akses User'}
                            </h3>
                            <button onClick={() => setShowViewerModal(false)} className="w-fit text-gray-400 hover:text-gray-600">
                                <i className='bx bx-x text-2xl'></i>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSaveViewer} className="space-y-4">
                            <div className="h-30">
                                <label className="text-xs font-semibold text-gray-500 mb-1">Pilih User</label>
                                <SelectPaginate
                                    source={'inventUser'} 
                                    selectValue={selectedUser}
                                    handleSelectChange={setSelectedUser}
                                    placeholder="Pilih atau cari user..."
                                    maxMenuHeight={160}
                                    className="text-sm h-10"
                                    selectName="user"
                                    itemLabel={['EmpName']} // Sesuaikan field label
                                />
                            </div>
                            
                            <div className="flex gap-2 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowViewerModal(false)}
                                    className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submittingViewer}
                                    className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300"
                                >
                                    {submittingViewer ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default MemoDetailView;