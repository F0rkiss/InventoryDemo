import React, { useState, useRef, useMemo } from 'react'; // Import useRef & useMemo
import { useNavigate } from 'react-router-dom';
import { Block } from 'framework7-react';
import ReactQuill, { Quill } from 'react-quill';
import ImageResize from 'quill-image-resize-module-react';
import ImageUploader from 'quill-image-uploader';
import 'react-quill/dist/quill.snow.css'; 
import 'quill-image-uploader/dist/quill.imageUploader.min.css';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';
import api from '../../api/api';
import Layout from '../component/Layout';
import Back from '../component/Back';
import SelectPaginate from '../component/SelectPaginate'; 
import CustomCheckbox from '../component/CustomCheckBox';
import DatePicker from '../component/DatePicker'; 

Quill.register('modules/imageResize', ImageResize);
Quill.register('modules/imageUploader', ImageUploader);

const CreateMemo = () => {
    const navigate = useNavigate();
    const { role } = useAuth();
    const [loading, setLoading] = useState(false);
    
    // 1. Buat Ref untuk mengakses instance editor Quill
    const quillRef = useRef(null);

    const [selectedJenis, setSelectedJenis] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        jenis_memo_id: null, 
        tanggal: new Date().toISOString().split('T')[0], 
        expired: '', 
        is_public: 0 
    });

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

    const resetValue = () => {
        setFormData({
            name: '',
            description: '',
            jenis_memo_id: null,
            tanggal: new Date().toISOString().split('T')[0],
            expired: '',
            is_public: 0
        });
        setSelectedJenis(null);
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

    // 3. Gunakan useMemo untuk modules agar tidak re-render loop
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'align': [] }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                ['link', 'image', 'video'],
                ['clean']
            ],
        },
        imageUploader: {
            upload: (file) => {
                return new Promise((resolve, reject) => {
                    const formDataImg = new FormData();
                    formDataImg.append("image", file);

                    api.post('/cms-upload', formDataImg, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    })
                    .then((res) => {
                        // Ambil URL dari response API kamu
                        // Pastikan path ini sesuai dengan response backendmu (misal: res.data.url)
                        const imageUrl = res.data.url || res.data.data; 
                        resolve(imageUrl); // Quill akan memasukkan URL ini ke editor
                    })
                    .catch((error) => {
                        console.error("Upload failed", error);
                        reject("Upload failed");
                        Swal.fire({
                            icon: 'error',
                            title: 'Gagal Upload',
                            text: 'Gagal mengupload gambar ke server.'
                        });
                    });
                });
            }
        },
        imageResize: {
            parchment: Quill.import('parchment'),
            modules: ['Resize', 'DisplaySize', 'Toolbar'] 
        }
    }), []); // Dependencies array kosong

    const formats = [
        'header', 'font',
        'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
        'list', 'bullet', 'indent',
        'link', 'image', 'video', 'color', 'background', 'align', 'script'
    ];

    return (
        <Layout title="Buat Memo Baru">
            <Block>
                <div className="xs:px-0 md:px-4">
                    <Back goHome={() => navigate('/memo/list-memo')} />
                    <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Create Memo</p>
                    <div className="p-7 bg-white shadow-lg shadow-gray-200 rounded-lg border border-gray-300">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 ">Tanggal</label>
                                    <DatePicker
                                        value={formData.tanggal}
                                        onChange={(val) => setFormData(prev => ({ ...prev, tanggal: val }))}
                                        placeholder="Pilih tanggal..."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 ">Tanggal Expired</label>
                                    <DatePicker
                                        value={formData.expired}
                                        onChange={(val) => setFormData(prev => ({ ...prev, expired: val }))}
                                        placeholder="Pilih tanggal expired..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 mb-2">Jenis Memo</label>
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

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 mb-2 ">Nama</label>
                                <div className="bg-white border border-gray-300 rounded-lg p-3">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Masukkan judul memo disini..."
                                        className="w-full text-lg border-b-2 border-gray-300 px-2 py-3 focus:border-blue-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 ">Memo</label>
                                <div className="bg-white mt-2">
                                    {/* 4. Pasang Ref ke komponen ReactQuill */}
                                    <ReactQuill 
                                        ref={quillRef}
                                        theme="snow"
                                        value={formData.description}
                                        onChange={handleDescriptionChange}
                                        modules={modules}
                                        formats={formats} 
                                        className="[&_.ql-editor]:min-h-[300px] mb-10"
                                        placeholder="Tulis isi memo lengkap disini ..."
                                    />
                                </div>
                            </div>  
                            
                            <div className="pt-1">
                                <CustomCheckbox 
                                    label="Memo Publik"
                                    checked={formData.is_public === 1}
                                    onChange={(val) => setFormData(prev => ({ ...prev, is_public: val ? 1 : 0 }))}
                                />
                                <p className="text-xs text-gray-400 mt-1 ml-9">Centang jika memo ini dapat dilihat oleh semua user</p>
                            </div>

                            <div className="flex flex-col items-center justify-self-center mt-10 max-w-full w-[25rem] space-y-2 text-center">
                                <button 
                                    disabled={loading} type="submit" 
                                    className='py-2 px-4 w-full rounded-lg font-medium bg-blue-500 hover:bg-blue-600 transition-color duration-200 text-white disabled:bg-blue-300'
                                >
                                    {loading ? 'Submitting...' : 'Submit'}
                                </button>
                                <button 
                                    className='py-2 px-4 w-full rounded-lg font-medium border border-red-200 bg-red-50 hover:bg-red-100 transition-color duration-200 text-red-600' 
                                    onClick={resetValue} type="button"
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