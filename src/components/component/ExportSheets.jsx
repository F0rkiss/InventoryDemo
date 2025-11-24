import React, { useState } from 'react';
import api from '../../api/api';

function ExportButton() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await api.get('/export', {
        responseType: 'blob',
      });

      const fileBlob = response.data;
      if (fileBlob.size === 0) {
        alert("Export failed: The server sent an empty file.");
        return;
      }

      // Create a temporary URL for the downloaded file
      const url = window.URL.createObjectURL(fileBlob);
      // Create a temporary, invisible link element
      const link = document.createElement('a');
      link.href = url;

      // Get filename from the server's response headers
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'make-request-data.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }
      link.setAttribute('download', filename);

      // ==> THE FIX: Add these attributes to bypass Framework7's router <==
      link.target = '_blank';
      link.className = 'external';
      // ===================================================================

      // Append the link to the document, click it, and then remove it
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Clean up the temporary URL
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error during export:", error);
      alert("An error occurred during the export. Check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      // PERUBAHAN 1: Ubah px-6 menjadi 'px-3 md:px-6' agar di mobile tombol lebih ramping
      className="py-2 px-3 md:px-6 w-fit bg-green-600 text-white rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center justify-center transition-colors duration-200"
      title="Export to Excel"
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5 text-white mx-1 my-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <div className="flex items-center space-x-2">
          {/* PERUBAHAN 2: Tambahkan 'hidden md:block' agar teks hilang di mobile */}
          <p className="font-medium hidden md:block">Export</p>
          <i className="bx bx-export text-lg md:!ml-1 !ml-0 md:px-0 py-1 px-1.5"></i>
        </div>
      )}
    </button>
  );
}

export default ExportButton;