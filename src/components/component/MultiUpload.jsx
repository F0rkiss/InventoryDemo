import React from 'react';

const MultiUpload = ({
  items,
  handleUpload,
  handleDelete,
  onImageClick, // PROPS BARU, default ke 'image'
}) => {
  // Gunakan imageKey untuk mengakses array yang benar
  const images = items?.image || [];
  return (
    <div className="flex flex-wrap gap-4 p-2">
      {/* Tombol Upload */}
      <label className="flex flex-col items-center justify-center w-28 h-28 border-2 border-dashed border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
        </svg>
        <span className="mt-2 text-xs text-gray-500 text-center">Upload File</span>
        <input
          type="file"
          multiple
          className="hidden"
          onChange={handleUpload}
          accept="image/jpeg,image/png,image/gif"
        />
      </label>

      {/* Daftar Gambar */}
      {images.map((image, index) => {
        // Tentukan URL berdasarkan tipe data (File baru atau string URL lama)
        const imageUrl = image instanceof File ? URL.createObjectURL(image) : image;
        
        return (
          <div key={index} className="relative w-28 h-28 group">
            {/* Pembungkus Gambar */}
            <div className="w-full h-full rounded-md overflow-hidden border border-gray-200 shadow-sm">
              <div
                className="w-full h-full bg-gray-100 flex items-center justify-center cursor-pointer hover:opacity-90 transition"
                onClick={() => onImageClick && onImageClick(imageUrl)}
              >
                <img
                  src={imageUrl}
                  alt={`preview-${index}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100?text=No+Img'; }}
                />
              </div>
            </div>

            {/* Tombol Delete */}
            <button
              type="button"
              onClick={() => handleDelete(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md z-10 hover:bg-red-600 transition-colors"
              title="Hapus gambar"
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default MultiUpload;