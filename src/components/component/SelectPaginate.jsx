import React, { useState, useCallback, useEffect } from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import api from '../../api/api';

function SelectPaginate({ source, itemLabel, handleSelectChange, additional, selectValue, selectName, required, valueKey = 'id', isMulti = false, isClearable, id ,isDisabled, components, maxMenuHeight, className }) {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
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
      setSearchTerm(data) 
      if (data && Array.isArray(data.data)) {
        return {
          options: data.data.map((item) => ({
            value: item[valueKey],
            label: `${itemLabel.map((path) => getNestedProperty(item, path)).join(' - ')} ${additional || ''}`,
          })),
          hasMore: Boolean(data.next_cursor),
          additional: {
            page: data.next_cursor,
          },
        };
      } else {
        return {
          options: [],
          hasMore: false,
        };
      }
    } catch (error) {
      return {
        options: [],
        hasMore: false,
      };
    }
  };

  const loadOptions = useCallback(
    async (search, prevOptions, { page }) => {
      setLoading(true);
      try {
        const result = await fetchOptions(search, page);
        setLoading(false);
        return result;
      } catch (error) {
        setLoading(false);
        return {
          options: [],
          hasMore: false,
        };
      }
    },
    [source, itemLabel, additional, valueKey]
  );

//   const customStyles = {
//   control: (provided, state) => ({
//     ...provided,
//     backgroundColor: 'white',
//     padding: '0.1rem',
//     borderRadius: '0.375rem',
//     border: '1px solid #D1D5DB', // border-solid border-gray-500 border (1px solid gray-500)
//     boxShadow: 'none',
//     '&:hover': {
//       borderColor: '#6b7280', // Maintain border color on hover
//     },
//     // Optional: Adjust minHeight if needed to match original input size
//     minHeight: '42px', // This value might need adjustment based on your specific font size and line height
//   }),
//   // You might also need to adjust other parts to ensure consistent styling
//   // For example, if you want to remove default padding from the valueContainer:
//   valueContainer: (provided) => ({
//     ...provided,
//     padding: '0 8px', // Adjust as needed, default is often '2px 8px'
//   }),
//   input: (provided) => ({
//     ...provided,
//     margin: '0', // Remove default margin from the input element itself
//   }),
//   // If you also want to style the placeholder text:
//   placeholder: (provided) => ({
//     ...provided,
//     color: '#6B7280', // Approximate color for gray-500 text
//   }),
//   // To ensure the menu opens correctly above other content
//   menu: (provided) => ({
//     ...provided,
//     zIndex: 9999,
//   }),
// };


  return (
    <div >
      <AsyncPaginate
        maxMenuHeight={maxMenuHeight}
        loadOptions={loadOptions}
        placeholder={`Cari ${selectName}...`}
        onChange={handleSelectChange}
        additional={{ page: 1 }}
        isClearable={isClearable}
        debounceTimeout={500}
        isSearchable={true}
        value={selectValue}
        components={components}
        noOptionsMessage={() => 'Tidak Ada Pilihan'}
        required={required}
        isDisabled={isDisabled}
        id={id}
        isMulti={isMulti}
        // styles={customStyles} 
      />
    </div>
  );
}

export default SelectPaginate;
