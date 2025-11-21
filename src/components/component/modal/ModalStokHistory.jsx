import React, { useState, useEffect } from 'react';
import api from '../../../api/api'; // Sesuaikan path jika perlu
import Swal from 'sweetalert2';
import SelectPaginate from '../SelectPaginate'; // Sesuaikan path jika perlu
import Loader from '../Loader'; // Sesuaikan path jika perlu
import { DecryptID } from '../../../helper/EncryptHelper';

const ModalWrapper = ({ open, onClose, title, children, footer }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-80 max-h-[70vh] md:max-w-2xl md:max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center py-4 px-5 border-b">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl w-fit">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                    {children}
                </div>
                <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                    {footer}
                </div>
            </div>
        </div>
    );
};

function ModalStokHistory({ open, onClose, stokId, historyData, onHistoryActionSuccess }) {
    // historyData akan berisi object histori jika sedang edit, atau null jika sedang create
    const isEditMode = !!historyData;
    const initialItems = {
        status: null,
        user: null,
        note: '',
        lokasi: '',
        image: null,
    };

    const [items, setItems] = useState(initialItems);
    const [preview, setPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const apiUrl = import.meta.env.VITE_URL; // Untuk menampilkan gambar yang sudah ada

    // console.log(historyData.status);
    console.log(historyData)
    // Effect untuk mengisi form jika dalam mode edit atau mereset jika modal dibuka/ditutup
    useEffect(() => {
        if (open) {
            if (isEditMode) {
                // Isi form dengan data histori yang ada
                setItems({
                    status: historyData.status ? { value: historyData.invent_status_id, label: historyData.status } : null,
                    user: historyData.user_id ? { value: historyData.user_id, label: historyData.EmpName } : null,
                    note: historyData.note || '',
                    lokasi: historyData.lokasi || '',
                    image: historyData.image || null, // Jika ada gambar lama, simpan string path-nya
                });
                setPreview(historyData.image ? `${apiUrl}/${historyData.image}` : null);
            } else {
                // Reset form untuk mode create
                setItems(initialItems);
                setPreview(null);
            }
            setErrors({}); // Pastikan error direset
        }
    }, [open, isEditMode, historyData, apiUrl]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setItems(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSelectChange = (name, value) => {
        setItems(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setItems(prev => ({ ...prev, image: file })); // Simpan object File baru
            setPreview(URL.createObjectURL(file));
            if (errors.image) {
                setErrors(prev => ({ ...prev, image: null }));
            }
        }
    };

    const deleteImage = () => {
        setItems(prev => ({ ...prev, image: 'DELETE_IMAGE_FLAG' })); // Gunakan flag untuk menandai hapus gambar
        setPreview(null);
    };

    const validate = () => {
        const newErrors = {};
        if (!items.status) newErrors.status = 'Status wajib dipilih.';
        if (!items.user) newErrors.user = 'User wajib dipilih.';
        if (!items.lokasi) newErrors.lokasi = 'Lokasi wajib diisi.';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            Swal.fire({ icon:'warning', title:'Form Tidak Lengkap', text:'Harap isi semua field yang wajib diisi.' });
            return;
        }

        try {
            if (isSubmitting) return;
            setIsSubmitting(true);

            const fd = new FormData();
            
            fd.append('invent_status_id', items.status.value);
            fd.append('user_id', items.user.value);
            fd.append('lokasi', items.lokasi);
            fd.append('note', items.note);

            if (items.image instanceof File) {
                fd.append('image', items.image);
            } else if (items.image === 'DELETE_IMAGE_FLAG') {
                fd.append('image', ''); // Kirim string kosong atau null untuk hapus gambar
            }
            // Jika items.image adalah string (path gambar lama) dan tidak ada perubahan,
            // maka tidak perlu append 'image' ke FormData, backend akan mempertahankan yang lama.

            let response;
            if (isEditMode) {
                // Untuk PUT request dengan FormData dan PHP, perlu method _method
                fd.append('_method', 'PUT'); 
                response = await api.post(`inventHistory-update/${historyData.id}`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                fd.append('invent_stoks_id', stokId); // Hanya untuk create
                response = await api.post(`inventHistory-create/${stokId}`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            Swal.fire({
                title: `Histori berhasil di${isEditMode ? 'ubah' : 'tambah'}!`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            onHistoryActionSuccess(); // Panggil fungsi refresh di parent
            
        } catch (err) {
            Swal.fire({ 
                icon: 'error',
                title: `Gagal ${isEditMode ? 'Mengubah' : 'Menambah'} Histori`,
                text: err?.response?.data?.message || 'Kesalahan pada sistem' // Biasanya message, bukan msg
            });
            console.error('Submit error:', err?.response?.data || err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const modalTitle = isEditMode ? 'Edit Histori' : 'Tambah Histori Baru';

    return (
        <ModalWrapper
            open={open}
            onClose={onClose}
            title={modalTitle}
            footer={
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="py-2 px-4 rounded-lg font-medium border border-gray-300 bg-white hover:bg-gray-100 transition-color duration-200 text-gray-700"
                    >
                        Batal
                    </button>
                    <button
                        disabled={isSubmitting}
                        type="button"
                        onClick={handleSubmit}
                        className="py-2 px-4 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 transition-color duration-200 text-white disabled:bg-blue-200"
                    >
                        {isSubmitting ? 'Mengirim..' : 'Simpan'}
                    </button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Status */}
                <div>
                    <label className='font-semibold'>Status</label>
                    {errors.status && <span className="text-red-500 text-sm ml-2">{errors.status}</span>}
                    <div className={`rounded-md mt-1 ${errors.status ? 'border border-red-500' : ''}`}>
                        <SelectPaginate 
                            source={'inventStatus'} 
                            selectValue={items.status}
                            itemLabel={['name']}
                            handleSelectChange={(value) => handleSelectChange('status', value)}
                            placeholder="Pilih status barang saat ini"
                            required
                        />
                    </div>
                </div>

                {/* User */}
                <div>
                    <label className='font-semibold'>User</label>
                    {errors.user && <span className="text-red-500 text-sm ml-2">{errors.user}</span>}
                    <div className={`rounded-md mt-1 ${errors.user ? 'border border-red-500' : ''}`}>
                        <SelectPaginate 
                            source={'inventUser'} 
                            selectValue={items.user} 
                            itemLabel={['EmpName']}
                            handleSelectChange={(value) => handleSelectChange('user', value)}
                            placeholder="Pilih user atau ketik berdasarkan nama"
                            required
                        />
                    </div>
                </div>

                {/* Lokasi */}
                <div>
                    <label className='font-semibold'>Lokasi</label>
                    {errors.lokasi && <span className="text-red-500 text-sm ml-2">{errors.lokasi}</span>}
                    <div className={`bg-white p-3 rounded-md border mt-1 ${errors.lokasi ? 'border-red-500' : 'border-gray-300'}`}>
                        <input
                            type="text"
                            name="lokasi"
                            value={items.lokasi}
                            onChange={handleChange}
                            className="w-full focus:outline-none placeholder:text-gray-400"
                            placeholder="Masukkan lokasi"
                        />
                    </div>
                </div>

                {/* Note */}
                <div>
                    <label className='font-semibold'>Note</label>
                    <div className="bg-white p-3 rounded-md border border-gray-300 mt-1">
                        <textarea
                            rows="3"
                            name="note"
                            value={items.note}
                            onChange={handleChange}
                            className="w-full focus:outline-none placeholder:text-gray-400 resize-none"
                            maxLength={255}
                            placeholder="Tambahkan catatan..."
                        />
                    </div>
                </div>

                {/* Image */}
                <div>
                    <label className='font-semibold'>Gambar</label>
                    <p className="text-xs text-gray-400">Tambahkan bukti foto</p>
                    <div className="mt-2 flex items-center gap-4">
                        <div className="w-32 h-32 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50 overflow-hidden">
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sm text-gray-400">Preview</span>
                            )}
                        </div>
                        <div className="grid space-y-2">
                            <input 
                                type="file" 
                                id="file-upload" 
                                className="hidden" 
                                onChange={handleImageChange}
                                accept="image/png, image/jpeg" 
                            />
                            <label htmlFor="file-upload" className="cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-medium py-2 px-3 rounded-md w-fit">
                                Pilih Gambar
                            </label>
                            {(preview || (historyData && historyData.image)) && ( // Tampilkan tombol hapus jika ada preview atau gambar lama
                                <button type="button" onClick={deleteImage} className="text-red-500 hover:text-red-700 text-sm font-medium">
                                    Hapus
                                </button>
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Format: .jpg, .png</p>
                    {errors.image && <span className="text-red-500 text-sm">{errors.image}</span>}
                </div>
            </form>
        </ModalWrapper>
    );
}

export default ModalStokHistory;