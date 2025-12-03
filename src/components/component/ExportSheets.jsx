import React, { useState } from 'react';
import api from '../../api/api';
import ModalExport from '../component/modal/ModalExport'; 
import { saveAs } from 'file-saver';

function ExportButton({ 
    endpoint = '/export-materialRequest', 
    filenamePrefix = 'export-data',       
    label = 'Export'
}) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => !loading && setIsModalOpen(false);

  // Menerima data bisa berupa { start_date, end_date } ATAU { tahun }
  const handleProcessExport = async (filterData) => {
    setLoading(true);
    try {
      let params = {};
      let filenameDatePart = '';

      // === SETUP PARAMETER (Sama seperti sebelumnya) ===
      if (filterData.tahun) {
        params = { tahun: filterData.tahun };
        filenameDatePart = `Year-${filterData.tahun}`;
      } else {
        const { start_date, end_date } = filterData;
        params = { start_date, end_date };
        
        const formatFilenameDate = (dateISO) => {
            if (!dateISO) return '';
            const parts = dateISO.split('-');
            return `${parts[2]}${parts[1]}${parts[0]}`;
        };
        filenameDatePart = `${formatFilenameDate(start_date)}-to-${formatFilenameDate(end_date)}`;
      }

      const response = await api.get(endpoint, {
        params: params,
        responseType: 'blob', // Wajib
      });


      // === DETEKSI ERROR TERSEMBUNYI ===
      // Kadang status 200, tapi isinya JSON Error (bukan file xlsx)
      const contentType = response.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
          // Kita paksa baca blob sebagai text JSON untuk tau errornya
          const reader = new FileReader();
          reader.onload = () => {
              const errorData = JSON.parse(reader.result);
              alert("Gagal Export: " + (errorData.message || "Terjadi kesalahan di server."));
          };
          reader.readAsText(response.data);
          return; 
      }

      // === MEMBUAT FILE BLOB ===
      const blob = new Blob([response.data], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });

      // === MENENTUKAN NAMA FILE ===
      let filename = `${filenamePrefix}-${filenameDatePart}.xlsx`;
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.indexOf('attachment') !== -1) {
          const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
          if (matches != null && matches[1]) { 
            filename = matches[1].replace(/['"]/g, '');
          }
      }

      
      saveAs(blob, filename); 

      setIsModalOpen(false);

    } catch (error) {
      alert("Terjadi kesalahan sistem. Cek Console (F12) untuk detail.");
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
            title="Export Data"
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
            onConfirm={handleProcessExport} 
            loading={loading}
        />
    </>
  );
}

export default ExportButton;