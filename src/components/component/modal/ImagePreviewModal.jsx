import React from 'react';
import PropTypes from 'prop-types';

const ImagePreviewModal = ({ imageUrl, onClose, isOpen }) => {
  // Jangan render apapun jika modal tidak terbuka
  if (!isOpen) {
    return null;
  }

  return (
    // Backdrop/Overlay
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300"
      onClick={onClose} // Klik di luar gambar akan menutup modal
    >
      {/* Tombol Close di pojok kanan atas */}
      {/* <button
        className="absolute top-4 right-5 text-white text-4xl font-bold hover:text-gray-300"
        onClick={onClose}
      >
        &times;
      </button> */}

      {/* Kontainer Gambar */}
      <div className="relative p-4">
        <img
          src={imageUrl}
          alt="Image Preview"
          className="max-w-[90vw] max-h-[90vh] object-contain"
          // Mencegah klik pada gambar menutup modal
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

ImagePreviewModal.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

export default ImagePreviewModal;