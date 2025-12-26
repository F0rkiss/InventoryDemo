import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

// Konfigurasi Siklus Filter
const APPROVAL_CYCLE = ['all', 'completed', 'not_completed'];
const DYNAMIC_CYCLE = ['all', 'dynamic', 'manual'];

// Konfigurasi Tampilan (Label & Style)
const FILTER_CONFIG = {
  approval: {
    all: { label: 'Semua Status', color: 'text-gray-600', bg: 'bg-gray-100', icon: 'bx bx-layer' },
    completed: { label: 'Sudah Approve', color: 'text-green-600', bg: 'bg-green-50', icon: 'bx bxs-check-circle' },
    not_completed: { label: 'Proses Approval', color: 'text-orange-600', bg: 'bg-orange-50', icon: 'bx bx-time-five' },
  },
  dynamic: {
    all: { label: 'Semua Tipe', color: 'text-gray-600', bg: 'bg-gray-100', icon: 'bx bx-file' },
    dynamic: { label: 'Dinamis', color: 'text-purple-600', bg: 'bg-purple-50', icon: 'bx bxs-zap' },
    manual: { label: 'Statis', color: 'text-cyan-600', bg: 'bg-cyan-50', icon: 'bx bxs-pencil' },
  }
};

export default function MemoFilterDropdown({ 
  approvalFilter, 
  setApprovalFilter, 
  dynamicFilter, 
  setDynamicFilter,
  disabled 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Logic Click Outside untuk menutup dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Fungsi Helper untuk ganti state (Cycle)
  const cycleState = (current, cycleList, setter) => {
    const idx = cycleList.indexOf(current);
    const next = cycleList[(idx + 1) % cycleList.length];
    setter(next);
  };

  // Cek apakah ada filter yang aktif (untuk styling tombol utama)
  const isFilterActive = approvalFilter !== 'all' || dynamicFilter !== 'all';

  // Ambil config tampilan saat ini
  const currentApproval = FILTER_CONFIG.approval[approvalFilter];
  const currentDynamic = FILTER_CONFIG.dynamic[dynamicFilter];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 1. TOMBOL UTAMA (TRIGGER) */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm border
          ${isFilterActive 
            ? 'bg-blue-50 border-blue-200 text-blue-700' 
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        <i className='bx bx-filter text-xl'></i>
        <span className="font-medium text-sm">Filter</span>
        {isFilterActive && (
             <span className="flex h-2 w-2 rounded-full bg-blue-600 ml-1"></span>
        )}
      </button>

      {/* 2. DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 p-2 animate-fade-in origin-top-right">
          
          <div className="space-y-1">
            {/* --- Opsi 1: Approval Filter --- */}
            <div 
              onClick={() => cycleState(approvalFilter, APPROVAL_CYCLE, setApprovalFilter)}
              className={`
                group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent
                hover:bg-gray-50 hover:border-gray-100
              `}
            >
              <div className="flex items-center gap-3">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentApproval.bg} ${currentApproval.color}`}>
                    <i className={currentApproval.icon}></i>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-medium">Status Approval</span>
                    <span className={`text-sm font-semibold ${approvalFilter !== 'all' ? 'text-gray-800' : 'text-gray-600'}`}>
                        {currentApproval.label}
                    </span>
                 </div>
              </div>
              
              {/* Indikator Checkmark kalau aktif */}
              {approvalFilter !== 'all' && (
                  <i className='bx bx-check text-blue-600 text-xl'></i>
              )}
              {approvalFilter === 'all' && (
                  <i className='bx bx-chevron-right text-gray-300 text-xl group-hover:text-gray-500 transition-colors'></i>
              )}
            </div>

            {/* Divider Tipis */}
            <div className="h-px bg-gray-100 mx-2 my-1"></div>

            {/* --- Opsi 2: Dynamic Filter --- */}
            <div 
              onClick={() => cycleState(dynamicFilter, DYNAMIC_CYCLE, setDynamicFilter)}
              className={`
                group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent
                hover:bg-gray-50 hover:border-gray-100
              `}
            >
              <div className="flex items-center gap-3">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentDynamic.bg} ${currentDynamic.color}`}>
                    <i className={currentDynamic.icon}></i>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-medium">Tipe Memo</span>
                    <span className={`text-sm font-semibold ${dynamicFilter !== 'all' ? 'text-gray-800' : 'text-gray-600'}`}>
                        {currentDynamic.label}
                    </span>
                 </div>
              </div>

               {/* Indikator Checkmark kalau aktif */}
               {dynamicFilter !== 'all' && (
                  <i className='bx bx-check text-blue-600 text-xl'></i>
              )}
              {dynamicFilter === 'all' && (
                  <i className='bx bx-chevron-right text-gray-300 text-xl group-hover:text-gray-500 transition-colors'></i>
              )}
            </div>
          </div>
          
          {/* Tombol Reset (Optional: Muncul hanya jika ada filter aktif) */}
          {isFilterActive && (
            <div className="mt-2 pt-2 border-t border-gray-100">
                <button 
                    onClick={() => { setApprovalFilter('all'); setDynamicFilter('all'); setIsOpen(false); }}
                    className="w-full py-2 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                    Reset Filter
                </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

MemoFilterDropdown.propTypes = {
  approvalFilter: PropTypes.string.isRequired,
  setApprovalFilter: PropTypes.func.isRequired,
  dynamicFilter: PropTypes.string.isRequired,
  setDynamicFilter: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};