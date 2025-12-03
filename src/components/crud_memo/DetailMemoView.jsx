import React from 'react';
import DateFormat from '../../helper/DateFormatHelper';
import Loader from '../component/Loader'; // Sesuaikan path loader lu
// import moment from 'moment';

const MemoDetailView = ({ data, loading, onClose, goToUpdate, canUpdate }) => {
    const user = data?.user;
    const jenisMemo = data?.jenis_memo;

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border p-8 h-full flex flex-col items-center justify-center min-h-[400px]">
                <Loader />
                <p className="text-gray-400 text-sm mt-3">Mengambil detail...</p>
            </div>
        );
    }

    if (!data) return null;

    // const formattedDate = data.created_at ? moment(data.created_at).format("DD MMM YYYY") : "-";

    return (
        <div className="bg-white rounded-2xl border p-8 h-full shadow-sm flex flex-col relative animate-fade-in">
            
            {/* Header Detail: Badges & Date */}
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
                <div className="text-right">
                     <p className="text-gray-500 text-sm flex items-center gap-2">
                        <i className="bx bx-calendar text-base"></i> 
                        {DateFormat(data.tanggal)}
                    </p>
                     {/* Tombol close mobile/desktop jika perlu */}
                     <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600 mt-1">
                        <i className='bx bx-x text-2xl'></i>
                     </button>
                </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{data.name}</h1>

            {/* Description Body */}
            <div className="text-gray-600 leading-relaxed text-base space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <p>{data.description}</p>
                
                {/* Jika ada data tambahan detail lain */}
                {data.notes && (
                    <div className="bg-gray-50 p-4 rounded-lg mt-4 border border-gray-100">
                        <p className="font-semibold text-gray-700 mb-1">Catatan:</p>
                        <p className="text-sm">{data.notes}</p>
                    </div>
                )}
            </div>

            {/* Footer Action & User Info */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                
                {/* User Info (Bottom Left seperti gambar) */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <i className='bx bxs-user text-xl'></i>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-700">{user?.EmpName || "Anonymous"}</p>
                        <p className="text-xs text-gray-400">{user?.EmpCode || "-"}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    {/* Tombol Update hanya muncul jika punya akses & kondisi memo allow */}
                    {/* {(canUpdate && data.canBeUpdated !== false) && (
                        <button 
                            onClick={() => goToUpdate(data.id)}
                            className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <i className='bx bx-edit'></i> Update
                        </button>
                    )} */}
                    
                    {/* Tombol Print/Share (Optional) */}
                    {/* <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm shadow-blue-200 transition-colors">
                        Lihat Dokumen
                    </button> */}
                </div>
            </div>
        </div>
    );
};

export default MemoDetailView;