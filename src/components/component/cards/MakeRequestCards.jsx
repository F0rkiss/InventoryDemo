import React, { useState, forwardRef } from 'react';
import DateFormat from '../../../helper/DateFormatHelper';

const MakeRequestCards = forwardRef(({ item, goToDetail, canUpdate, goToUpdate }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const user = item.user;

    const toggleExpansion = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className='rounded-2xl bg-white p-5 shadow-sm border transition-shadow duration-200 hover:shadow-md' ref={ref}>
            {/* --- Always Visible Header --- */}
            <div className='flex justify-between items-start cursor-pointer'>
                <div className='flex flex-col gap-2'>
                    <div>
                        <p className='font-bold text-lg sm:text-md'>{item.kode}</p>
                        <p className='text-sm'>{DateFormat(item.tanggal)}</p>
                    </div>
                    <div className={`max-w-max flex self-start rounded-md border ${item.is_full_approval ? 'bg-green-50 border-green-400' : 'bg-amber-50 border-amber-400'}`}>
                        {item.approval_message ? (
                            <p className={`py-1 px-3 text-xs font-medium ${item.is_full_approval ? 'text-green-700' : 'text-amber-600'}`}>
                                {item.approval_message}
                            </p>
                        ) : (
                            <p className={`py-1 px-3 text-xs font-medium ${item.is_full_approval ? 'text-green-700' : 'text-amber-600'}`}>
                                {item.is_full_approval ? 'Approval sudah selesai' : 'Approval belum selesai'}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    className='px-2 py-1 detail-button self-center'
                    aria-expanded={isExpanded}
                    aria-label="Toggle details"
                    onClick={toggleExpansion}
                >
                    <i className={`bx bxs-chevron-down text-2xl text-gray-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* --- Expandable Content --- */}
            <div
            className={`
                mt-2 pt-2 transition-all duration-500 overflow-hidden
                ${isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}
            `}
            >
                <div className="flex justify-end space-x-2">
                    { (canUpdate && item.canBeUpdated) &&
                        <button
                            className="w-fit px-5 py-2 update-button flex items-center text-sm gap-2"
                            onClick={() => goToUpdate(item.id)}
                            title="Update Request"
                        >
                            Update
                            <i className="bx bx-edit"></i>
                        </button>
                    }

                </div>
                <div className="gap-x-4 space-y-4 mb-4 text-sm">
                    { (item.EmpName || user?.EmpName) &&
                        <div className=''>
                            <p className="text-gray-500">Nama Karyawan</p>
                            <p className="font-medium capitalize">{item.EmpName || user?.EmpName}</p>
                        </div>
                    }
                    { (item.nameTypeRequest || item.type_name) &&
                            <div className=''>
                            <p className="text-gray-600">Type Request</p>
                            <p className="font-medium">{item.nameTypeRequest || item.type_name}</p>
                        </div>
                    }
                    { (item.jenisTypeRequest || item.type_jenis) &&
                            <div className=''>
                            <p className="text-gray-600">Jenis</p>
                            <p className="font-medium">{item.jenisTypeRequest || item.type_jenis}</p>
                        </div>
                    }
                    { (item.deskripsiTypeRequest || item.description) &&
                        <div className="sm:col-span-3 mt-1 text-gray-700">
                            {item.deskripsiTypeRequest || item.description}
                        </div>
                    }
                </div>
                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                        <button
                            className="more-detail-button"
                            onClick={() => goToDetail(item.id)}
                        >
                            Lihat Detail <i className="bx bx-chevron-right text-lg"></i>
                        </button>
                    </div>
            </div>
        </div>
    );
});

export default MakeRequestCards;