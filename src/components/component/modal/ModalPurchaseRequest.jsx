import React, { useEffect, useState } from 'react'
import MiModal from '../MiModal'
import api from '../../../api/api'
import Swal from 'sweetalert2'
import Loader from '../Loader'

const ModalPurchaseRequest = ({ onClose, onSave, open, initialData, apiUrl, existingItems = [], maxItems = null }) => {
    const [modalData, setModalData] = useState({
        selectedBarang: null,
        qty: '',
    })

    // Barang search states
    const [searchTerm, setSearchTerm] = useState('');
    const [availableBarang, setAvailableBarang] = useState([]);
    const [barangLoading, setBarangLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    React.useEffect(() => {
        if (open) {
            if (initialData) setModalData(initialData);
            else setModalData({ selectedBarang: null, qty: '' });
        }
    }, [open, initialData])

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
            item.selectedBarang && item.selectedBarang.id === barang.id
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

    if (!open) return null

    const handleSubmit = async(e) => {
        e.preventDefault()
        try {
            if (!modalData.selectedBarang || !modalData.qty) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Data belum lengkap',
                    text: 'Silakan pilih barang dan masukkan jumlah!',
                });
                return;
            }
            
            // Check if adding this item would exceed the maximum limit
            if (maxItems && existingItems.length > maxItems) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Batas maksimal tercapai',
                    text: `Maksimal hanya dapat memilih ${maxItems} barang sesuai detail make request.`,
                });
                return;
            }
        } catch (error) {
            console.log(error)
        } finally {
            onSave({ 
                selectedBarang: modalData.selectedBarang, 
                qty: parseInt(modalData.qty) 
            })
            setModalData({ selectedBarang: null, qty: '' })
            setSearchTerm('')
        }
    }

    return (
        <MiModal
        onClose={onClose}
        contentClass={`max-sm:h-[600px] max-xl:h-[600px] h-[60%]`}
        closeModal={false}
        >
        <div className='content flex-grow flex items-center justify-center w-full relative'>
            <form className='w-full flex flex-col justify-center items-center mb-8' onSubmit={handleSubmit}>
            <p className='text-2xl font-semibold -translate-y-4'>Pilih Barang & Jumlah</p>
            
            {/* Barang Selection */}
            <div className="mb-3 w-[80%]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Barang</label>
                <div className="relative">
                    {modalData.selectedBarang ? (
                        <div className="relative border rounded-lg p-3 bg-white flex items-start gap-3 shadow-sm">
                            <div className="flex items-center gap-3">
                                {console.log(`${apiUrl}${modalData.selectedBarang.image}`)}
                                {modalData.selectedBarang.image && (
                                    <img
                                        src={`${apiUrl}${modalData.selectedBarang.image}`}
                                        alt={modalData.selectedBarang.name}
                                        className="w-10 h-10 object-cover rounded-md border"
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
                                className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full focus:outline-none focus:ring-2 focus:ring-red-200"
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
                                    placeholder="Cari barang berdasarkan nama atau kode..."
                                    className="w-full focus:outline-none placeholder-gray-400"
                                    autoFocus
                                />
                            </div>

                            {showResults && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {barangLoading ? (
                                        <div className="p-4 text-center">
                                            <Loader Class="mt-2" />
                                        </div>
                                    ) : availableBarang.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500">
                                            {searchTerm
                                                ? 'Tidak ada barang ditemukan'
                                                : 'Mulai ketik untuk mencari barang'}
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
                                                    <p className="font-medium text-gray-900 text-sm">
                                                        {barang.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {barang.kode_barang} • {barang.satuan}
                                                    </p>
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

            {/* qty Input */}
            <div className="mb-3 w-[80%]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Pembelian</label>
                <div className='bg-white p-2 rounded-md border border-gray-300'>
                    <input
                        type="number"
                        min={1}
                        className='w-full focus:outline-none'
                        onChange={e => setModalData({ ...modalData, qty: e.target.value })}
                        value={modalData.qty}
                        placeholder="Masukkan jumlah..."
                        required
                    />
                </div>
            </div>

            <div className='tombol-hijau flex flex-col w-full justify-center items-center gap-2 mt-3'>
                <button
                type="submit"
                disabled={!modalData.selectedBarang || !modalData.qty}
                className='bg-green-500 disabled:bg-green-300 text-white max-md:w-[80%] w-[40%] h-10 rounded-lg'
                >
                    Save
                </button>
            </div>
            </form>
        </div>
        </MiModal>
    )
}

export default ModalPurchaseRequest
