import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Block } from 'framework7-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';
import api from '../../api/api';
import Layout from '../component/Layout';
import Back from '../component/Back';
import SelectPaginate from '../component/SelectPaginate'; 
import CustomCheckbox from '../component/CustomCheckBox'; 

const CreateMemo = () => {
    const navigate = useNavigate();
    const { role } = useAuth();
    const [loading, setLoading] = useState(false);

    // State untuk menampung Objek Pilihan dari SelectPaginate
    const [selectedJenis, setSelectedJenis] = useState(null);

    // State Form Data
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        jenis_memo_id: null, 
        // Tanggal otomatis diset hari ini (YYYY-MM-DD)
        tanggal: new Date().toISOString().split('T')[0], 
        is_public: 0 
    });

    // Handle Perubahan Input Teks Biasa
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle Perubahan Rich Text Editor
    const handleDescriptionChange = (value) => {
        setFormData(prev => ({ ...prev, description: value }));
    };

    // Handle Perubahan SelectPaginate
    const handleJenisChange = (selectedOption) => {
        setSelectedJenis(selectedOption);
        setFormData(prev => ({ 
            ...prev, 
            jenis_memo_id: selectedOption ? selectedOption.value : null 
        }));
    };

    // Submit Data
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi (Tanggal tidak perlu divalidasi manual karena sudah pasti terisi otomatis)
        if (!formData.name || !formData.jenis_memo_id || !formData.description) {
            Swal.fire({
                icon: 'warning',
                title: 'Data Belum Lengkap',
                text: 'Harap isi Judul, Jenis Memo, dan Deskripsi.',
            });
            return;
        }

        setLoading(true);
        try {
            await api.post('memo-create', formData);
            
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'Memo berhasil dibuat!',
                timer: 1500,
                showConfirmButton: false
            });
            
            navigate('/memo/list-memo'); 

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan memo.'
            });
        } finally {
            setLoading(false);
        }
    };

    const resetValue = () => {
        setFormData({
            name: '',
            description: '',
            jenis_memo_id: null,
            tanggal: new Date().toISOString().split('T')[0],
            is_public: 0
        });
        setSelectedJenis(null);
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
        <Layout title="Buat Memo Baru">
            <Block>
                <div className="xs:px-0 md:px-4">
                    <Back goHome={() => navigate(-1)} />
                    <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Create Memo</p>
                    <div className="p-7 bg-white shadow-lg shadow-gray-200 rounded-lg border border-gray-300">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Section 1: Meta Data (Jenis Memo & Public Checkbox) */}
                            {/* Input Tanggal sudah dihapus dari sini */}
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
                                        className="w-full text-lg px-2 py-3 focus:border-blue-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Section 3: Deskripsi (Rich Text Editor) */}
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2">
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
                                    disabled={loading} 
                                    type="submit" 
                                    className='py-2 px-4 w-full rounded-lg font-medium bg-blue-500 hover:bg-blue-600 transition-color duration-200 text-white disabled:bg-blue-300'
                                >
                                    {loading ? 'Submitting...' : 'Submit'}
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
                </div>
            </Block>
        </Layout>
    );
};

export default CreateMemo;