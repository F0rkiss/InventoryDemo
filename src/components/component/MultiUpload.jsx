import React from 'react'

const MultiUpload = ({ items = { image: [] }, required, handleDelete, handleUpload }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-300 font-inter text-gray-700 space-y-4">
      {/* Upload Button */}
      <div>
        <label htmlFor="img">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-blue-600 transition">
            <i className="bx bx-upload text-lg"></i>
            Pilih Gambar
          </div>
        </label>
        <input
          type="file"
          id="img"
          name="img"
          multiple
          required={required}
          accept="image/png, image/jpeg"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {/* Image Previews */}
      {items.image?.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.image.map((file, index) => {
            const imageUrl = file instanceof File ? URL.createObjectURL(file) : file
            return (
              <div
                key={index}
                className="relative group rounded-md overflow-hidden border border-gray-200 shadow-sm"
              >
                <img
                  src={imageUrl}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-28 object-cover transition duration-200 group-hover:blur-sm"
                />
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  className="absolute inset-0 flex items-center justify-center text-white text-base font-semibold opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <span className="bg-red-600 rounded-full px-3 py-1">✕</span>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MultiUpload
