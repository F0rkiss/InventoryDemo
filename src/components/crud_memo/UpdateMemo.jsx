import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Block } from 'framework7-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 
import Swal from 'sweetalert2';

import api from '../../api/api';
import Layout from '../component/Layout';
import Back from '../component/Back';
import SelectPaginate from '../component/SelectPaginate'; 
// import DatePicker from '../component/DatePicker'; // Sudah tidak dipakai
import CustomCheckbox from '../component/CustomCheckBox'; 
import Loader from '../component/Loader';
import { DecryptID } from '../../helper/EncryptHelper';
import useAuth from '../../hooks/useAuth';
import Transition from '../component/Transition';

const UpdateMemo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { role } = useAuth();
    
    // State Logic
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false); 
    const [contentVisible, setContentVisible] = useState(false);
    const [decryptedId, setDecryptedId] = useState('');

    // State untuk SelectPaginate
    const [selectedJenis, setSelectedJenis] = useState(null);

    // State Form Data
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        jenis_memo_id: null, 
        tanggal: '', // Akan terisi data lama, tapi tidak ditampilkan inputnya
        is_public: 0 
    });

    // 1. Decrypt ID
    useEffect(() => {
        const decoded = DecryptID(id);
        setDecryptedId(decoded);
        if (!decoded) {
            navigate(-1);
        }
    }, [id, navigate]);

    // 2. Fetch Data
    useEffect(() => {
        if (decryptedId) {
            fetchMemoData();
        }
    }, [decryptedId]);

    const fetchMemoData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`memo-detail/personal/${decryptedId}`);
            const data = response.data.data;

            setFormData({
                name: data.name || '',
                description: data.description || '',
                jenis_memo_id: data.jenis_memo_id,
                tanggal: data.tanggal, 
                is_public: data.is_public ? 1 : 0
            });

            if (data.jenis_memo) {
                setSelectedJenis({
                    value: data.jenis_memo.id,
                    label: data.jenis_memo.name
                });
            }

        } catch (error) {
            console.error("Error fetching memo:", error);
            Swal.fire({
                icon: 'error',
                title: 'Gagal Memuat Data',
                text: 'Data memo tidak ditemukan atau terjadi kesalahan.'
            });
            navigate(-1);
        } finally {
            setLoading(false);
            setTimeout(() => setContentVisible(true), 50);
        }
    };

    // --- HANDLERS ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDescriptionChange = (value) => {
        setFormData(prev => ({ ...prev, description: value }));
    };

    const handleJenisChange = (selectedOption) => {
        setSelectedJenis(selectedOption);
        setFormData(prev => ({ 
            ...prev, 
            jenis_memo_id: selectedOption ? selectedOption.value : null 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.jenis_memo_id || !formData.description) {
            Swal.fire({
                icon: 'warning',
                title: 'Data Belum Lengkap',
                text: 'Harap isi Judul, Jenis Memo, dan Deskripsi.',
            });
            return;
        }

        setSubmitting(true);
        try {
            await api.post(`memo-update/${decryptedId}`, formData);
            
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'Memo berhasil diperbarui!',
                timer: 1500,
                showConfirmButton: false
            });
            
            navigate('/memo/list-memo'); 

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Gagal Update',
                text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan perubahan.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const resetValue = () => {
        if(originalData) {
            setFormData({
                name: originalData.name,
                description: originalData.description,
                jenis_memo_id: originalData.jenis_memo_id,
                tanggal: originalData.tanggal,
                is_public: originalData.is_public
            });

            if (originalData.jenis_memo_obj) {
                setSelectedJenis({
                    value: originalData.jenis_memo_obj.id,
                    label: originalData.jenis_memo_obj.name
                });
            } else {
                 setSelectedJenis(null);
            }
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['link', 'clean']
        ],
    };

    return (
        <Layout title="Update Memo">
            <Block>
                <div className="xs:px-0 md:px-4">
                    <Back goHome={() => navigate('/memo/list-memo-personal')} />
                    <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Update Memo</p>
                    
                    {loading ? (
                        <Loader Class="mt-20" text="Memuat data..." />
                    ) : (
                        <Transition contentVisible={contentVisible}>
                            <div className="p-7 bg-white shadow-lg shadow-gray-200 rounded-lg border border-gray-300">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    
                                    {/* Section 1: Meta Data (Jenis Memo & Public Checkbox) */}
                                    {/* Input Tanggal dihapus dari sini */}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 mb-2">
                                                Jenis Memo
                                            </label>
                                            <SelectPaginate
                                                source={role === 'admin' ? 'jenisMemo' : 'jenisMemo-user'}
                                                handleSelectChange={handleJenisChange}
                                                selectValue={selectedJenis}
                                                selectName="Jenis Memo" 
                                                itemLabel={['name']}
                                                placeholder="Pilih jenis memo..."
                                                isClearable={true}
                                            />
                                        </div>
                                        
                                        
                                    </div>

                                    {/* Section 2: Judul Memo */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 mb-2">
                                            Judul
                                        </label>
                                        <div className="bg-white border border-gray-300 rounded-md p-3">
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Masukkan judul memo disini..."
                                                className="w-full text-lg border-b-2 border-gray-200 px-2 py-3 focus:border-blue-500 outline-none transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Section 3: Deskripsi (Rich Text Editor) */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 mb-2 ">
                                            Deskripsi
                                        </label>
                                        <div className="bg-white">
                                            <ReactQuill 
                                                theme="snow"
                                                value={formData.description}
                                                onChange={handleDescriptionChange}
                                                modules={modules}
                                                className="h-64 mb-12"
                                                placeholder="Tulis isi memo lengkap disini..."
                                            />
                                        </div>
                                    </div>
                                    {/* Checkbox Is Public */}
                                    <div className="pt-1">
                                        <CustomCheckbox 
                                            label="Memo Publik"
                                            checked={formData.is_public === 1}
                                            onChange={(val) => setFormData(prev => ({ ...prev, is_public: val ? 1 : 0 }))}
                                        />
                                        <p className="text-xs text-gray-400 mt-1 ml-9">
                                            Centang jika memo ini dapat dilihat oleh semua user
                                        </p>
                                    </div>

                                    {/* Tombol Action */}
                                    <div className="flex flex-col items-center justify-self-center mt-10 max-w-full w-[25rem] space-y-2 text-center">
                                        <button 
                                            disabled={submitting} 
                                            type="submit" 
                                            className='py-2 px-4 w-full rounded-lg font-medium bg-blue-500 hover:bg-blue-600 transition-color duration-200 text-white disabled:bg-blue-300'
                                        >
                                            {submitting ? 'Updating...' : 'Update'}
                                        </button>
                                        <button 
                                            className='py-2 px-4 w-full rounded-lg font-medium border border-red-200 bg-red-50 hover:bg-red-100 transition-color duration-200 text-red-600' 
                                            onClick={resetValue} 
                                            type="button"
                                        >
                                            Reset
                                        </button>
                                    </div>

                                </form>
                            </div>
                        </Transition>
                    )}
                </div>
            </Block>
        </Layout>
    );
};

export default UpdateMemo;