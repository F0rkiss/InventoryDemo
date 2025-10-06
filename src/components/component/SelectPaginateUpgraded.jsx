import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import Loader from '../Loader';

const SelectPaginateUpgrade = ({ apiUrl, value, onSelect, placeholder = 'Cari berdasarkan nama atau kode barang' }) => {
    const [searchTerm, setSearchTerm] = useState(value || '');
    const [availableBarang, setAvailableBarang] = useState([]);
    const [barangLoading, setBarangLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (value) setSearchTerm(value); // Reset search term when value changes
    }, [value]);

    const fetchAvailableBarang = async (term) => {
        if (!term.trim()) return setAvailableBarang([]);
        setBarangLoading(true);
        try {
            const response = await api.get(`/inventBarang/${term}`);
            setAvailableBarang(response.data.data.data || []);
        } catch (error) {
            console.error('Error fetching barang:', error);
        } finally {
            setBarangLoading(false);
        }
    };

    const handleSearchChange = (term) => {
        setSearchTerm(term);
        setShowResults(true);
        const timer = setTimeout(() => fetchAvailableBarang(term), 300);
        return () => clearTimeout(timer);
    };

    const handleBarangSelect = (barang) => {
        setSearchTerm(barang.name);
        setShowResults(false);
        onSelect(barang);
    };

    return (
        <div className="relative mt-1">
            <div className='bg-white p-2 rounded-md border border-gray-300'>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder={placeholder}
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
        </div>
    );
};

export default SelectPaginateUpgrade;
