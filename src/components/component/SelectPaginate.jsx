import React, { useCallback } from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import api from '../../api/api';

/**
 * SelectPaginate Component
 * * Props Baru:
 * - searchParam: (String) Nama query param untuk pencarian. Contoh: 'search', 'q', 'name'.
 * Jika diisi, request akan menjadi: /url?search=keyword
 * Jika kosong (default), request tetap: /url/keyword (Legacy support)
 */
function SelectPaginate({ 
    source, 
    itemLabel, 
    handleSelectChange, 
    additional, 
    selectValue, 
    selectName, 
    required, 
    valueKey = 'id', 
    searchParam = null, // Prop baru untuk mengaktifkan Query Param Search
    maxMenuHeight = 250, // Default tinggi dropdown biar gak kepanjangan
    ...props 
}) {
  
  // Helper untuk akses nested property (misal: 'user.name')
  const getNestedProperty = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };
  
  const fetchOptions = async (search, page) => {
    try {
      let url = `/${source}`;
      let params = {
        cursor: page,
      };

      // --- LOGIC PENCARIAN BARU ---
      if (search) {
        if (searchParam) {
          // MODE 1: Query Param (Recommended) -> /source?search=keyword
          params[searchParam] = search;
        } else {
          // MODE 2: Path Param (Legacy) -> /source/keyword
          // Hanya dipakai jika prop 'searchParam' tidak diisi
          url = `${source}/${encodeURIComponent(search)}`;
        }
      }

      const response = await api.get(url, { params });
      const data = response.data.data;

      if (data && Array.isArray(data.data)) {
        return {
          options: data.data.map((item) => ({
            ...item,
            value: item[valueKey], 
            // Gabungkan label jika array, atau ambil langsung
            label: Array.isArray(itemLabel) 
              ? `${itemLabel.map((path) => getNestedProperty(item, path)).join(' - ')} ${additional || ''}`
              : getNestedProperty(item, itemLabel)
          })),
          hasMore: Boolean(data.next_cursor),
          additional: {
            page: data.next_cursor,
          },
        };
      } else {
        return { options: [], hasMore: false };
      }
    } catch (error) {
      console.error("SelectPaginate Error:", error);
      return { options: [], hasMore: false };
    }
  };

  const loadOptions = useCallback(
    async (search, prevOptions, { page }) => {
      return await fetchOptions(search, page);
    },
    [source, itemLabel, additional, valueKey, searchParam]
  );

  // Styling Tailwind custom untuk React-Select
  const selectClassNames = {
    control: ({ isFocused }) => `
      min-h-[42px] py-0.5 bg-gray-50 border rounded-lg shadow-sm transition-all
      ${isFocused ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'}
      hover:border-gray-400
    `,
    placeholder: () => 'text-gray-400 text-sm',
    input: () => 'text-gray-900 text-sm', // Pastikan input text terlihat
    singleValue: () => 'text-gray-900 text-sm',
    option: ({ isFocused, isSelected }) => `
      px-3 py-2 text-sm cursor-pointer
      ${isFocused ? 'bg-blue-50 text-blue-700' : ''}
      ${isSelected ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}
      active:bg-blue-600
    `,
    menu: () => 'mt-1 bg-white border border-gray-100 rounded-lg shadow-xl z-50', // z-50 biar di atas elemen lain
    menuList: () => 'p-1', // Padding container list
    noOptionsMessage: () => 'text-gray-500 p-3 text-sm text-center',
  };

  return (
    <div className="relative">
      <AsyncPaginate
        loadOptions={loadOptions}
        placeholder={`Cari atau pilih ${selectName}...`}
        onChange={handleSelectChange}
        additional={{ page: 1 }}
        debounceTimeout={500} // Tunggu user selesai ngetik 0.5s baru request API
        isSearchable={true}   // Memastikan user bisa mengetik
        value={selectValue}
        noOptionsMessage={() => 'Data tidak ditemukan'}
        required={required}
        classNames={selectClassNames}
        maxMenuHeight={maxMenuHeight} // Mengontrol tinggi dropdown (biar gak kepanjangan seperti di gambar)
        {...props}
      />
    </div>
  );
}

export default SelectPaginate;