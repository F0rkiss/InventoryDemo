import React, { useEffect, useState } from 'react'
import { Page, Block } from 'framework7-react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/api'
import Back from '../component/Back'
import Layout from '../component/Layout'
import Swal from 'sweetalert2'

function CreateTypeRequest() {
    const navigate = useNavigate()

    const [items, setItems] = useState({
        name: '',
        jenis: '',
        description: ''
    })  
      
    const [disabled, setDisabled] = useState(false)

    const handleSubmit = async(e) =>{
        e.preventDefault();
        try {
            if (disabled) {
                return
            }
            setDisabled(true)            
            const response = await api.post('inventTypeRequest-create', {
                name : items.name,
                jenis : items.jenis,
                description: items.description
            })
            Swal.fire({
                title: 'Type request berhasil dibuat!',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
            navigate('/type-request/list-type-request')
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak dapat membuat type request',
                text:'Ada Kesalahan Dalam Sistem'
            })
            setItems({
                name : '',
                jenis : '',
                description : ''
            })
        } finally {
            setDisabled(false)
        }
    }

    const resetValue = () => {
        setItems({
            name: '',
            jesnis: '',
            description: ''
        })
    }

    return (
    <Layout title={'Create Type Request'}>
        <Block>
            <Back goHome={() => navigate('/type-request/list-type-request')} />
            <div className="p-6 mt-6 bg-white shadow-sm rounded-lg">
                <form onSubmit={handleSubmit}>
                    <div className="mb-5">
                        <label className='font-semibold'>Name</label>
                        <div className='bg-white p-2 rounded-md border-solid border-gray-300 border mt-2'>
                        <input 
                            type="text" 
                            name="Nama" 
                            value={items.name} 
                            onChange={e => setItems({ ...items, name: e.target.value })}
                            className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light "
                            placeholder='Nama Tipe Request'
                            required
                        />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className='font-semibold'>Jenis</label>
                        <div className='bg-white p-2 rounded-md border border-gray-300 border mt-2'>
                        <input 
                            type="text" 
                            name="jenis" 
                            value={items.jenis} 
                            onChange={e => setItems({ ...items, jenis: e.target.value })}
                            className="w-full p-2 placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                            placeholder='Jenis'
                            required
                        />
                        </div>
                        {/* <p className='text-xs text-red-500 mt-1 ms-1'>Kode Hanya Boleh 2 Karakter dan Tidak Boleh Nomor</p> */}
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
                            placeholder='Description'
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

export default CreateTypeRequest;