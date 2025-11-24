import React, { useEffect, useState, useRef } from 'react';
import MiModal from '../MiModal';
import api from '../../../api/api';
import Swal from 'sweetalert2';
import Loader from '../Loader';
import SelectPaginate from '../../component/SelectPaginate'; // --- TAMBAHAN --- (Pastikan path ini benar)

// --- TERIMA PROPS BARU: prItems ---
const ModalPurchaseOrder = ({ onClose, onSave, open, initialData, apiUrl, prItems = [], existingItems = [], maxItems = null }) => {
    const [modalData, setModalData] = useState({
        selectedBarang: null,
        qty: '',
        harga: '',
        selectedMataUang: null, // --- State ini sekarang akan menyimpan OBJEK, bukan ID ---
    });

    // --- DIHAPUS --- State untuk Mata Uang (mataUangList, mataUangLoading)
    // --- DIHAPUS --- karena SelectPaginate menanganinya sendiri.

    // Barang search states
    const [searchTerm, setSearchTerm] = useState('');
    const [availableBarang, setAvailableBarang] = useState([]);
    const [barangLoading, setBarangLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    
    const debounceTimeout = useRef(null);
    useEffect(() => {
        return () => {
            clearTimeout(debounceTimeout.current);
        };
    }, []);

    useEffect(() => {
        if (open) {
            // FIXED: Check for 'barang_detail' (from API) or 'selectedBarang' (from a previous unsaved edit)
            const existingBarang = initialData?.barang_detail || initialData?.selectedBarang;

            // --- BARU: Tetapkan daftar barang yang tersedia dari prop prItems ---
            const itemsFromPR = prItems.map(prDetail => prDetail.barang_detail).filter(Boolean); 
            setAvailableBarang(itemsFromPR);
            // -----------------------------------------------------------------

            // --- DIHAPUS --- fetchMataUang() tidak diperlukan lagi.

            if (initialData && existingBarang) {
                // If editing, populate from initialData
                setModalData({
                    selectedBarang: existingBarang,
                    qty: initialData.requested_qty || initialData.qty,
                    harga: initialData.harga_per_item || initialData.harga_satuan,
                    // --- PERUBAHAN: Muat objek mata uang langsung dari initialData ---
                    // (Asumsi `onSave` menyimpan keseluruhan objek)
                    selectedMataUang:  
                        initialData.mataUang ? {
                                ...initialData.mataUang,
                                value: initialData.mataUang.id,
                                label: initialData.mataUang.kode
                            }
                            : null
                });
                setSearchTerm(existingBarang.name);
            } else {
                // Reset for a new entry
                // --- PERUBAHAN: Reset mata uang ---
                setModalData({ selectedBarang: null, qty: '', harga: '', selectedMataUang: null });
                setSearchTerm('');
            }
        }
    }, [open, initialData, prItems]); 

    const searchContainerRef = useRef(null);
    useEffect(() => {
        // ... (Fungsi handleClickOutside tidak berubah)
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            clearTimeout(debounceTimeout.current);
        };
    }, []);

    // --- (Fungsi fetchAvailableBarang tidak berubah) ---
    const fetchAvailableBarang = (term = '') => {
        setBarangLoading(true);
        try {
            const itemsFromPR = prItems.map(prDetail => prDetail.barang_detail).filter(Boolean);
            if (term.trim() === '') {
                setAvailableBarang(itemsFromPR);
            } else {
                const lowerCaseTerm = term.toLowerCase();
                const filteredItems = itemsFromPR.filter(barang => 
                    (barang.name && barang.name.toLowerCase().includes(lowerCaseTerm)) ||
                    (barang.kode_barang && barang.kode_barang.toLowerCase().includes(lowerCaseTerm))
                );
                setAvailableBarang(filteredItems);
            }
        } catch (error) {
            console.error('Error filtering PR items:', error);
            setAvailableBarang([]);
        } finally {
            setBarangLoading(false);
        }
    };

     // --- (Fungsi handleSearchChange tidak berubah) ---
     const handleSearchChange = (term) => {
        setSearchTerm(term);
        setShowResults(true);
        clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            fetchAvailableBarang(term);
        }, 300);
    };

    // --- (Fungsi handleBarangSelect tidak berubah) ---
    const handleBarangSelect = (barang) => {
        const isAlreadySelected = existingItems.some(item => 
            (item.selectedBarang?.id === barang.id || item.barang_detail?.id === barang.id) && 
            (initialData?.selectedBarang?.id !== barang.id && initialData?.barang_detail?.id !== barang.id)
        );
        
        if (isAlreadySelected) {
            Swal.fire({
                icon: 'warning',
                title: 'Barang sudah dipilih',
                text: 'Barang ini sudah ada dalam daftar PO.',
            });
            return;
        }
        
        setModalData(prev => ({ ...prev, selectedBarang: barang }));
        setSearchTerm(barang.name);
        setShowResults(false);
    };

    const handleRemoveBarang = () => {
        // --- PERUBAHAN: Reset mata uang (selectedMataUang) ---
        setModalData(prev => ({ ...prev, selectedBarang: null, qty: '', harga: '', selectedMataUang: null }));
        setSearchTerm('');
        fetchAvailableBarang(''); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!modalData.selectedBarang || !modalData.qty || !modalData.harga || !modalData.selectedMataUang) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Data belum lengkap',
                    text: 'Silakan pilih barang, masukkan jumlah, harga, dan mata uang!',
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

            // Ini agar saat "Edit", modal bisa menerima objek ini kembali.
            onSave({
                selectedBarang: modalData.selectedBarang,
                qty: qty,
                harga_satuan: harga,
                harga_per_item: harga,
                selectedMataUang: {
                    id: modalData.selectedMataUang.id,
                    kode: modalData.selectedMataUang.kode
                }
            });

            // Reset state and close modal
            // --- PERUBAHAN: Reset mata uang ---
            setModalData({ selectedBarang: null, qty: '', harga: '', selectedMataUang: null });
            setSearchTerm('');

        } catch (error) {
            console.log(error);
        }
    };

    if (!open) return null;

    return (
        <MiModal
            onClose={onClose}
            contentClass="max-w-2xl w-full min-h-[64vh] overflow-y-auto"
            closeModal={false}
        >
            <div className='py-16 px-6'>
                <form className='w-full flex flex-col p-2' onSubmit={handleSubmit}>
                    <div className='mb-6'>
                        <p className='text-2xl text-center font-semibold'>
                            {initialData && (initialData.barang_detail || initialData.selectedBarang) ? 'Edit Detail Purchase Order' : 'Tambah Detail Purchase Order'}
                        </p>
                    </div>
                    
                    {/* Barang Selection */}
                    <div className="mb-4">
                        {/* ... (JSX untuk pilih barang tidak berubah) ... */}
                        <label className="font-semibold">Pilih Barang (berdasarkan Purchase Request)</label>
                        <div className="relative mt-1" ref={searchContainerRef}>
                            {modalData.selectedBarang ? (
                                <div className="relative border rounded-lg p-3 bg-white flex items-start gap-3 shadow-sm">
                                    <div className="flex items-center gap-3">
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
                                            onFocus={() => setShowResults(true)} 
                                            placeholder="Cari berdasarkan nama atau kode barang"
                                            className="w-full focus:outline-none placeholder-gray-400"
                                        />
                                    </div>

                                    {showResults && (
                                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {barangLoading ? (
                                                <div className="p-4 text-center"><Loader /></div>
                                            ) : availableBarang.length === 0 ? (
                                                <div className="p-4 text-center text-gray-500">
                                                    {searchTerm ? 'Barang tidak ditemukan' : 'Tidak ada barang di PR ini'}
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="font-semibold">Jumlah</label>
                            <div className='bg-white p-3 rounded-md border border-gray-300 mt-1'>
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
                            <label className="font-semibold">Harga</label>
                            <div className='bg-white mt-1 p-3 rounded-md border border-gray-300'>
                                <input
                                    type="number"
                                    min={1}
                                    className='w-full focus:outline-none'
                                    onChange={e => setModalData({ ...modalData, harga: e.target.value })}
                                    value={modalData.harga}
                                    placeholder="Masukkan harga item"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-[1px]"> 
                            <label className="font-semibold">Mata Uang</label>
                            <div className='bg-white rounded-md mt-1'>
                                <SelectPaginate
                                    source={'mataUang'}
                                    selectValue={modalData.selectedMataUang}
                                    selectName="mata uang"
                                    itemLabel={['kode']}
                                    handleSelectChange={(value) => 
                                        setModalData(prev => ({ ...prev, selectedMataUang: value }))
                                    }
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-col sm:flex-row-reverse w-full justify-start items-center gap-3'>
                        <button
                            type="submit"
                            disabled={!modalData.selectedBarang || !modalData.qty || !modalData.harga || !modalData.selectedMataUang}
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