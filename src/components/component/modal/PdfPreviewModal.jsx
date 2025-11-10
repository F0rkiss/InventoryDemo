import React from 'react';

const PdfPreviewModal = ({ isOpen, onClose, pdfUrl, fileName, isMobile, isMobileSafari }) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    const tempLink = document.createElement('a');
    tempLink.href = pdfUrl;
    if (isMobileSafari) {
      // **PERLAKUAN KHUSUS SAFARI:**
      // Buka di tab baru. Hapus 'download' dan tambahkan 'target'.
      tempLink.setAttribute('target', '_blank');
      // Tambahkan rel untuk keamanan saat menggunakan target_blank
      tempLink.setAttribute('rel', 'noopener noreferrer');
    } else {
      // **PERLAKUAN NORMAL (Chrome, Firefox, dll.):**
      // Paksa download menggunakan atribut 'download'.
      tempLink.setAttribute('download', fileName || 'download.pdf'); 
    }
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose} // Tutup modal saat klik di luar
    >
      <div 
        className="bg-white p-4 rounded-lg shadow-xl w-[90%] h-[90%] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Cegah penutupan saat klik di dalam
      >
        <div className="flex justify-between items-center w-full mb-2">
          <p className="text-lg font-semibold">Preview PDF</p>
          <div className="space-x-2">
            { isMobile && (
                <button onClick={handleDownload} className="text-2xl font-semibold text-white h-fit w-fit px-2 bg-sky-500 hover:bg-sky-600 rounded-md self-center transition-color duration-200">
                    <i className="bx bx-download"></i>
                </button> )
            }
            <button onClick={onClose} className="text-2xl  font-semibold text-white  w-fit px-2 bg-red-500 hover:bg-red-600 rounded-md self-center transition-color duration-200">&times;</button>
          </div>
        </div>
        
        {/* Embed PDF menggunakan iframe */}
        <iframe
          src={pdfUrl}
          className="w-full h-full border-0"
          title="PDF Preview"
          type="application/pdf"
        />
        
        {/* Fallback jika iframe tidak didukung */}
        {/* <embed 
           src={pdfUrl} 
           type="application/pdf" 
           className="w-full h-full"
        /> */}
      </div>
    </div>
  );
};

export default PdfPreviewModal;