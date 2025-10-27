import React, { useEffect, useState, useRef } from 'react'; // BARU: Menambahkan useRef
import MiModal from '../MiModal';
import api from '../../../api/api';
import Swal from 'sweetalert2';
import Loader from '../Loader';

const ModalMR = ({ open, onClose, onSave, initialData, requestMode, apiUrl }) => {
    // State internal modal
    const [noteBarang, setNoteBarang] = useState('');
    const [selectedBarang, setSelectedBarang] = useState(null);
    const [qty, setQty] = useState('');

    // State untuk pencarian barang
    const [searchTerm, setSearchTerm] = useState('');
    const [availableBarang, setAvailableBarang] = useState([]);
    const [barangLoading, setBarangLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchContainerRef = useRef(null);

    const debounceTimeout = useRef(null);

    // BARU: Fungsi untuk mengambil data barang (baik awal maupun berdasarkan pencarian)
    const fetchAvailableBarang = async (term = '', mode) => {
        setBarangLoading(true);
        let endpoint = '';
        let config = {}; // Objek konfigurasi untuk Axios (untuk params)

        try {
            if (mode === 'ya') {
                // Mode "ya" (Stok) menggunakan {term} sebagai bagian dari URL
                endpoint = '/inventStok';
                if (term.trim()) {
                    endpoint = `${endpoint}/${term.trim()}`;
                }
            } else if (mode === 'other') {
                // Mode "other" (Barang) menggunakan ?search={term}
                endpoint = '/inventMakeRequest-barangOther';
                if (term.trim()) {
                    // Axios akan otomatis mengubah ini menjadi /inventBarang?search=...
                    config.params = { search: term.trim() }; 
                }
            } else {
                // Mode "tidak" atau null, jangan fetch
                setBarangLoading(false);
                return;
            }

            // DIUBAH: Panggilan api.get() sekarang menyertakan 'config'
            const response = await api.get(endpoint, config);
            
            setAvailableBarang(response.data.data?.data || response.data.data || []);
        } catch (error) {
            console.error('Error fetching barang:', error);
            setAvailableBarang([]); 
        } finally {
            setBarangLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            // DIUBAH: Logika berdasarkan requestMode
            const isSelectionMode = (requestMode === 'ya' || requestMode === 'other');
            
            setNoteBarang(isSelectionMode ? '' : (initialData?.note_barang || ''));
            setSelectedBarang(isSelectionMode ? (initialData?.selectedBarang || null) : null);
            setSearchTerm(isSelectionMode ? (initialData?.selectedBarang?.name || initialData?.selectedBarang?.namaBarang || '') : '');
            
            setAvailableBarang([]);
            setShowResults(false);

            if (requestMode === 'other') {
                setQty(1); // Langsung set qty ke 1 jika mode "other"
            } else {
                setQty(initialData?.qty || ''); // Logika lama untuk "ya" dan "tidak"
            }

            // DIUBAH: Ambil data barang jika mode-nya "ya" atau "other"
            if (isSelectionMode && !initialData?.selectedBarang) {
                fetchAvailableBarang('', requestMode);
            }
        }
    }, [open, initialData, requestMode]);


    // BARU: Effect untuk menutup dropdown saat klik di luar area pencarian
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const handleSearchChange = (term) => {
        setSearchTerm(term);
        setShowResults(true); 
        clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            fetchAvailableBarang(term, requestMode);
        }, 1200);
    };

    const handleBarangSelect = (item) => {
       const flat = {
            ...(item?.barang || item || {}),
            kode_gudang: item?.kode_gudang || item?.kodeGudang || item?.barang?.kode_gudang || undefined,
        };
        setSelectedBarang(flat);
        setSearchTerm(flat.name || flat.namaBarang || '');
        setShowResults(false);
    };
    
    const handleRemoveBarang = () => {
        setSelectedBarang(null);
        setSearchTerm('');
        fetchAvailableBarang('', requestMode); 
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const isQtyInvalid = !qty || parseInt(qty) <= 0;
        if (requestMode === 'ya' || requestMode === 'other') {
            if (!selectedBarang || isQtyInvalid) {
                Swal.fire({ icon: 'warning', title: 'Data belum lengkap', text: 'Silakan pilih barang dan masukkan jumlah yang valid.' });
                return;
            }
        } else if (requestMode === 'tidak') {
            if (!noteBarang || isQtyInvalid) {
                Swal.fire({ icon: 'warning', title: 'Data belum lengkap', text: 'Silakan isi catatan barang dan jumlah yang valid.' });
                return;
            }
        }
        const saveData = { qty: parseInt(qty) };
        if (requestMode === 'ya' || requestMode === 'other') {
            saveData.selectedBarang = selectedBarang;
        } else if (requestMode === 'tidak') {
            saveData.note_barang = noteBarang;
        }
        onSave(saveData);
    };

    if (!open) return null;

    return (
        <MiModal onClose={onClose} contentClass="max-w-2xl w-full min-h-[60vh]">
            <div className='pb-16 pt-12 px-6'>
                <form className='w-full flex flex-col p-2' onSubmit={handleSubmit}>
                    <p className='text-2xl text-center font-semibold mb-6'>
                        {initialData ? 'Edit Detail Request' : 'Tambah Detail Request'}
                    </p>

                    {(requestMode === 'ya' || requestMode === 'other') ? (
                        <div className="mb-4">
                            <label className="font-semibold">Pilih Permintaan</label>
                            <div className="relative mt-1" ref={searchContainerRef}>
                                {selectedBarang ? (
                                    <>
                                    <div className="relative border rounded-lg p-3 bg-white flex items-start gap-3 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            {/* DIUBAH: Normalisasi field gambar */}
                                            {(selectedBarang.gambarBarang || selectedBarang.image) && (
                                                <img
                                                    src={`${apiUrl}${selectedBarang.gambarBarang || selectedBarang.image}`}
                                                    alt={selectedBarang.name || selectedBarang.namaBarang}
                                                    className="w-14 h-14 object-cover rounded-md border"
                                                />
                                            )}
                                            <div>
                                                {/* DIUBAH: Normalisasi field teks */}
                                                <p className="font-medium text-gray-900">{selectedBarang.name || selectedBarang.namaBarang}</p>
                                                <p className="text-sm text-gray-500">
                                                    {selectedBarang.kode_barang || selectedBarang.kodeBarang}
                                                </p>
                                                {/* DIUBAH: Field gudang hanya relevan untuk 'ya' (Stok) */}
                                                {
                                                    (requestMode === 'ya' && (selectedBarang.kodeGudang || selectedBarang.kode_gudang)) &&
                                                    <p className="text-xs text-gray-400">Gudang: {selectedBarang.kode_gudang || selectedBarang.kodeGudang}</p>
                                                }
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
                                    </>
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
                                                        {searchTerm ? 'Barang tidak ditemukan' : 'Tidak ada barang tersedia'}
                                                    </div>
                                                ) : (
                                                    // DIUBAH: Normalisasi data di dalam map
                                                    availableBarang.map((item) => {
                                                        // Tentukan field berdasarkan mode
                                                        const isStok = requestMode === 'ya';
                                                        const id = item.id;
                                                        const name = isStok ? item.namaBarang : item.name;
                                                        const code = isStok ? item.kodeBarang : item.kode_barang;
                                                        const image = isStok ? item.gambarBarang : item.image;
                                                        const gudang = isStok ? item.kodeGudang : null;

                                                        return (
                                                            <div
                                                                key={id}
                                                                onClick={() => handleBarangSelect(item)}
                                                                className="p-3 cursor-pointer flex items-center gap-3 hover:bg-blue-50 transition"
                                                            >
                                                                {image && (
                                                                    <img
                                                                        src={`${apiUrl}${image}`}
                                                                        alt={name}
                                                                        className="w-10 h-10 object-cover rounded-md border"
                                                                    />
                                                                )}
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-gray-900 text-sm">{name}</p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {code} {gudang && `• ${gudang}`}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Ini adalah kasus untuk requestMode === 'tidak'
                        <div className="mb-4">
                            <label className="font-semibold">Note Barang</label>
                            <div className='bg-white p-2 mt-1 rounded-md border border-gray-300'>
                                <textarea maxLength={225} placeholder='Note' type="text" className='w-full focus:outline-none' onChange={e => setNoteBarang(e.target.value)} value={noteBarang} required autoFocus />
                            </div>
                        </div>
                    )}
                    {requestMode !== 'other' &&
                        (<div className="mb-6">
                            <label className="font-semibold">Quantity</label>
                            <div className='bg-white p-2 mt-1 rounded-md border border-gray-300'>
                                <input type="number" placeholder='Jumlah barang' min={1} className='w-full focus:outline-none' onChange={e => setQty(e.target.value)} value={qty} required />
                            </div>
                        </div>)
                    }

                    <div className='flex flex-col sm:flex-row-reverse w-full justify-start items-center gap-3'>
                        <button type="submit" className='w-full sm:w-auto py-2 px-6 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 text-white transition-color duration-200'>Simpan</button>
                        <button type="button" onClick={onClose} className='w-full sm:w-auto py-2 px-6 rounded-lg font-medium border bg-white hover:bg-gray-50 transition-color duration-200'>Batal</button>
                    </div>
                </form>
            </div>
        </MiModal>
    );
};

export default ModalMR;