import React from "react";
import Loader from "../component/Loader";

export default function BarangSearchField({
  index,
  selectedItem,
  searchTerm,
  isLoading,
  availableBarang,
  onSearch,
  onSelect,
  onRemove,
  showResults,
}) {
  if (selectedItem) {
    return (
      <div className="relative border rounded-lg p-3 bg-white flex justify-between items-center">
        <div>
          <p className="font-medium">{selectedItem.name}</p>
          <p className="text-sm">{selectedItem.kode_barang} • {selectedItem.satuan}</p>
        </div>
        <button
          onClick={() => onRemove(index)}
          className="text-red-500 hover:bg-red-100 rounded-full p-1"
        >
          <i className="bx bx-x"></i>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        value={searchTerm}
        onChange={(e) => onSearch(index, e.target.value)}
        placeholder="Cari barang..."
        className="border p-2 w-full rounded"
      />
      {showResults && (
        <div className="absolute w-full bg-white border shadow-lg z-50">
          {isLoading ? (
            <Loader />
          ) : availableBarang.length === 0 ? (
            <p className="p-2 text-gray-500">Tidak ada barang ditemukan</p>
          ) : (
            availableBarang.map((barang) => (
              <div
                key={barang.id}
                onClick={() => onSelect(barang, index)}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {barang.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
