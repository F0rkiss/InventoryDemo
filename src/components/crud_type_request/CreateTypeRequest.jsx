import React, { useEffect, useState } from 'react'
import { Page, Block } from 'framework7-react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/api'
import Back from '../component/Back'
import Layout from '../component/Layout'
import Swal from 'sweetalert2'
import SelectPaginate from '../component/SelectPaginate'

function CreateTypeRequest() {
    const navigate = useNavigate()

    const [items, setItems] = useState({
        name: '',
        jenis: '',
        description: '',
        is_stok: ''
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
                description: items.description,
                is_stok: items.is_stok
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
            jenis: '',
            description: '',
            is_stok: ''
        })
    }

    return (
    <Layout title={'Create Type Request'}>
        <Block>
            <div className="xs:px-0 md:px-4">
                <Back goHome={() => navigate('/type-request/list-type-request')} />
                <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Create Type Request</p>
                
                <div className="bg-white rounded-lg shadow-xl shadow-gray-200 border p-8">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-5">
                            <label className='font-semibold'>Name</label>
                            <div className='bg-white mt-2 p-3 rounded-md border-solid border-gray-300 border'>
                                <input 
                                    type="text" 
                                    name="Nama" 
                                    value={items.name} 
                                    onChange={e => setItems({ ...items, name: e.target.value })}
                                    className="w-full p-3 border rounded placeholder:text-gray-400 placeholder:font"
                                    placeholder='Nama Type Request'
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-5">
                            <label className='font-semibold'>Jenis</label>
                            <div className='bg-white mt-2 p-3 rounded-md border border-gray-300 border'>
                                <input 
                                    type="text" 
                                    name="jenis" 
                                    value={items.jenis} 
                                    onChange={e => setItems({ ...items, jenis: e.target.value })}
                                    className="w-full p-3 border rounded placeholder:text-gray-400 placeholder:font"
                                    placeholder='Jenis'
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-5">
                            <label className='font-semibold'>Description</label>
                            <div className='bg-white mt-2 p-3 rounded-md border border-gray-300 border'>
                                <input 
                                    type="text" 
                                    name="description" 
                                    value={items.description} 
                                    onChange={e => setItems({ ...items, description: e.target.value })}
                                    className="w-full p-3 border rounded placeholder:text-gray-400 placeholder:font"
                                    placeholder='Description'
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-5">
                            <label className='font-semibold'>Diambil Dari Stok</label>
                            <div className='bg-white mt-2 p-3 rounded-md border border-gray-300 border'>
                                <select
                                    value={items.is_stok}
                                    onChange={e => setItems({ ...items, is_stok: e.target.value })}
                                    className="w-full p-3 border rounded appearance-none bg-white placeholder:text-gray-400 placeholder:font"
                                    required
                                >
                                    <option value="" disabled>Pilih status stok</option>
                                    <option value="ya">Iya</option>
                                    <option value="tidak">Tidak</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center mt-10 mx-auto max-w-full w-[25rem] space-y-2 text-center">
                            <button 
                                disabled={disabled} 
                                type='submit' 
                                className='w-full py-2 px-2 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 transition-colors duration-200 text-white disabled:bg-blue-300'
                            >
                                Submit
                            </button>
                            <button 
                                className='w-full py-2 px-2 rounded-lg font-medium border border-red-200 bg-red-50 hover:bg-red-100 transition-colors duration-200 text-red-600' 
                                onClick={resetValue} 
                                type='button'
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Block>
    </Layout>
    )
}

export default CreateTypeRequest;