import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Block } from 'framework7-react';
import Swal from 'sweetalert2';

import api from '../../api/api';
import { useAuth } from '../../auth/AuthContext';
import { DecryptID } from '../../helper/EncryptHelper';
import DateFormat from '../../helper/DateFormatHelper';

import Layout from '../component/Layout';
import Back from '../component/Back';
import Transition from '../component/Transition';
import ModalPurchaseRequest from '../component/modal/ModalPurchaseRequest';

import ImagePreviewModal from '../component/modal/ImagePreviewModal';

function CreatePurchaseRequest() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { role } = useAuth();

    // === State ===
    const [item, setItem] = useState({});
    const [decryptedId, setDecryptedId] = useState('');
    const [loading, setLoading] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [kodeValue, setKodeValue] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [errors, setErrors] = useState({});

    const [openModal, setOpenModal] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [initialModalData, setInitialModalData] = useState({
        selectedBarang: null,
        qty: '',
    });

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');

    const apiUrl = import.meta.env.VITE_URL;

    // === Effects ===
    useEffect(() => {
        const decId = DecryptID(id);
        setDecryptedId(decId);
        if (!decId) navigate(-1);
    }, [id, navigate]);

    useEffect(() => {
        if (decryptedId) fetchItems();
    }, [decryptedId]);

    // === API ===
    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await api.get(`purchaseRequest-makeRequest/detail/${decryptedId}`);
            setItem(res.data?.data || res.data);
            console.log('Fetched tanggal:', res.data?.data?.tanggal);
        } catch (err) {
            console.error('Error fetching items:', err);
        } finally {
            setLoading(false);
            setTimeout(() => setContentVisible(true), 50);
        }
    };

    // === Validation Functions ===
    const validate = () => {
        const newErrors = {};
        if (!item.tanggal) newErrors.tanggal = 'Tanggal wajib diisi.';
        if (!item.note) newErrors.note = 'Kode Supplier wajib diisi.';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setItem(prevItem => ({ ...prevItem, [name]: value }));
        if (errors[name]) {
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[name];
                return newErrors;
            });
        }
        console.log('Updated tanggal:', value);
    };
    
    const handleSelectChange = (name, value) => {
        setItem(prevItem => ({ ...prevItem, [name]: value }));
        if (errors[name]) {
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[name];
                return newErrors;
            });
        }
    };
    

    // === Handlers ===
    const handleCreatePurchaseRequest = async () => {
        console.log('Submitting with tanggal:', item.tanggal);
        try {
            setSubmitting(true);

            await api.post(`/purchaseRequest-create/${decryptedId}`, {
                make_request_id: decryptedId,
                note: item.note,
                tanggal: item.tanggal,
                
            });

            Swal.fire({
                title: 'Purchase Request berhasil dibuat!',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });

            setTimeout(() => navigate('/make-purchase-request/list-make-purchase-request'), 1200);
        } catch (err) {
            console.error('Error creating purchase request:', err);
            Swal.fire({
                icon: 'error',
                title: 'Gagal membuat Purchase Request',
                text: err.response?.data?.message || 'Ada kesalahan dalam sistem',
            });
        } finally {
            setSubmitting(false);
        }
    };

        // ==============================
        // Image Preview
        // ==============================
        const handleClosePreview = () => {
            setIsPreviewOpen(false);
            setSelectedImageUrl('');
            };

        const handleImageClick = (imageUrl) => {
            setSelectedImageUrl(imageUrl);
            setIsPreviewOpen(true);
            };


    return (
        <Layout title="Create Purchase Request">
            <Block>
                <div className="px-4">
                    <Transition contentVisible={contentVisible}>
                        {/* === Header === */}
                        <div className="flex items-center justify-between mb-4">
                            <Back goHome={() => navigate('/make-purchase-request/list-make-purchase-request')} />
                        </div>
                            <p className="text-xl sm:text-2xl lg:text-3xl font-semibold capitalize">
                                Create Purchase Request
                            </p>

                        {/* === Main & Detail === */}
                        <div className="flex flex-col lg:flex-row gap-4 mt-3">
                            {/* Main Information */}
                            <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                                <p className="font-semibold text-gray-400 mb-2 text-xl">Make Request Information</p>
                                <p className="text-xl font-bold capitalize">{item.kode}</p>
                                <p className="text-lg mb-4">{DateFormat(item.tanggal, false)}</p>

                                <div className="space-y-3">
                                    <InfoRow label="Employee Name" value={item.user?.EmpName} />
                                    <InfoRow label="Employee Code" value={item.user?.EmpCode} />
                                    <InfoRow label="Employee Email" value={item.user?.email} />
                                    <InfoRow label="Type Request" value={item.type_request?.name} />
                                    <InfoRow label="Jenis Type Request" value={item.type_request?.jenis} />
                                </div>
                            </div>

                            {/* Detail */}
                            <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px] ">
                                <p className="font-semibold text-gray-400 mb-4 text-xl ">Detail</p>
                                {item.details?.length === 0 ? (
                                    <p className="text-gray-400 italic">No detail data</p>
                                ) : (
                                    <div className='overflow-x-auto'>
                                    <table className="w-full text-sm text-left min-w-[600px] ">
                                        <thead>
                                            <tr className="bg-gray-100 ">
                                                <th className="px-3 py-2 rounded-l-md">No</th>
                                                <th className="px-3 py-1">Barang</th>
                                                <th className="px-3 py-1 rounded-r-md">Qty</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {item.details?.map((d, i) => (
                                                <tr
                                                    key={d.id || i}
                                                    className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                                                >
                                                    <td className="px-4 py-4 rounded-l-md">{i + 1}</td>
                                                    <div className="flex items-center gap-3 px-4 py-4 rounded-l-md">
                                                        {d?.barang.image && (
                                                            <img
                                                            src={`${apiUrl}${d?.barang.image}`}
                                                            // alt={name}
                                                            className="max-w-[10rem] object-cover rounded shadow cursor-pointer"
                                                            onClick={() =>
                                                                handleImageClick(`${apiUrl}${d?.barang.image}`)
                                                            }
                                                            />
                                                            )}
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {d?.barang?.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Kode: {d?.barang.kode_barang}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Gudang: {d?.barang.kode_gudang}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <td className="px-4 py-4 rounded-r-md">{d.qty}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 mt-4 bg-white shadow-sm rounded-lg border">
                            <form onSubmit={handleCreatePurchaseRequest} className='space-y-5'>

                            <div className="mb-4">
                                    <div className="flex justify-between items-center">
                                        <label className='font-semibold'>Tanggal</label>
                                        {errors.tanggal && <span className="text-red-500 text-sm">{errors.tanggal}</span>}
                                    </div>
                                    <div className={`bg-white p-2 rounded-md border mt-2 ${errors.tanggal ? 'border-red-500' : 'border-gray-300'}`}>
                                    <input 
                                        type="date" 
                                        name="tanggal" 
                                        value={item.tanggal || ''} 
                                        onChange={handleChange}
                                        className="w-full p-2 placeholder:text-gray-400"
                                        placeholder="Tanggal"
                                    />

                                    </div>
                                </div>
                                <div className="mb-4">
                                    <div className="flex justify-between items-center">
                                        <label className='font-semibold'>note</label>
                                        {errors.note && <span className="text-red-500 text-sm">{errors.note}</span>}
                                    </div>
                                    <div className={`bg-white p-2 rounded-md border mt-2 ${errors.keterangan ? 'border-red-500' : 'border-gray-300'}`}>
                                    <textarea
                                        name="note" 
                                        value={item.note || ''} 
                                        onChange={handleChange}
                                        className="w-full min-h-fit p-2 placeholder:text-gray-400"
                                        maxLength={225}
                                        placeholder="Note"
                                        rows="3"
                                    />
                                    </div>
                                </div>
                            </form>
                        </div>
                        

                        {/* === Action Buttons === */}
                        <div className="flex justify-end mt-6 gap-3">
                            <button
                                onClick={handleCreatePurchaseRequest}
                                disabled={submitting}
                                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 
                                    text-white px-6 py-2 rounded-md font-medium"
                            >
                                {submitting ? 'Creating...' : 'Create Purchase Request'}
                            </button>
                        </div>
                    </Transition>
                </div>
            </Block>

            <ImagePreviewModal
            isOpen={isPreviewOpen}
            onClose={handleClosePreview}
            imageUrl={selectedImageUrl}
            />

            {/* === Modal === */}
            {openModal && (
                <ModalPurchaseRequest
                    open={openModal}
                    onClose={() => {
                        setOpenModal(false);
                        setEditIndex(null);
                    }}
                    onSave={data => {
                        if (editIndex !== null) {
                            setSelectedItems(
                                selectedItems.map((it, idx) => (idx === editIndex ? data : it))
                            );
                        } else {
                            setSelectedItems([...selectedItems, data]);
                        }
                        setOpenModal(false);
                        setEditIndex(null);
                    }}
                    initialData={initialModalData}
                    apiUrl={apiUrl}
                    existingItems={selectedItems}
                    maxItems={item.details?.length || 0}
                    makeRequestDetails={item.details || []}
                />
            )}
        </Layout>
    );
}


function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}

export default CreatePurchaseRequest;
