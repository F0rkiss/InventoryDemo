import React, { useState } from 'react'
import Select from 'react-select'

const ItemLimits = ({selectedOption, className, handleChange}) => {

    const selectOptions = [
        {value : 10, label: '10'},
        {value : 20, label: '20'},
        {value : 30, label: '30'},
        {value : 40, label: '40'},
        {value : 50, label: '50'}
      ]

  return (
    <>
    <Select value={selectedOption} className={`${className}`} options={selectOptions} onChange={handleChange} ></Select>
    </>
  )
}

export default ItemLimits