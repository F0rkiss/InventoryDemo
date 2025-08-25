import React, { useState } from 'react'
import Loader from './Loader'

const GenerateBarangSearchField = ({
    detailMR,
    selectedBarang,
    searchTerms,
    barangLoading,
    showResults,
    availableBarang,
    apiUrl,
    handleSearchChange,
    handleBarangSelect,
    handleRemoveBarang
}) => {
    const [visibleFields, setVisibleFields] = useState(1); // Start with 1 field visible

    const handleAddMore = () => {
        if (visibleFields < detailMR.length) {
            setVisibleFields(prev => prev + 1);
        }
    };

    const generateBarangSearchFields = () => {
        return detailMR.slice(0, visibleFields).map((detailItem, i) => {
            const selectedItem = selectedBarang[i];
            const searchTerm = searchTerms[i] || '';
            const isLoading = barangLoading[i] || false;
            const showResultsForThisField = showResults[i] || false;
            const availableBarangForField = availableBarang[i] || [];

            return (
                <div key={i} className="mb-6">
                    <div className="relative">
                    {selectedItem ? (
                        <div className="relative border rounded-lg p-3 bg-white flex items-start gap-3 shadow-sm items-center">
                            <div className="flex items-center gap-3">
                                {/* -------------- IMAGE ------------ */}
                            {selectedItem.image && (
                                <img
                                src={`${apiUrl}${selectedItem.image}`}
                                alt={selectedItem.name}
                                className="w-10 h-10 object-cover rounded-md border"
                                />
                            )}
                            <div>
                                <p className="font-medium text-gray-900">{selectedItem.name}</p>
                                <p className="text-sm text-gray-500">
                                {selectedItem.kode_barang} • {selectedItem.satuan}
                                </p>
                                <p className="text-xs text-gray-400">Gudang: {selectedItem.kode_gudang}</p>
                            </div>
                            </div>

                            {/* kecil, neutral, dan diposisikan di pojok kanan atas */}
                            <button
                            onClick={() => handleRemoveBarang(i)}
                            className=" top-2 right-2 w-7 h-7 flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full focus:outline-none focus:ring-2 focus:ring-red-200"
                            aria-label="Hapus barang"
                            title="Hapus"
                            >
                            <i className="bx bx-x text-base"></i>
                            </button>
                        </div>
                        ) : (
                            <>
                            <div className='border-2 rounded-lg p-2'>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => handleSearchChange(i, e.target.value)}
                                    placeholder="Cari barang berdasarkan nama atau kode..."
                                    className="w-full  rounded-lg shadow-sm focus:outline-none focus: focus:border-gray-400 placeholder-gray-400"
                                    />
                            </div>

                                {showResultsForThisField && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {isLoading ? (
                                            <div className="p-4 text-center">
                                                <Loader Class="mt-2" />
                                            </div>
                                        ) : availableBarangForField.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500">
                                                {searchTerm
                                                    ? 'Tidak ada barang ditemukan'
                                                    : 'Mulai ketik untuk mencari barang'}
                                            </div>
                                        ) : (
                                            availableBarangForField.map((barang) => {
                                                const isSelected = selectedBarang.some(
                                                    (item) => item && item.id === barang.id
                                                );
                                                return (
                                                    <div
                                                        key={barang.id}
                                                        onClick={() =>
                                                            !isSelected && handleBarangSelect(barang, i)
                                                        }
                                                        className={`p-3 cursor-pointer flex items-center gap-3 hover:bg-blue-50 transition ${
                                                            isSelected
                                                                ? 'bg-gray-100 cursor-not-allowed'
                                                                : ''
                                                        }`}
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
                                                        {isSelected && (
                                                            <i className="bx bx-check text-green-500 text-xl"></i>
                                                        )}
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
            );
        });
    };

    return (
        <div>
            {generateBarangSearchFields()}
            
            {visibleFields < detailMR.length && (
                <div className="mt-4">
                    <button
                        onClick={handleAddMore}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors"
                    >
                        <i className="bx bx-plus text-lg"></i>
                        Tambah Barang
                    </button>
                </div>
            )}
        </div>
    );
}

export default GenerateBarangSearchField