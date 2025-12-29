import React, { useEffect, useState,  useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Block } from 'framework7-react';
import ReactQuill, { Quill } from 'react-quill'; // Pastikan import Quill dari sini
import '../../js/quillconfig'
import 'quill-image-uploader/dist/quill.imageUploader.min.css';
import 'react-quill/dist/quill.snow.css'; 
import Swal from 'sweetalert2';
import api from '../../api/api';
import Layout from '../component/Layout';
import Back from '../component/Back';
import SelectPaginate from '../component/SelectPaginate'; 
import DatePicker from '../component/DatePicker'; 
import CustomCheckbox from '../component/CustomCheckBox'; 
import Loader from '../component/Loader';
import { DecryptID } from '../../helper/EncryptHelper';
import useAuth from '../../hooks/useAuth';
import Transition from '../component/Transition';


const UpdateMemo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { role } = useAuth();
    
    const quillRef = useRef(null);

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
        tanggal: '', 
        expired: '', 
        is_public: 0 
    });

    const [originalData, setOriginalData] = useState(null);

    useEffect(() => {
        const decoded = DecryptID(id);
        setDecryptedId(decoded);
        if (!decoded) {
            navigate(-1);
        }
    }, [id, navigate]);

    // Fetch Data
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

            const initialData = {
                name: data.name || '',
                description: data.description || '',
                jenis_memo_id: data.jenis_memo_id,
                tanggal: data.tanggal || '',
                expired: data.expired || '', 
                is_public: data.is_public ? 1 : 0
            };

            setFormData(initialData);
            setOriginalData({ ...initialData, jenis_memo_obj: data.jenis_memo });

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
            await api.put(`memo-update/${decryptedId}`, formData);
            
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
                expired: originalData.expired,
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

    // --- 4. UPDATE MODULES (Ganti imageResize ke blotFormatter) ---
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
                        const imageUrl = res.data.url || res.data.data; 
                        resolve(imageUrl); 
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
        // Blot Formatter Setting
        blotFormatter: {
            overlay: {
                style: {
                    border: '2px solid #0088cc',
                }
            }
        },
    }), []); 

    // --- 5. UPDATE FORMATS WHITELIST (Tambah 'alt') ---
    const formats = [
        'header', 'font',
        'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
        'list', 'bullet', 'indent',
        'link', 'image', 'video', 'color', 'background', 'align', 'script',
        'width', 'height', 'style', 'alt' // Penting!
    ];

    return (
        <Layout title="Update Memo">
            <Block>
                <div className="xs:px-0 md:px-4">
                    <Back goHome={() => navigate('/memo/list-memo')} />
                    <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Update Memo</p>
                    
                    {loading ? (
                        <Loader Class="mt-20" text="Memuat data..." />
                    ) : (
                        <Transition contentVisible={contentVisible}>
                            <div className="p-7 bg-white shadow-lg shadow-gray-200 rounded-lg border border-gray-300">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 mb-2 ">
                                                Tanggal
                                            </label>
                                            <DatePicker
                                                value={formData.tanggal}
                                                onChange={(val) => setFormData(prev => ({ ...prev, tanggal: val }))}
                                                placeholder="Pilih tanggal..."
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 mb-2 ">
                                                Tanggal Expired
                                            </label>
                                            <DatePicker
                                                value={formData.expired}
                                                onChange={(val) => setFormData(prev => ({ ...prev, expired: val }))}
                                                placeholder="Pilih tanggal expired..."
                                            />
                                        </div>
                                    </div>

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

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 mb-2">
                                            Title
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

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 mb-2 ">
                                            Konten
                                        </label>
                                        <div className="bg-white">
                                            <ReactQuill 
                                                ref={quillRef}
                                                theme="snow"
                                                value={formData.description}
                                                onChange={handleDescriptionChange}
                                                modules={modules}
                                                formats={formats}
                                                className="[&_.ql-editor]:min-h-fit mb-10"
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