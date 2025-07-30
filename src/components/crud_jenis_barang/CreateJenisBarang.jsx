import React, { useEffect, useState } from 'react'
import { Page, Block } from 'framework7-react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/api'
import Back from '../component/Back'
import Layout from '../component/Layout'
import Swal from 'sweetalert2'
import useMenuAccess from '../../hooks/useMenuAccess'

function CreateJenisBarang() {
    const [items, setItems] = useState({
        name: '',
        description: ''
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
            const response = await api.post('inventJenisBarang-create', {
                name : items.name,
                description: items.description
            })
            Swal.fire({
                title: 'Jenis barang berhasil dibuat!',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
            navigate('/jenis-barang/list-jenis-barang')
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak dapat membuat jenis barang',
                text:'Ada Kesalahan Dalam Sistem'
            })
            setItems({
                name : '',
                description : ''
            })
        } finally {
            setDisabled(false)
        }
    }

    const resetValue = () => {
        setItems({
            name: '',
            description: ''
        })
    }

    return (
    <Layout title={'Create Jenis Barang'}>
        <Block>
            <Back goHome={() => navigate('/jenis-barang/list-jenis-barang')} />
            <div className="p-6 mt-6 bg-white shadow-sm rounded-lg">
                <form onSubmit={handleSubmit}>
                    <div className="mb-5">
                        <label className='font-semibold'>Item Type</label>
                        <div className='bg-white p-2 rounded-md border-solid border-gray-300 border mt-2'>
                        <input 
                            type="text" 
                            name="Nama" 
                            value={items.name} 
                            onChange={e => setItems({ ...items, name: e.target.value })}
                            className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light "
                            placeholder='Nama Jenis Barang'
                            required
                        />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className='font-semibold'>Description</label>
                        <div className='bg-white p-2 rounded-md border border-gray-300 border mt-2'>
                        <input 
                            type="text" 
                            name="description" 
                            value={items.description} 
                            onChange={e => setItems({ ...items, description: e.target.value })}
                            className="w-full p-2 placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                            placeholder='Deskripsi'
                            required
                        />
                        </div>
                        {/* <p className='text-xs text-red-500 mt-1 ms-1'>Kode Hanya Boleh 2 Karakter dan Tidak Boleh Nomor</p> */}
                    </div>
                    <div className="flex justify-center mt-6">
                        <button disabled={disabled} type='submit' className='w-4/12 py-2 rounded-md bg-teal-400 text-white me-2'>Submit</button>
                        <button className='w-4/12 py-2 rounded-md bg-red-400 text-white' onClick={resetValue} type='button'>Reset</button>
                    </div>
                </form>
            </div>
        </Block>
    </Layout>
    )
}

export default CreateJenisBarang;