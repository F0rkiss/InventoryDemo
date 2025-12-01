// fileName: ModalExport.jsx

import React, { useState, useEffect } from 'react';
import DatePicker from '../DatePicker';
import YearPicker from '../YearPicker';

const ModalExport = ({ isOpen, onClose, onConfirm, loading }) => {
    // === STATE ===
    const todayISO = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();

    // Mode: 'range' (Tanggal) atau 'year' (Tahun)
    const [exportMode, setExportMode] = useState('range'); 
    
    // State Tanggal
    const [startDate, setStartDate] = useState(todayISO);
    const [endDate, setEndDate] = useState(todayISO);

    // State Tahun
    const [selectedYear, setSelectedYear] = useState(currentYear);

    // Generate list tahun (misal: 5 tahun ke belakang sampai 1 tahun ke depan)
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
        years.push(i);
    }

    // Reset state saat modal dibuka
    useEffect(() => {
        if (isOpen) {
            setExportMode('range'); // Default balik ke range
            setStartDate(todayISO);
            setEndDate(todayISO);
            setSelectedYear(currentYear);
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (exportMode === 'range') {
            // Mode Rentang Tanggal
            if (startDate && endDate) {
                onConfirm({ start_date: startDate, end_date: endDate });
            } else {
                alert("Mohon pilih tanggal awal dan tanggal akhir, bro.");
            }
        } else {
            // Mode Tahun
            if (selectedYear) {
                // Kirim key 'tahun' sesuai request
                onConfirm({ tahun: selectedYear });
            } else {
                alert("Mohon pilih tahunnya, bro.");
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm transform transition-all">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Export Data
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Pilih metode export yang diinginkan.
                    </p>

                    <form onSubmit={handleSubmit}>
                        
                        {/* === PILIHAN MODE (RADIO BUTTONS) === */}
                        <div className="flex gap-4 mb-5 p-1 bg-gray-100 rounded-lg">
                            <label className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md cursor-pointer transition-all ${exportMode === 'range' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                <input 
                                    type="radio" 
                                    name="exportMode" 
                                    value="range" 
                                    className="hidden" 
                                    checked={exportMode === 'range'}
                                    onChange={() => setExportMode('range')}
                                />
                                Rentang Tanggal
                            </label>
                            <label className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md cursor-pointer transition-all ${exportMode === 'year' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                <input 
                                    type="radio" 
                                    name="exportMode" 
                                    value="year" 
                                    className="hidden" 
                                    checked={exportMode === 'year'}
                                    onChange={() => setExportMode('year')}
                                />
                                Per Tahun
                            </label>
                        </div>

                        {/* === INPUT FIELD BERDASARKAN MODE === */}
                        {exportMode === 'range' ? (
                            // MODE RENTANG TANGGAL
                            <div className='flex flex-col gap-3'>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 ">
                                        Dari Tanggal
                                    </label>
                                    <DatePicker 
                                        value={startDate} 
                                        onChange={setStartDate} 
                                        disabled={loading}
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="text-sm font-medium text-gray-700 mb-1 ">
                                        Sampai Tanggal
                                    </label>
                                    <DatePicker 
                                        value={endDate} 
                                        onChange={setEndDate} 
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        ) : (
                            // MODE TAHUN
                            <div className="mb-6">
                                <label className="text-sm font-medium text-gray-700 mb-1 ">
                                    Pilih Tahun
                                </label>
                                <YearPicker 
                                    value={selectedYear}
                                    onChange={setSelectedYear}
                                />
                            </div>
                        )}

                        {/* === BUTTON ACTIONS === */}
                        <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Export'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModalExport;