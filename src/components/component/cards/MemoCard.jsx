import React, { useState, forwardRef } from 'react';
import DateFormat from '../../../helper/DateFormatHelper';

const MemoCard = ({ item, isSelected, onClick, initial }) => {
    const stripHtml = (html) => {
        if (!html) return "";
        // 1. Ganti tag <br>, </div>, </p> dengan spasi dulu biar teks gak nempel
        let textWithSpaces = html.replace(/<br\s*\/?>/gi, ' ')
                                 .replace(/<\/p>/gi, ' ')
                                 .replace(/<\/div>/gi, ' ');
        // 2. Baru hapus sisa tag HTML lainnya
        return textWithSpaces.replace(/<[^>]*>?/gm, '').trim();
    };

    return (
        <div 
            onClick={onClick}
            className={`
                group cursor-pointer rounded-xl border p-4 transition-all duration-200
                hover:shadow-md relative bg-white
                ${isSelected ? 'border-blue-500 ring-1 ring-blue-500 shadow-md' : 'border-gray-200'}
            `}
        >
            {/* Header: User Icon & Name */}
            {   initial === 'admin' && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                        <i className='bx bxs-user'></i>
                </div>
                <span className="text-xs text-gray-500 font-medium">{item.EmpName || "User"}</span>
            </div>
            ) }
            
            {/* Content: Title & Desc */}
            <div className="flex justify-between items-start gap-2">
                <div className='flex-1 min-w-0'>
                    <span className="text-sm text-gray-600 font-regular text-right flex items-center gap-2">
                        <p className="xs:text-[11px] md:text-[12px]">{DateFormat(item.tanggal)}</p>
                    </span>
                    <h3 className="font-bold text-gray-800 text-lg mb-1">{item.name || "Judul Memo"}</h3>
                    
                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed break-words">
                        {stripHtml(item.description) || "Tidak ada deskripsi."}
                    </p>

                </div>
                
                {/* Expand Icon */}
                <div className={`
                    py-2 px-3 rounded-lg transition-colors
                    ${isSelected ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}
                `}>
                     {isSelected ? 
                        <i className='bx bx-collapse-alt text-xl'></i> : 
                        <i className='bx bx-expand-alt text-xl'></i>
                     }
                </div>
            </div>

            {/* Footer: Tags & Date */}
            {initial !== 'dashboard' &&
                <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-2">
                        <span className={`
                            px-3 py-1 rounded-full text-[12px] font-semibold border
                            ${item.is_full_approval 
                                ? 'bg-green-50 text-green-600 border-green-200' 
                                : 'bg-amber-50 text-amber-600 border-amber-200'}
                        `}>
                            {item.is_full_approval ? 'Sudah diapprove' : 'Proses Approval'}
                        </span>
                        
                        <span className={`px-3 py-1 rounded-full text-[12px] font-semibold ${item.is_dynamic ? "bg-purple-50 text-purple-600 border border-purple-200" : "bg-cyan-50 text-cyan-700 border border-cyan-200"} `}>
                            {item.is_dynamic ? "Dinamis" : "Statis"}
                        </span>

                        <span className={`px-3 py-1 rounded-full text-[12px] font-semibold ${item.is_public ? "bg-teal-50 text-teal-600 border border-teal-200" : "bg-red-50 text-red-700 border border-red-200"} `}>
                            {item.is_public ? "Public" : "Private"}
                        </span>
                    </div>

                </div>
            }
        </div>
    );
};

export default MemoCard;