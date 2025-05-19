import React, { useEffect } from 'react'
import SelectPaginate from '../SelectPaginate'
import Select from 'react-select'

function MakeHistoryForms({className, handleSubmit, itemHistories, handleInputChange, handleSelectChange, disableSubmit, items}) {

    const status = [
        {value: 'in use', label: 'in use' },
        {value: 'out', label: 'out' },
        {value: 'in service', label: 'in service' },
        {value: 'upgrade', label: 'upgrade' },
        {value: 'rusak', label: 'rusak' }
    ]

    return (
        <div className={`bg-white shadow-sm rounded-md font-inter overflow-hidden ${className}`}>
              <div className="wrapper p-3">
                <form onSubmit={handleSubmit}>
                    <div className={`user mb-2`}>
                      <label>User:</label>
                      <SelectPaginate
                      source={'user'}
                      isClearable={true}
                      selectValue={itemHistories.user || null}
                      selectName={'User'}
                      required={itemHistories.status?.value !== 'rusak'}
                      itemLabel={['name']}
                      handleSelectChange={handleSelectChange('user')}
                      isDisabled={itemHistories.status?.value !== 'in use' && itemHistories.status?.value !== 'out'}
                      />
                    </div>
                    <div className="status mb-2">
                      <label>Status:</label>
                      <Select
                        options={status}
                        value={itemHistories.status || null}
                        onChange={handleSelectChange('status')}
                        required
                      />
                    </div>
                    <div className="spek_upgrade mb-2">
                      <label htmlFor="">Spek Upgrade:</label>
                      <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                        <textarea 
                          value={itemHistories.spek_upgraded || ''}
                          onChange={handleInputChange('spek_upgraded')}
                          maxLength={255}
                          required={items && items.jenis_permintaan == 'perbaikan/upgrade'}
                          name="spek_upgraded" 
                          className="w-full border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                          placeholder='Spek Upgrade'
                        />
                      </div>
                    </div>
                    <div className="lokasi mb-4">
                      <label htmlFor="">Lokasi:</label>
                      <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                        <input  
                          type="text" 
                          value={itemHistories.lokasi || ''}
                          maxLength={80}
                          onChange={handleInputChange('lokasi')}
                          name="lokasi" 
                          className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                          placeholder='Lokasi'
                          required
                        />
                      </div>
                    </div>
                    <div className='flex justify-center'>
                      <button disabled={disableSubmit} className="bg-green-400 text-white me-6 py-2 w-2/5 rounded-xl disabled:bg-green-300" type='submit'>Submit</button>
                    </div>
                </form>
              </div>
            </div>
    )
}

export default MakeHistoryForms