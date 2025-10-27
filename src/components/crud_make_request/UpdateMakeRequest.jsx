import React, { useEffect, useState } from 'react';
import { Block } from 'framework7-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import Back from '../component/Back';
import Layout from '../component/Layout';
import Swal from 'sweetalert2';
import { DecryptID } from '../../helper/EncryptHelper';
import Transition from '../component/Transition';
import { useAuth } from '../../auth/AuthContext';
import ModalMR from '../component/modal/ModalMR'; // Pastikan path ini benar
import ImagePreviewModal from '../component/modal/ImagePreviewModal';

function UpdateMakeRequest() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { role } = useAuth();
    const apiUrl = import.meta.env.VITE_URL;

    const [items, setItems] = useState({
        type_request: '', 
        tanggal: '',
    });
    
    // DIUBAH: State melacak tipe request ("ya", "tidak", "other", atau null)
    const [isStockRequest, setIsStockRequest] = useState(null);

    const [details, setDetails] = useState([]);
    const [decryptedId, setDecryptedId] = useState('');
    const [editIndex, setEditIndex] = useState(null);
    const [initialDetails, setInitialDetails] = useState(null);
    const [contentVisible, setContentVisible] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [isUnchanged, setIsUnchanged] = useState(true);
    
    const [originalItems, setOriginalItems] = useState(null);
    const [originalDetails, setOriginalDetails] = useState([]);

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');

    useEffect(() => {
        const decryptedIds = DecryptID(id);
        setDecryptedId(decryptedIds);
        if (!decryptedIds) {
            navigate(-1);
        }
    }, [id, navigate]);

    useEffect(() => {
        if (decryptedId) {
            fetchItem();
        }
    }, [decryptedId]);

    useEffect(() => {
        if (!originalItems || !originalDetails) return;

        const dateChanged = items.tanggal !== originalItems.tanggal;

        let detailsChanged = false;
        if (details.length !== originalDetails.length) {
            detailsChanged = true;
        } else {
            detailsChanged = details.some((detail, index) => {
                const orig = originalDetails[index];
                
                // DIUBAH: Logika perbandingan berdasarkan requestMode
                if (isStockRequest === 'ya' || isStockRequest === 'other') {
                    const oldId = orig.selectedBarang?.id || orig.invent_barang_id;
                    const newId = detail.selectedBarang?.id || detail.invent_barang_id;
                    return newId !== oldId || String(detail.qty) !== String(orig.qty);
                } else if (isStockRequest === 'tidak') {
                    return detail.note_barang !== orig.note_barang || String(detail.qty) !== String(orig.qty);
                }
                return false; // Fallback
            });
        }
        setIsUnchanged(!dateChanged && !detailsChanged);
    }, [items, details, originalItems, originalDetails, isStockRequest]);

    const fetchItem = async () => {
        try {
            const url = role === 'admin' ? `inventMakeRequest-admin/detail/${decryptedId}` : `inventMakeRequest-detail/${decryptedId}`;
            const response = await api.get(url);
            const data = response.data.data.makeRequest;
            
            // DIUBAH: Mengambil data is_stock ("ya", "tidak", "other")
            const requestMode = data.MR?.is_stok;
            setIsStockRequest(requestMode);

            const fetchedItems = {
                type_request: data.MR?.type_name,
                tanggal: data.MR?.tanggal
            };

            // DIUBAH: Menyesuaikan struktur detail berdasarkan requestMode
            const fetchedDetails = data.detailsMR.map(detail => {
                // Jika "ya" atau "other", kita buat objek selectedBarang
                if (requestMode === 'ya' || requestMode === 'other') {
                    const barangData = {
                        id: detail.invent_barang_id,
                        // Normalisasi nama, gambar, kode
                        name: detail.nameBarang || detail.name,
                        namaBarang: detail.nameBarang || detail.name,
                        image: detail.image || detail.gambarBarang,
                        gambarBarang: detail.image || detail.gambarBarang,
                        kode_barang: detail.kodeBarang || detail.kode_barang,
                        kodeBarang: detail.kodeBarang || detail.kode_barang,
                        // Gudang hanya ada di mode "ya" (stok)
                        kode_gudang: detail.kodeGudang
                    };
                    return { ...detail, selectedBarang: barangData };
                }
                // Jika "tidak", kembalikan apa adanya (sudah berisi note_barang)
                return detail;
            }) || [];
            
            setItems(fetchedItems);
            setDetails(fetchedDetails);
            setOriginalItems(fetchedItems);
            setOriginalDetails(fetchedDetails);

        } catch (error) {
            console.error("Failed to fetch item:", error);
        } finally { 
            setTimeout(() => setContentVisible(true), 50);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (disabled) return;
        setDisabled(true);

        try {
            if (details.length === 0) {
                Swal.fire({ icon: 'warning', title: 'Detail kosong', text: 'Tambahkan minimal satu detail barang.' });
                setDisabled(false);
                return;
            }

            // DIUBAH: Membuat payload secara dinamis
            const payload = {
                tanggal: items.tanggal,
                qty: details.map(item => item.qty),
            };

            if (isStockRequest === 'ya' || isStockRequest === 'other') {
                payload.invent_barang_id = details.map(item => item.selectedBarang?.id || item.invent_barang_id);
            } else if (isStockRequest === 'tidak') {
                payload.note_barang = details.map(item => item.note_barang);
            }

            await api.put(`inventMakeRequest-update/${decryptedId}`, payload);
            
            Swal.fire({ title: 'Make request berhasil diubah!', icon: 'success', timer: 2000, showConfirmButton: false });
            navigate('/material-request/list-material-request');

        } catch (error) {
            let errorMessage = 'Ada Kesalahan Dalam Sistem';
            if (error?.response?.data?.msg) {
                const msg = error.response.data.msg;
                if (typeof msg === 'string') {
                    errorMessage = msg;
                } else if (typeof msg === 'object') {
                    const messages = Object.values(msg).flat();
                    if (messages.length > 0) {
                        errorMessage = messages[0]; 
                    }
                }
            }
            Swal.fire({
                icon: 'error',
                title: 'Gagal mengubah make request',
                text: errorMessage,
            });
            resetValue()
        } finally {
            setDisabled(false);
        }
    };
    

    const handleSaveDetail = (data) => {
        if (editIndex !== null) {
            setDetails(details.map((item, idx) => idx === editIndex ? data : item));
        } else {
            setDetails([...details, data]);
        }
        setOpenModal(false);
        setEditIndex(null);
    };

    const resetValue = () => {
        if (originalItems && originalDetails) {
            setItems(originalItems);
            setDetails(originalDetails);
        }
    };

    const handleClosePreview = () => {
        setIsPreviewOpen(false);
        setSelectedImageUrl('');
    };

    const handleImageClick = (imageUrl) => {
        setSelectedImageUrl(imageUrl);
        setIsPreviewOpen(true);
    };

    return (
        <Layout title={'Update Make Request'}>
            <Block>
                <div className='xs:px-0 md:px-4'>
                    <Back goHome={() => navigate('/material-request/list-material-request')} />
                    <p className='lg:text-3xl text-2xl font-semibold capitalize my-4'>Update Make Request</p>
                    <Transition contentVisible={contentVisible}>
                        <div className="p-7 bg-white shadow-lg shadow-gray-200 rounded-lg border">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-5 space-y-2">
                                    <label className='font-semibold'>Jenis Permintaan</label>
                                    <div className='bg-gray-200 p-2 rounded-md border border-gray-300 mt-2'>
                                        <input type="text" value={items.type_request || ''} className="w-full p-2 bg-transparent" readOnly disabled />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className='font-semibold'>Tanggal</label>
                                    <div className='bg-white p-2 rounded-md border border-gray-300 mt-2'>
                                        <input type="date" value={items.tanggal || ''} onChange={e => setItems({ ...items, tanggal: e.target.value })} className="w-full p-2" required />
                                    </div>
                                </div>

                                {isStockRequest !== null && (
                                    <>
                                        <div className="mt-2 pt-3">
                                            <p className='text-lg font-semibold'>Detail</p>
                                        </div>
                                        <div className="space-y-3 my-3">
                                        {details.length === 0 ? (
                                            <p className="text-center py-2 text-gray-400">Belum ada data.</p>
                                        ) : (
                                            details.map((item, id) => (
                                                <div
                                                    key={id}
                                                    className="
                                                    border border-gray-300 rounded-xl p-3
                                                    grid grid-cols-[auto,1fr]
                                                    items-center gap-x-4
                                                    "
                                                >
                                                    {/* DIUBAH: Tampilkan gambar jika "ya" atau "other" */}
                                                    { (isStockRequest === 'ya' || isStockRequest === 'other') && 
                                                        <div className="overflow-hidden rounded-lg bg-gray-50 w-20 md:w-40 aspect-[4/3]">
                                                            {(item.selectedBarang?.gambarBarang || item.selectedBarang?.image) ? (
                                                                <img
                                                                    src={`${apiUrl}${item.selectedBarang.gambarBarang || item.selectedBarang.image}`}
                                                                    alt={item.selectedBarang.name || item.selectedBarang.namaBarang}
                                                                    className="w-full h-full object-cover cursor-pointer"
                                                                    onClick={() => handleImageClick(`${apiUrl}${item.selectedBarang.gambarBarang || item.selectedBarang.image}`)}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                                                    No Image
                                                                </div>
                                                            )}
                                                        </div>
                                                    }

                                                    {/* DIUBAH: Terapkan col-span jika "tidak" */}
                                                    <div className={`flex items-center w-full ${isStockRequest === 'tidak' ? 'col-span-2' : ''}`}>
        
                                                        {/* Item Details Section */}
                                                        <div>
                                                            {/* DIUBAH: Tampilkan nama barang jika "ya" atau "other" */}
                                                            {(isStockRequest === 'ya' || isStockRequest === 'other') ? (
                                                                <div className="font-semibold text-gray-800">
                                                                    {item.selectedBarang?.name || item.selectedBarang?.namaBarang}
                                                                </div>
                                                            ) : (
                                                                // Tampilkan note jika "tidak"
                                                                <div className="font-semibold text-gray-800">
                                                                    {item.note_barang}
                                                                </div>
                                                            )}
                                                            {/* DIUBAH: Tampilkan kode jika "ya" atau "other" */}
                                                            {(isStockRequest === 'ya' || isStockRequest === 'other') && (
                                                                <div className="font-normal text-sm text-gray-400">
                                                                    Kode: {item.selectedBarang?.kode_barang || item.selectedBarang?.kodeBarang}
                                                                </div>
                                                            )}
                                                            <div className="font-medium mt-1">
                                                                <span className="font-normal text-sm text-gray-400">Qty: </span>
                                                                {item.qty}
                                                            </div>
                                                        </div>

                                                        {/* Buttons Section */}
                                                        <div className="flex items-center gap-4 ml-auto pl-3">
                                                            <button type="button" onClick={() => { setInitialDetails(item); setEditIndex(id); setOpenModal(true); }}>
                                                                <i className='bx bx-edit text-xl text-cyan-600'></i>
                                                            </button>
                                                            <button type="button" onClick={() => setDetails(details.filter((_, i) => i !== id))}>
                                                                <i className='bx bx-trash text-xl text-red-500'></i>
                                                            </button>
                                                        </div>

                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                        <div className="flex mt-4">
                                            <button type="button" className="w-full rounded-lg py-2 px-4 flex items-center font-medium bg-blue-50 text-blue-600 hover:bg-blue-100" onClick={() => { setOpenModal(true); setEditIndex(null); setInitialDetails(null); }}>
                                                <i className='bx bx-plus mr-2 font-semibold text-base'></i>
                                                <span>{details.length === 0 ? 'Tambah detail' : 'Tambah detail lain'}</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                                <div className="flex flex-col items-center justify-self-center mt-10 max-w-full w-[25rem] space-y-2 text-center">
                                    <button disabled={disabled || isUnchanged} type='submit' className='py-2 px-4 w-full rounded-lg font-medium bg-blue-500 hover:bg-blue-600 transition-color duration-200 text-white disabled:bg-blue-300'>Update</button>
                                    <button className='py-2 px-6 mt-2 rounded-lg font-medium border border-red-200 bg-red-50 hover:bg-red-100 text-red-600' onClick={resetValue} type='button'>Reset</button>
                                </div>
                            </form>
                        </div>
                        {openModal && (
                            // DIUBAH: Menggunakan prop 'requestMode'
                            <ModalMR
                                open={openModal}
                                onClose={() => { setOpenModal(false); setEditIndex(null); }}
                                onSave={handleSaveDetail}
                                initialData={initialDetails}
                                requestMode={isStockRequest} // Ganti dari isStock
                                apiUrl={apiUrl}
                            />
                        )}
                    </Transition>
                </div>
            </Block>
            <ImagePreviewModal
            isOpen={isPreviewOpen}
            onClose={handleClosePreview}
            imageUrl={selectedImageUrl}
            />
        </Layout>
    );
}

export default UpdateMakeRequest;