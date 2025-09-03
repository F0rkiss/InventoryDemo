import React, { useState } from 'react';
import ModalPurchaseRequest from './modal/ModalPurchaseRequest';

const PurchaseRequestBarang = ({ 
    selectedItems, 
    setSelectedItems, 
    detailMR, 
    apiUrl 
}) => {
    const [openModal, setOpenModal] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [initialModalData, setInitialModalData] = useState({
        selectedBarang: null,
        qty: '',
    });

    const handleOpenModal = (item = null, index = null) => {
        if (item && index !== null) {
            // Edit mode
            setEditIndex(index);
            setInitialModalData(item);
        } else {
            // Add mode
            setEditIndex(null);
            setInitialModalData({ selectedBarang: null, qty: '' });
        }
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditIndex(null);
    };

    const handleSave = (data) => {
        if (editIndex !== null) {
            // Update existing item
            setSelectedItems(
                selectedItems.map((item, idx) => (idx === editIndex ? data : item))
            );
        } else {
            // Add new item
            setSelectedItems([...selectedItems, data]);
        }
        setOpenModal(false);
        setEditIndex(null);
    };

    const handleRemoveItem = (index) => {
        setSelectedItems(
            selectedItems.filter((_, idx) => idx !== index)
        );
    };

    return (
        <>
            {/* Selected Items Table */}
            <div className="mb-4">
                {selectedItems.length === 0 ? (
                    <p className="text-gray-400 italic text-center py-4">
                        Belum ada barang dipilih
                    </p>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-3 py-2 rounded-l-md">No</th>
                                <th className="px-3 py-1">Barang</th>
                                <th className="px-3 py-1">Jumlah</th>
                                <th className="px-3 py-1 rounded-r-md">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedItems.map((item, i) => (
                                <tr
                                    key={i}
                                    className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                                >
                                    <td className="px-4 py-4 rounded-l-md">{i + 1}</td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            {item.selectedBarang.image && (
                                                <img
                                                    src={`${apiUrl}${item.selectedBarang.image}`}
                                                    alt={item.selectedBarang.name}
                                                    className="w-8 h-8 object-cover rounded-md border"
                                                />
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {item.selectedBarang.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {item.selectedBarang.kode_barang}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">{item.qty}</td>
                                    <td className="px-4 py-4 rounded-r-md">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenModal(item, i)}
                                                className="text-cyan-600 hover:text-cyan-700"
                                                title="Edit"
                                            >
                                                <i className="bx bx-edit text-lg"></i>
                                            </button>
                                            <button
                                                onClick={() => handleRemoveItem(i)}
                                                className="text-red-500 hover:text-red-600"
                                                title="Hapus"
                                            >
                                                <i className="bx bx-trash text-lg"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Item Button */}
            <div className="flex justify-center mt-5">
                {selectedItems.length < detailMR.length ? (
                    <button
                        type="button"
                        className="text-3xl font-light text-gray-700 hover:text-gray-900"
                        onClick={() => handleOpenModal()}
                    >
                        <i className="bx bx-plus"></i>
                    </button>
                ) : (
                    <p className="text-sm text-gray-500 italic">
                        Maksimal {detailMR.length} barang sesuai detail make request
                    </p>
                )}
            </div>

            {/* Modal */}
            {openModal && (
                <ModalPurchaseRequest
                    open={openModal}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    initialData={initialModalData}
                    apiUrl={apiUrl}
                    existingItems={selectedItems}
                    maxItems={detailMR.length}
                />
            )}
        </>
    );
};

export default PurchaseRequestBarang;
