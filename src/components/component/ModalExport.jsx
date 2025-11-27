// fileName: ModalExport.jsx

import React, { useState, useEffect } from 'react';
import DatePicker from './DatePicker'; // Asumsikan DatePicker ada di folder yang sama atau sesuaikan path

const ModalExport = ({ isOpen, onClose, onConfirm, loading }) => {
    // State untuk rentang tanggal
    // Nilai awal diatur ke hari ini dalam format YYYY-MM-DD
    const todayISO = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(todayISO);
    const [endDate, setEndDate] = useState(todayISO);

    // Reset tanggal ke hari ini ketika modal dibuka
    useEffect(() => {
        if (isOpen) {
            const nowISO = new Date().toISOString().split('T')[0];
            setStartDate(nowISO);
            setEndDate(nowISO);
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Pastikan kedua tanggal sudah terpilih sebelum konfirmasi
        if (startDate && endDate) {
            // Panggil onConfirm dengan objek yang berisi start_date dan end_date
            onConfirm({ start_date: startDate, end_date: endDate });
        } else {
            alert("Mohon pilih tanggal awal dan tanggal akhir, bro.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-20 backdrop-blur-[1px] p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm transform transition-all">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Export Data To Excel
                    </h3>
                    <p className="text-sm text-gray-500">
                        Pilih rentang tanggal data yang ingin Anda ekspor.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className='flex gap-3'>
                            <div className="mb-4">
                                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                                    Dari Tanggal
                                </label>
                                <DatePicker 
                                    value={startDate} 
                                    onChange={setStartDate} // onChange akan memberikan nilai dalam format YYYY-MM-DD
                                    disabled={loading}
                                />
                            </div>

                            <div className="mb-6">
                                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                                    Sampai Tanggal
                                </label>
                                <DatePicker 
                                    value={endDate} 
                                    onChange={setEndDate} // onChange akan memberikan nilai dalam format YYYY-MM-DD
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !startDate || !endDate} // Disable jika loading atau tanggal belum lengkap
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    'Export'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModalExport;