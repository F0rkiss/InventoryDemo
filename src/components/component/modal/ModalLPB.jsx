import React, { useEffect, useState } from 'react';
import MiModal from '../MiModal';
import api from '../../../api/api';
import Swal from 'sweetalert2';
import Loader from '../Loader';

const ModalLPB = ({ onClose, onSave, open, initialData, apiUrl, existingItems = [], purchaseOrderId = null, lpbData = null, onDetailsMetaChange = null }) => {
    const [purchaseOrderDetails, setPurchaseOrderDetails] = useState([]);
    const [Qty, setQty] = useState([]);
    const [arrivalQuantities, setArrivalQuantities] = useState({});
    const [selectedDetailId, setSelectedDetailId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            if (lpbData) {
                loadPurchaseOrderDetails();
            } else if (purchaseOrderId) {
                fetchPurchaseOrderDetails();
            }
        }
    }, [open, lpbData, purchaseOrderId]);

    const loadPurchaseOrderDetails = () => {
        try {
            setLoading(true);
            const details = lpbData?.purchase_order?.details || [];
            const quantity = lpbData?.purchase_order?.qty || [];

            if (details.length === 0) {
                const altDetails = lpbData?.details || [];
                const altQuantity = lpbData?.qty || [];

                setPurchaseOrderDetails(altDetails);
                setQty(altQuantity);

                const initialQuantities = {};
                altDetails.forEach(detail => {
                    initialQuantities[detail.id] = '';
                });
                setArrivalQuantities(initialQuantities);

                if (initialData && initialData.barangs?.id) {
                    const found = altDetails.find(d => d.barangs?.id === initialData.barangs.id);
                    if (found) {
                        setSelectedDetailId(found.id);
                        setArrivalQuantities(prev => ({
                            ...prev,
                            [found.id]: initialData.qty || ''
                        }));
                    }
                } else {
                    setSelectedDetailId(null);
                }

                if (onDetailsMetaChange) {
                    const availableCount = altDetails.reduce((count, d) => {
                        const qtyItem = altQuantity?.find(q => q.barang_id === d.barangs?.id);
                        const sisa = qtyItem?.sisa ?? d.qty ?? 0;
                        return count + (sisa > 0 ? 1 : 0);
                    }, 0);
                    onDetailsMetaChange({ totalSelectable: availableCount, totalDetails: altDetails.length });
                }
            } else {
                setPurchaseOrderDetails(details);
                setQty(quantity);

                const initialQuantities = {};
                details.forEach(detail => {
                    initialQuantities[detail.id] = '';
                });
                setArrivalQuantities(initialQuantities);

                if (initialData && initialData.barangs?.id) {
                    const found = details.find(d => d.barangs?.id === initialData.barangs.id);
                    if (found) {
                        setSelectedDetailId(found.id);
                        setArrivalQuantities(prev => ({
                            ...prev,
                            [found.id]: initialData.qty || ''
                        }));
                    }
                } else {
                    setSelectedDetailId(null);
                }

                if (onDetailsMetaChange) {
                    const availableCount = details.reduce((count, d) => {
                        const qtyItem = quantity?.find(q => q.barang_id === d.barangs?.id);
                        const sisa = qtyItem?.sisa ?? d.qty ?? 0;
                        return count + (sisa > 0 ? 1 : 0);
                    }, 0);
                    onDetailsMetaChange({ totalSelectable: availableCount, totalDetails: details.length });
                }
            }
        } catch (error) {
            console.error('Error loading purchase order details:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal memuat detail purchase order'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchPurchaseOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`laporanPenerimaanBarang-purchaseOrder/detail/${purchaseOrderId}`);
            const data = response.data.data;
            const details = data.details || [];
            const quantity = data.qty || [];
            setPurchaseOrderDetails(details);
            setQty(quantity);

            const initialQuantities = {};
            details.forEach(detail => {
                initialQuantities[detail.id] = '';
            });
            setArrivalQuantities(initialQuantities);

            if (initialData && initialData.barangs?.id) {
                const found = details.find(d => d.barangs?.id === initialData.barangs.id);
                if (found) {
                    setSelectedDetailId(found.id);
                    setArrivalQuantities(prev => ({
                        ...prev,
                        [found.id]: initialData.qty || ''
                    }));
                }
            } else {
                setSelectedDetailId(null);
            }

            if (onDetailsMetaChange) {
                const availableCount = details.reduce((count, d) => {
                    const qtyItem = quantity?.find(q => q.barang_id === d.barangs?.id);
                    const sisa = qtyItem?.sisa ?? d.qty ?? 0;
                    return count + (sisa > 0 ? 1 : 0);
                }, 0);
                onDetailsMetaChange({ totalSelectable: availableCount, totalDetails: details.length });
            }
        } catch (error) {
            console.error('Error fetching purchase order details:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal mengambil detail purchase order'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleArrivalQuantityChange = (detailId, value) => {
        setArrivalQuantities((prev) => ({
            ...prev,
            [detailId]: value === '' ? '' : (parseInt(value) || 0)
        }));
    };

    const getMaxQuantity = (detail) => {
        if (!detail?.barangs?.id || !Qty || Qty.length === 0) {
            return detail?.qty || 0;
        }
        const qtyItem = Qty.find(q => q.barang_id === detail.barangs.id);
        return qtyItem?.sisa || 0;
    };

    const isAlreadySelectedInParent = (detail) => {
        const barangId = detail?.barangs?.id;
        if (!barangId) return false;
        if (initialData && initialData.barangs?.id === barangId) return false;
        return existingItems.some(item => item?.barangs?.id === barangId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!selectedDetailId) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Belum ada barang dipilih',
                    text: 'Silakan pilih salah satu barang yang datang.',
                });
                return;
            }

            const selectedDetail = purchaseOrderDetails.find(d => d.id === selectedDetailId);
            if (!selectedDetail) return;

            const qty = parseInt(arrivalQuantities[selectedDetailId]);
            if (!qty || qty <= 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Jumlah belum diisi',
                    text: 'Masukkan jumlah yang diterima untuk barang terpilih.',
                });
                return;
            }

            const payload = {
                barangs: selectedDetail.barangs,
                qty: qty,
                purchase_order_detail_id: selectedDetail.id
            };

            onSave(payload);
            setSelectedDetailId(null);
        } catch (error) {
            console.log(error);
        }
    };

    if (!open) return null;

    return (
            <MiModal
            onClose={onClose}
            contentClass="max-w-4xl w-full max-h-[90vh] overflow-hidden sm:rounded-lg"
            closeModal={false}
        >
        <div className="py-6 px-4 sm:py-10 sm:px-6 flex flex-col h-full">
            <form className="w-full flex flex-col h-full" onSubmit={handleSubmit}>
                {/* Header */}
                <div className="mb-4 text-center flex-shrink-0">
                    <p className="text-xl sm:text-2xl font-semibold">
                        Detail Penerimaan Barang
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                        Masukkan jumlah barang yang diterima sesuai dengan Purchase Order
                    </p>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-8 flex-1">
                        <Loader />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto pr-2">
                        {purchaseOrderDetails.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">
                                    Tidak ada data purchase order details yang ditemukan.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4 pb-4">
                                {purchaseOrderDetails
                                    .filter(
                                        (detail) =>
                                            !selectedDetailId || selectedDetailId === detail.id
                                    )
                                    .map((detail) => (
                                        <div
                                            key={detail.id}
                                            className={`border rounded-lg p-3 sm:p-4 bg-white shadow-sm ${
                                                selectedDetailId === detail.id
                                                    ? "border-blue-400"
                                                    : "border-gray-200"
                                            }`}
                                        >
                                            
                                            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                                
                                                <div className="flex-shrink-0 mx-auto sm:mx-0">
                                                    {detail.barangs?.image ? (
                                                        <img
                                                            src={`${apiUrl}${detail.barangs.image}`}
                                                            alt={detail.barangs.name}
                                                            className="w-20 h-20 sm:w-16 sm:h-16 object-cover rounded-md border"
                                                        />
                                                    ) : (
                                                        <div className="w-20 h-20 sm:w-16 sm:h-16 bg-gray-100 rounded-md border flex items-center justify-center">
                                                            <i className="bx bx-package text-gray-400 text-2xl sm:text-xl"></i>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0 text-center sm:text-left">
                                                    
                                                    <h3 className="font-medium text-gray-900 text-base sm:text-lg">
                                                        {detail.barangs?.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {detail.barangs?.kode_barang} •{" "}
                                                        {detail.barangs?.satuan}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        Gudang: {detail.barangs?.kode_gudang}
                                                    </p>
                                                </div>

                                                <div className="flex-shrink-0 text-center sm:text-right">
                                                    <div className="space-y-2">
                                                        <div>
                                                            <p className="text-sm text-gray-500">
                                                                Dipesan
                                                            </p>
                                                            <p className="font-medium">
                                                                {detail.qty} {detail.barangs?.satuan}
                                                            </p>
                                                        </div>
                                                        {!selectedDetailId && (
                                                            
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    isAlreadySelectedInParent(
                                                                        detail
                                                                    ) || getMaxQuantity(detail) === 0
                                                                }
                                                                onClick={() => {
                                                                    setSelectedDetailId(detail.id);
                                                                }}
                                                                className="mt-2 py-1 px-3 rounded text-sm font-medium border bg-white text-blue-600 border-blue-300 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                                                            >
                                                                {getMaxQuantity(detail) === 0
                                                                    ? "Barang Sudah Terpenuhi"
                                                                    : isAlreadySelectedInParent(detail)
                                                                    ? "Sudah ditambahkan"
                                                                    : "Pilih item ini"}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {selectedDetailId === detail.id && (
                                                <div className="border-t-2 border-gray-200 mt-3 pt-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedDetailId(null)}
                                                                aria-label="Kembali"
                                                                title="Kembali"
                                                                className="inline-flex items-center px-1 py-0.5 text-blue-600 hover:text-blue-700"
                                                            >
                                                                <i className="bx bx-left-arrow-alt text-xl"></i>
                                                                <span className="ml-1 text-sm">Kembali</span>
                                                            </button>
                                                    <div className="flex items-center justify-between w-full">
                                                        <div className="flex items-center">
                                                            <label className=" block text-sm font-medium text-gray-700">
                                                                Jumlah yang Diterima
                                                            </label>
                                                        </div>
                                                        <p className="text-sm text-gray-500">
                                                            Barang yang belum diterima: {getMaxQuantity(detail)} {detail.barangs?.satuan}
                                                        </p>
                                                    </div>
                                                    <div className="w-full">
                                                        <div className="bg-white p-2 rounded-md border border-gray-300">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={getMaxQuantity(detail)}
                                                                className="w-full focus:outline-none"
                                                                value={
                                                                    arrivalQuantities[detail.id] ??
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleArrivalQuantityChange(
                                                                        detail.id,
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="Masukkan jumlah yang diterima"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="flex flex-col sm:flex-row-reverse w-full justify-start items-center gap-3 mt-4 flex-shrink-0">
                    <button
                        type="submit"
                        disabled={
                            loading ||
                            purchaseOrderDetails.length === 0 ||
                            !selectedDetailId
                        }
                        className="w-full sm:w-auto py-2 px-6 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 transition-colors duration-200 text-white disabled:bg-blue-300"
                    >
                        Simpan Penerimaan
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto py-2 px-6 rounded-lg font-medium border border-gray-300 bg-white hover:bg-gray-50 transition-colors duration-200 text-gray-700"
                    >
                        Batal
                    </button>
                </div>
            </form>
        </div>
    </MiModal>

    );
};

export default ModalLPB;
