import React, { useState, useCallback } from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import api from '../../api/api';

function SelectPaginate({ source, itemLabel, handleSelectChange, additional, selectValue, selectName, required, valueKey = 'id', ...props }) {
  
  const getNestedProperty = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };
  
  const fetchOptions = async (search, page) => {
    try {
      const response = await api.get(search ? `${source}/${search}` : `/${source}`, {
        params: {
          cursor: page,
        },
      });

      const data = response.data.data;
      if (data && Array.isArray(data.data)) {
        return {
          options: data.data.map((item) => ({
            ...item, // DIUBAH: Sertakan semua properti dari item (termasuk is_stock)
            value: item[valueKey], // Pastikan 'value' ada untuk react-select
            label: `${itemLabel.map((path) => getNestedProperty(item, path)).join(' - ')} ${additional || ''}`,
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
      return { options: [], hasMore: false };
    }
  };

  const loadOptions = useCallback(
    async (search, prevOptions, { page }) => {
      try {
        return await fetchOptions(search, page);
      } catch (error) {
        return { options: [], hasMore: false };
      }
    },
    [source, itemLabel, additional, valueKey]
  );

  // Define the Tailwind classes for each part of the select component
  const selectClassNames = {
    control: ({ isFocused }) => `
      py-1 bg-gray-50 border rounded-2xl
      ${isFocused ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'}
      hover:border-gray-400
    `,
    placeholder: () => 'text-gray-500',
    input: () => 'text-gray-900',
    option: ({ isFocused, isSelected }) => `
      rounded-md
      ${isFocused ? 'bg-blue-100' : ''}
      ${isSelected ? 'bg-blue-500 text-white' : 'bg-white'}
      hover:bg-blue-100
    `,
    menu: () => 'mt-1 p-2 bg-white rounded-md shadow-lg',
    noOptionsMessage: () => 'text-gray-500 p-2',
  };

  return (
    <div>
      <AsyncPaginate
        loadOptions={loadOptions}
        placeholder={`Pilih ${selectName}`}
        onChange={handleSelectChange}
        additional={{ page: 1 }}
        debounceTimeout={500}
        isSearchable={true}
        value={selectValue}
        noOptionsMessage={() => 'Tidak Ada Pilihan'}
        required={required}
        classNames={selectClassNames}
        {...props}
      />
    </div>
  );
}

export default SelectPaginate;