import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/api';
import Loader from '../component/Loader';

const SelectPaginateBarang = ({ 
    apiUrl, 
    value, 
    onSelect, 
    placeholder = 'Pilih barang...',
    disabled = false 
}) => {
    // State untuk menyimpan SEMUA data dari API
    const [masterData, setMasterData] = useState([]);
    
    // State Loading & UI
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false); // Penanda agar API dipanggil sekali saja
    
    const wrapperRef = useRef(null);

    // Tutup dropdown jika klik di luar area
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowResults(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    // Fungsi mengambil data dari API
    const fetchBarang = async () => {
        if (isDataLoaded) return; // Jangan fetch lagi jika data sudah ada

        setIsLoading(true);
        try {
            const response = await api.get('inventStok-barang');
            const data = response.data.data || [];
            
            setMasterData(data.data);
            setIsDataLoaded(true);
        } catch (error) {
            console.error('Error fetching barang:', error);
            setMasterData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTrigger = () => {
        if (disabled) return;
        if (!showResults) {
            fetchBarang();
            setShowResults(true);
        } else {
            setShowResults(false);
        }
    };

    const handleSelect = (barang) => {
        setShowResults(false);
        onSelect(barang);
    };

    // XXX: Variabel 'displayValue' ini sudah tidak diperlukan
    // const displayValue = value && typeof value === 'object' ? value.name : '';

    return (
        <div className="relative" ref={wrapperRef}>
            <div 
                className={`
                  p-2 rounded-md border mt-2 flex items-center justify-between transition min-h-[42px]
                  ${disabled 
                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                    : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'
                  }
                `}
                onClick={handleTrigger}
            >
                {/* Ganti <input> dengan logic kondisional:
                  1. Jika 'value' ada, tampilkan gambar dan nama.
                  2. Jika 'value' null, tampilkan placeholder.
                */}
                {value && value.name ? (
                    // --- 1. TAMPILAN JIKA ADA VALUE (SELECTED) ---
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {/* Gambar Mini */}
                        <div className="w-8 h-8 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border">
                            {value.image ? (
                                <img
                                    src={`${apiUrl}${value.image}`}
                                    alt={value.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {e.target.onerror = null; e.target.src = 'https://placehold.co/100?text=No+Img'}} 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                                    No Img
                                </div>
                            )}
                        </div>
                        {/* Nama */}
                    <span className={`truncate ${disabled ? 'text-gray-500' : 'text-gray-700'}`}>{value.name}</span>
                </div>

                ) : (
                    // --- 2. TAMPILAN PLACEHOLDER ---
                    <span className="text-gray-400">{placeholder}</span>
                )}
                {/* --- BATAS PERUBAHAN --- */}


                {/* Ikon Panah Bawah untuk indikasi Dropdown */}
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform ${showResults ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {showResults && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {/* ... (sisa kode dropdown tidak berubah) ... */}
                    {isLoading ? (
                        <div className="p-4 flex justify-center"><Loader /></div>
                    ) : masterData.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            Data kosong
                        </div>
                    ) : (
                        masterData.map((barang) => (
                            <div
                                key={barang.id}
                                onClick={() => handleSelect(barang)}
                                className="p-3 cursor-pointer flex items-center gap-3 hover:bg-blue-50 transition border-b last:border-none"
                            >
                                <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border">
                                    {barang.image ? (
                                        <img
                                            src={`${apiUrl}${barang.image}`}
                                            alt={barang.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {e.target.onerror = null; e.target.src = 'https://placehold.co/100?text=No+Img'}} 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                            No Img
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 text-sm truncate">{barang.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                        <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                            {barang.kode_barang || '-'}
                                        </span>
                                        <span>• {barang.satuan}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default SelectPaginateBarang;