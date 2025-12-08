import React from 'react';
import DateFormat from '../../helper/DateFormatHelper';
import Loader from './Loader'; // Sesuaikan path loader lu
// import moment from 'moment';

const MemoDetailView = ({ data, loading, onClose, goToUpdate, canUpdate, canDelete, handleDelete, initial }) => {
    const user = data?.user;
    const jenisMemo = data?.jenis_memo;

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
            <div className="text-gray-600 leading-relaxed text-base space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div 
                    className="prose max-w-none rich-text-content" // Kasih class buat styling manual jika perlu
                    dangerouslySetInnerHTML={{ __html: data.description }} 
                />
                
                {/* Jika ada data notes */}
                {data.notes && (
                    <div className="bg-gray-50 p-4 rounded-lg mt-4 border border-gray-100">
                        <p className="font-semibold text-gray-700 mb-1">Catatan:</p>
                        <p className="text-sm whitespace-pre-wrap">{data.notes}</p>
                    </div>
                )}
            </div>

            {/* Footer Action & User Info */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                
                {/* User Info */}
                {   initial === 'admin' && (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <i className='bx bxs-user text-xl'></i>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-700">{user?.EmpName || "Anonymous"}</p>
                            <p className="text-xs text-gray-400">{user?.EmpCode || "-"}</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 w-full">
                   {(canUpdate && data.canBeUpdated) && (
                        <button 
                            onClick={() => goToUpdate(data.id)}
                            className="w-fit px-5 py-2 update-button flex items-center text-sm gap-2"
                        >
                            <i className='bx bx-edit'></i> Update
                        </button>
                    )} 
                   {(canDelete) && (
                        <button 
                            onClick={() => handleDelete(data.id)}
                            className="w-fit px-5 py-2 delete-button flex items-center text-sm gap-2"
                        >
                            <i className='bx bx-edit'></i> Delete
                        </button>
                    )} 
                </div>
            </div>
        </div>
    );
};

export default MemoDetailView;