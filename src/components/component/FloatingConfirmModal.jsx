import React from 'react';

const FloatingConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  description = '',
  confirmText = 'Ya',
  cancelText = 'Batal',
  loading = false,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs mx-2 animate-fadeIn">
        <h3 className="text-lg font-bold mb-2 text-center">{title}</h3>
        {description && <p className="text-gray-700 mb-4 text-center">{description}</p>}
        <div className="flex gap-2 mt-4">
          <button
            className="flex-1 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className="flex-1 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white font-semibold disabled:opacity-60"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Memproses...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingConfirmModal; 