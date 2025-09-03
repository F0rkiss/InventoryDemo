import React, { useState } from 'react'
import { Block } from 'framework7-react'

function SearchBar({
  values, disable, onSearch, onChange, className, withBlock = true,
}) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    onChange(e.target.value);
  }

  // Show shadow if focused or value exists
  const showShadow = isFocused || !!values;

  const containerClass = `bg-white min-w-[5rem] lg:w-[32rem] px-3 py-2 rounded-full flex items-center border hover:bg-gray-50 transition-color duration-200 font-inter  ${className || ''}`;

  const blockContent = (
    <div className={containerClass}>
      <input 
        type='text' 
        placeholder='Search' 
        className='w-full text-center placeholder-gray-500 border-none outline-none'
        value={values}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disable}
        id='search-bar'
      />
      <label htmlFor='search-bar'>
        <i className='bx bx-search text-2xl -translate-x-1 text-gray-500'></i>
      </label>
    </div>
  );

  return (
    <div className='my-2 mx-2'>
      {blockContent}
    </div>
  );
}

export default SearchBar;
