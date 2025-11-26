import React, { useEffect, useState } from 'react'
import Loader from '../../component/Loader'

function CreateMultiUploadModal({ open = false, initialFiles = [], onClose, onSave }) {
    const [localFiles, setLocalFiles] = useState([])

    useEffect(() => {
        if (open) {
            setLocalFiles(initialFiles || [])
        }
    }, [open, initialFiles])

    const handleFileSelection = (e) => {
        const newFiles = Array.from(e.target.files || [])
        const validFiles = newFiles.filter(file => file.size <= 5 * 1024 * 1024)
        setLocalFiles(prev => ([...prev, ...validFiles]))
    }

    const handleDelete = (index) => {
        setLocalFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = () => {
        onSave && onSave(localFiles)
        onClose && onClose()
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white w-full max-w-2xl rounded-lg shadow-lg border p-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-2xl font-semibold ">Kelola Gambar</h3>
                    <div className="text-gray-500 hover:text-gray-700 cursor-pointer">
                        <i className="bx bx-x text-3xl" onClick={onClose}></i>
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="create-modal-img-input">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-blue-600 transition">
                            <i className="bx bx-upload text-lg"></i>
                            Pilih Gambar
                        </div>
                    </label>
                    <input
                        type="file"
                        id="create-modal-img-input"
                        name="img"
                        multiple
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFileSelection}
                        className="hidden"
                    />
                </div>

                {localFiles?.length > 0 && (
                    <div className="rounded-md border border-dashed border-gray-300 p-3 mb-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {localFiles.map((file, index) => {
                                const imageUrl = file instanceof File ? URL.createObjectURL(file) : file
                                return (
                                    <div key={index} className="relative group rounded-md overflow-hidden border border-gray-200 shadow-sm">
                                        <img
                                            src={imageUrl}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-28 object-cover transition duration-200 group-hover:blur-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(index)}
                                            className="absolute inset-0 flex items-center justify-center text-white text-base font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <span className="bg-red-600 rounded-full px-3 py-1">✕</span>
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50">Batal</button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                    >
                        Simpan
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CreateMultiUploadModal


