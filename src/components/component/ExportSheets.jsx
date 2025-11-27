// fileName: ExportSheets.jsx

import React, { useState } from 'react';
import api from '../../api/api';
// Pastikan path ini benar berdasarkan struktur folder kamu
import ModalExport from '../component/ModalExport'; 

/**
 * Reusable Export Button Component
 * * @param {string} endpoint - The API endpoint to call (e.g., '/export-materialRequest' or '/export-stok')
 * @param {string} filenamePrefix - The prefix for the downloaded file (e.g., 'material-request')
 * @param {string} label - The text to display on the button (default: 'Export')
 */

function ExportButton({ 
    endpoint = '/export-materialRequest', // Default fallback
    filenamePrefix = 'export-data',       // Default fallback
    label = 'Export'
}) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!loading) {
        setIsModalOpen(false);
    }
  };

  // Menerima objek 'dates' yang berisi { start_date, end_date }
  const handleProcessExport = async (dates) => {
    setLoading(true);
    try {
      
      // Ambil nilai start_date dan end_date dari objek dates
      const { start_date, end_date } = dates;

      // Gunakan endpoint dinamis yang dilewatkan via props
      const response = await api.get(endpoint, {
        params: {
            start_date: start_date, // Kirim start_date ke API
            end_date: end_date     // Kirim end_date ke API
        },
        responseType: 'blob',
      });

      const fileBlob = response.data;
      if (fileBlob.size === 0) {
        alert("Export failed: The server sent an empty file.");
        return;
      }

      const url = window.URL.createObjectURL(fileBlob);
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers['content-disposition'];
      
      // Gunakan rentang tanggal untuk nama file agar lebih informatif
      // Kita format tanggal di nama file dari YYYY-MM-DD menjadi DDMMYYYY (opsional, tapi lebih rapi)
      const formatFilenameDate = (dateISO) => {
        if (!dateISO) return '';
        const parts = dateISO.split('-'); // YYYY-MM-DD
        return `${parts[2]}${parts[1]}${parts[0]}`; // DDMMYYYY
      }
      
      const formattedStartDate = formatFilenameDate(start_date);
      const formattedEndDate = formatFilenameDate(end_date);
      
      // Nama file default baru
      let filename = `${filenamePrefix}-${formattedStartDate}-to-${formattedEndDate}.xlsx`; 
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }
      link.setAttribute('download', filename);

      link.target = '_blank';
      link.className = 'external';

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
      
      setIsModalOpen(false);

    } catch (error) {
      console.error("Error during export:", error);
      alert("An error occurred during the export. Check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
        <button
        onClick={handleOpenModal}
        disabled={loading}
        className="py-2 px-3 md:px-6 w-fit bg-green-600 text-white rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center justify-center transition-colors duration-200"
        title={`Export to Excel`}
        >
        {loading ? (
            <svg className="animate-spin h-5 w-5 text-white mx-1 my-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        ) : (
            <div className="flex items-center space-x-2">
            <p className="font-medium hidden md:block">{label}</p>
            <i className="bx bx-export text-lg md:!ml-1 !ml-0 md:px-0 py-1 px-1.5"></i>
            </div>
        )}
        </button>

        <ModalExport 
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onConfirm={handleProcessExport} // onConfirm sekarang menerima objek { start_date, end_date }
            loading={loading}
        />
    </>
  );
}

export default ExportButton;