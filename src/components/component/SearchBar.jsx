import React from 'react'
import { Block } from 'framework7-react'

function SearchBar({values, disable, onSearch, onChange, className, withBlock = true,}) {

  const handleChange = (e) => {
    onChange(e.target.value)
  }

  return (
    <>
    { withBlock ?
      (<Block>
        <div className={`bg-white px-3 py-2 rounded-full flex items-center drop-shadow-md font-inter ${className}`}>
          <input 
            type='text' 
            placeholder='Search' 
            className='w-full text-center placeholder-gray-500 border-none outline-none' 
            value={values}
            onChange={handleChange}
            disabled={disable}
            id='search-bar'
          />
          <label htmlFor='search-bar'>
            <i className='bx bx-search text-2xl -translate-x-1 text-gray-500'></i>
          </label>
        </div>
      </Block>) :
      (
        <div className={`bg-white px-3 py-2 rounded-full flex items-center drop-shadow-md font-inter ${className}`}>
          <input 
            type='text' 
            placeholder='Search' 
            className='w-full text-center placeholder-gray-500 border-none outline-none' 
            value={values}
            onChange={handleChange}
            disabled={disable}
            id='search-bar'
          />
          <label htmlFor='search-bar'>
            <i className='bx bx-search text-2xl -translate-x-1 text-gray-500'></i>
          </label>
        </div>
      )}
    </>
  )
}

export default SearchBar