import React, { useEffect, useState } from 'react';
import MiModal from '../MiModal';
import api from '../../../api/api';
import Swal from 'sweetalert2';
import Loader from '../Loader';

const ModalPurchaseOrder = ({ onClose, onSave, open, initialData, apiUrl, existingItems = [], maxItems = null }) => {
    const [modalData, setModalData] = useState({
        selectedBarang: null,
        qty: '',
        harga: ''
    });
    console.log(apiUrl)

    // Barang search states
    const [searchTerm, setSearchTerm] = useState('');
    const [availableBarang, setAvailableBarang] = useState([]);
    const [barangLoading, setBarangLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (open) {
            // Check if it's an edit operation by looking for initialData with a barangs object
            if (initialData && initialData.barangs) {
                // If editing, calculate the unit price from the subtotal and quantity
                setModalData({
                    selectedBarang: initialData.barangs,
                    qty: initialData.qty,
                    harga: initialData.harga_sub_total
                });
                setSearchTerm(initialData.barangs.name);
            } else {
                // Reset for a new entry
                setModalData({ selectedBarang: null, qty: '', harga: '' });
                setSearchTerm('');
            }
        }
    }, [open, initialData]);

    // Fetch available barang
    const fetchAvailableBarang = async (searchTerm = '') => {
        if (!searchTerm.trim()) {
            setAvailableBarang([]);
            return;
        }
        
        try {
            setBarangLoading(true);
            const response = await api.get(`/inventBarang/${searchTerm}`);
            const data = response.data.data;
            // console.log(data)
            const filteredBarang = data.data.filter(barang =>
                barang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                barang.kode_barang.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setAvailableBarang(filteredBarang);
        } catch (error) {
            console.error('Error fetching barang:', error);
            setAvailableBarang([]);
        } finally {
            setBarangLoading(false);
        }
    };

    const handleSearchChange = (searchTerm) => {
        setSearchTerm(searchTerm);

        if (searchTerm.trim()) {
            setShowResults(true);
            // Debounce search to avoid excessive API calls
            setTimeout(() => {
                fetchAvailableBarang(searchTerm);
            }, 300);
        } else {
            setShowResults(false);
            setAvailableBarang([]);
        }
    };

    const handleBarangSelect = (barang) => {
        // Check if barang is already selected (excluding current edit item)
        const isAlreadySelected = existingItems.some(item => 
            item.barangs && item.barangs.id === barang.id && initialData?.barangs?.id !== barang.id
        );
        
        if (isAlreadySelected) {
            Swal.fire({
                icon: 'warning',
                title: 'Barang sudah dipilih',
                text: 'Barang ini sudah ada dalam daftar pilihan.',
            });
            return;
        }
        
        setModalData(prev => ({ ...prev, selectedBarang: barang }));
        setSearchTerm(barang.name);
        setShowResults(false);
    };

    const handleRemoveBarang = () => {
        setModalData(prev => ({ ...prev, selectedBarang: null }));
        setSearchTerm('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!modalData.selectedBarang || !modalData.qty || !modalData.harga) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Data belum lengkap',
                    text: 'Silakan pilih barang, masukkan jumlah beserta harganya!',
                });
                return;
            }
            
            if (maxItems && existingItems.length >= maxItems && (!initialData || !initialData.barangs)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Batas maksimal tercapai',
                    text: `Maksimal hanya dapat memilih ${maxItems} barang sesuai detail make request.`,
                });
                return;
            }

            const qty = parseInt(modalData.qty);
            const harga = parseInt(modalData.harga);
            const subtotal = harga;

            // Construct the data object to match the parent's state structure
            onSave({
                barangs: modalData.selectedBarang,
                qty: qty,
                harga_satuan: harga, // Keep unit price for future edits
                harga_sub_total: subtotal // Provide calculated subtotal
            });

            // Reset state and close modal
            setModalData({ selectedBarang: null, qty: '', harga: '' });
            setSearchTerm('');

        } catch (error) {
            console.log(error);
        }
    };

    if (!open) return null;

    return (
        <MiModal
            onClose={onClose}
            contentClass="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            closeModal={false}
        >
            <div className='py-16 px-6'>
                <form className='w-full flex flex-col p-2' onSubmit={handleSubmit}>
                    <div className='mb-6'>
                        <p className='text-2xl text-center font-semibold'>
                            {initialData && initialData.barangs ? 'Edit Detail Purchase Order' : 'Tambah Detail Purchase Order'}
                        </p>
                    </div>

                    {/* Barang Selection */}
                    <div className="mb-4">
                        <label className="font-semibold mb-2">Pilih Barang</label>
                        <div className="relative">
                            {modalData.selectedBarang ? (
                                <div className="relative border rounded-lg p-3 bg-white flex items-start gap-3 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        {console.log(`${apiUrl}${modalData.selectedBarang.image}`)}
                                        {modalData.selectedBarang.image && (
                                            <img
                                                src={`${apiUrl}${modalData.selectedBarang.image}`}
                                                alt={modalData.selectedBarang.name}
                                                className="w-14 h-14 object-cover rounded-md border"
                                            />
                                        )}
                                        <div>
                                            <p className="font-medium text-gray-900">{modalData.selectedBarang.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {modalData.selectedBarang.kode_barang} • {modalData.selectedBarang.satuan}
                                            </p>
                                            <p className="text-xs text-gray-400">Gudang: {modalData.selectedBarang.kode_gudang}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveBarang}
                                        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full focus:outline-none"
                                        aria-label="Hapus barang"
                                        title="Hapus"
                                    >
                                        <i className="bx bx-x text-base"></i>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className='bg-white p-2 rounded-md border border-gray-300'>
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => handleSearchChange(e.target.value)}
                                            placeholder="Cari berdasarkan nama atau kode barang"
                                            className="w-full focus:outline-none placeholder-gray-400"
                                            autoFocus
                                        />
                                    </div>

                                    {showResults && (
                                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {barangLoading ? (
                                                <div className="p-4 text-center"><Loader /></div>
                                            ) : availableBarang.length === 0 ? (
                                                <div className="p-4 text-center text-gray-500">
                                                    {searchTerm ? 'Barang tidak ditemukan' : 'Mulai ketik untuk mencari'}
                                                </div>
                                            ) : (
                                                availableBarang.map((barang) => (
                                                    <div
                                                        key={barang.id}
                                                        onClick={() => handleBarangSelect(barang)}
                                                        className="p-3 cursor-pointer flex items-center gap-3 hover:bg-blue-50 transition"
                                                    >
                                                        {barang.image && (
                                                            <img
                                                                src={`${apiUrl}${barang.image}`}
                                                                alt={barang.name}
                                                                className="w-10 h-10 object-cover rounded-md border"
                                                            />
                                                        )}
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900 text-sm">{barang.name}</p>
                                                            <p className="text-xs text-gray-500">{barang.kode_barang} • {barang.satuan}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Qty and Harga Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="font-semibold mb-2">Jumlah</label>
                            <div className='bg-white p-2 rounded-md border border-gray-300'>
                                <input
                                    type="number"
                                    min={1}
                                    className='w-full focus:outline-none'
                                    onChange={e => setModalData({ ...modalData, qty: e.target.value })}
                                    value={modalData.qty}
                                    placeholder="Masukkan jumlah"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="font-semibold mb-2">Harga Satuan</label>
                            <div className='bg-white p-2 rounded-md border border-gray-300'>
                                <input
                                    type="number"
                                    min={1}
                                    className='w-full focus:outline-none'
                                    onChange={e => setModalData({ ...modalData, harga: e.target.value })}
                                    value={modalData.harga}
                                    placeholder="Masukkan harga satuan"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-col sm:flex-row-reverse w-full justify-start items-center gap-3'>
                        <button
                            type="submit"
                            disabled={!modalData.selectedBarang || !modalData.qty || !modalData.harga}
                            className='w-full sm:w-auto py-2 px-6 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 transition-colors duration-200 text-white disabled:bg-blue-300'
                        >
                            Simpan
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className='w-full sm:w-auto py-2 px-6 rounded-lg font-medium border border-gray-300 bg-white hover:bg-gray-50 transition-colors duration-200 text-gray-700'
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </MiModal>
    );
};

export default ModalPurchaseOrder;