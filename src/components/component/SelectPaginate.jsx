import React, { useState, useCallback, useEffect } from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import api from '../../api/api';

function SelectPaginate({ source, itemLabel, handleSelectChange, additional, selectValue, selectName, required, valueKey = 'id', isMulti = false, isClearable, id ,isDisabled, components, maxMenuHeight }) {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const getNestedProperty = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };
  
  const fetchOptions = async (search, page) => {
    try {
      const response = await api.get(search ? `${source}/search/${search}` : `/${source}`, {
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


  return (
    <div  >
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
        
      />
    </div>
  );
}

export default SelectPaginate;
