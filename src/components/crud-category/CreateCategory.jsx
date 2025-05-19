import React, { useEffect, useState } from 'react'
import CustomNavbar from '../component/CustomNavbar'
import { Page, Block } from 'framework7-react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/api'
import Back from '../component/Back'
import Layout from '../component/Layout'
import Swal from 'sweetalert2'


function CreateCategory() {
    const [items, setItems] = useState({
        name: '',
        kode: ''
      })  
      const [disabled, setDisabled] = useState(false)
      const navigate = useNavigate()
    
    
      const handleSubmit = async(e) =>{
        e.preventDefault();
        try {
            if (disabled) {
                return
            }
            setDisabled(true)            
            const response = await api.post(`/category`, {
                name : items.name,
                kode: items.kode.toUpperCase(),
            })
            navigate('/category/list-category')
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Membuat Excel',
                text:'Ada Kesalahan Dalam Sistem'
            })
            setItems({
                name : '',
                kode : ''
            })
        } finally {
            setDisabled(false)
        }
      }
      const resetValue = () => {
        setItems({
            name: '',
            kode: ''
        })
      }
    
      return (
        <Layout title={'Create Category'}>
            <Block>
                <Back goHome={() => navigate('/category/list-category')} />
                <div className="p-6 mt-6 bg-white shadow-sm rounded">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-5">
                            <label>Nama Kategori :</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                            <input 
                                type="text" 
                                name="Nama" 
                                value={items.name} 
                                onChange={e => setItems({ ...items, name: e.target.value })}
                                className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light "
                                maxLength={40}
                                placeholder='Nama Kategori'
                                required
                            />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label>Kode Kategori :</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                            <input 
                                type="text" 
                                name="Kode" 
                                value={items.kode} 
                                onChange={e => {
                                    const value = e.target.value.replace(/[^a-zA-Z]/g, '');
                                    setItems({ ...items, kode: value });
                                }}
                                className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light uppercase"
                                maxLength={2}
                                placeholder='Kode'
                                required
                            />
                            </div>
                            <p className='text-xs text-red-500 mt-1 ms-1'>Kode Hanya Boleh 2 Karakter dan Tidak Boleh Nomor</p>
                        </div>
                        <div className="flex justify-center">
                        <button disabled={disabled} type='submit' className='w-3/12 py-2 rounded-lg bg-teal-400 text-white me-2'>Submit</button>
                        <button className='w-3/12 py-2 rounded-lg bg-red-400 text-white' onClick={resetValue} type='button'>Reset</button>
                        </div>
                    </form>
                </div>
            </Block>
        </Layout>
      )
}

export default CreateCategory