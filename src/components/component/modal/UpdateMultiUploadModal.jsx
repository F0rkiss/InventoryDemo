import React, { useEffect, useState } from 'react'
import Loader from '../../component/Loader'
import Swal from 'sweetalert2'
import api from '../../../api/api'

function UpdateMultiUploadModal({ open = false, initialBukti = [], lpbId, onClose, onDone }) {
    const [localBukti, setLocalBukti] = useState([])
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (open) {
            setLocalBukti(initialBukti || [])
        }
    }, [open, initialBukti])

    const handleFileSelection = (e) => {
        const newFiles = Array.from(e.target.files || [])
        const validFiles = newFiles.filter(file => file.size <= 5 * 1024 * 1024)
        if (validFiles.length !== newFiles.length) {
            // optional: toast/Swal can be handled by parent if needed
        }
        setLocalBukti(prev => ([...prev, ...validFiles]))
    }

    const handleDelete = (index) => {
        setLocalBukti(prev => prev.filter((_, i) => i !== index))
    }

    const uploadNewFiles = async (files) => {
        if (!files.length) return
        const formData = new FormData()
        files.forEach((file, i) => {
            formData.append(`bukti[${i}]`, file)
        })
        await api.post(`laporanPenerimaanBarang/uploadBukti/${lpbId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    }

    const deleteRemovedFiles = async (removedUrls) => {
        for (const url of removedUrls) {
            try {
                const parts = (url || '').split('/')
                const imageName = parts[parts.length - 1]
                await api.delete(`laporanPenerimaanBarang/${lpbId}/deleteBukti/${imageName}`)
            } catch (e) {
                // continue deletions even if one fails
            }
        }
    }

    const handleSubmit = async () => {
        if (submitting) return
        try {
            setSubmitting(true)
            const originalUrls = (initialBukti || []).filter(b => typeof b === 'string')
            const currentUrls = (localBukti || []).filter(b => typeof b === 'string')
            const removed = originalUrls.filter(u => !currentUrls.includes(u))
            const newFiles = (localBukti || []).filter(b => b instanceof File)

            await deleteRemovedFiles(removed)
            await uploadNewFiles(newFiles)

            Swal.fire({ icon: 'success', title: 'Gambar berhasil diperbarui', timer: 1500, showConfirmButton: false })
            onClose && onClose()
            onDone && onDone()
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Gagal memperbarui gambar', text: err?.response?.data?.msg || 'Kesalahan pada sistem' })
        } finally {
            setSubmitting(false)
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white w-full max-w-3xl mx-4 rounded-lg shadow-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">Kelola Gambar</h3>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <i className="bx bx-x text-2xl"></i>
                    </button>
                </div>

                <div className="mb-4">
                    <label htmlFor="modal-img-input">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-blue-600 transition">
                            <i className="bx bx-upload text-lg"></i>
                            Pilih Gambar
                        </div>
                    </label>
                    <input
                        type="file"
                        id="modal-img-input"
                        name="img"
                        multiple
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFileSelection}
                        className="hidden"
                    />
                </div>

                {localBukti?.length > 0 && (
                    <div className="rounded-md border border-dashed border-gray-300 p-3 mb-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {localBukti.map((file, index) => {
                                const imageUrl = file instanceof File ? URL.createObjectURL(file) : file
                                return (
                                    <div key={index} className="relative group rounded-md overflow-hidden border border-gray-200 shadow-sm">
                                        <img
                                            src={imageUrl}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-28 object-cover transition duration-200 group-hover:blur-sm"
                                        />
                                        {
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(index)}
                                                className="absolute inset-0 flex items-center justify-center text-white text-base font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <span className="bg-red-600 rounded-full px-3 py-1">✕</span>
                                            </button>
                                        }
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
                        disabled={submitting}
                        className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300"
                    >
                        Kirim
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UpdateMultiUploadModal


