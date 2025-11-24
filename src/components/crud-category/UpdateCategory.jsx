import React, { useEffect, useState } from 'react'
import { Page, Block } from 'framework7-react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/api'
import Back from '../component/Back'
import Layout from '../component/Layout'
import { DecryptID } from '../../helper/EncryptHelper'
import Swal from 'sweetalert2'
// [1] IMPORT KOMPONEN TAMBAHAN
import Loader from '../component/Loader'
import Transition from '../component/Transition'

function UpdateCategory() {
    const navigate = useNavigate()

    const [items, setItems] = useState({
        name: '',
        description: ''
    })
    const [decryptedId, setDecryptedId] = useState('')
    const [disabled, setDisabled] = useState(false)
    const { id } = useParams()

    // [2] STATE UNTUK LOADING
    const [loading, setLoading] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)

    useEffect(() => {
        const decryptedIds = DecryptID(id)
        setDecryptedId(decryptedIds)
        if (!decryptedIds) {
            navigate(-1)
        }
    }, [id, navigate])

    useEffect(() => {
        if (decryptedId) {
            fetchItems()
        }
    }, [decryptedId])

    const fetchItems = async () => {
        try {
            setLoading(true) // [3] MULAI LOADING
            const response = await api.get(`inventCategories-detail/${decryptedId}`)
            const data = response.data.data;
            setItems({
                name: data.data?.name,
                description: data.data?.description
            })
        } catch (error) {
            console.error(error)
        } finally {
            // [4] SELESAI LOADING & TAMPILKAN KONTEN (Dengan delay sedikit agar transisi halus)
            setTimeout(() => {
                setLoading(false);
                setContentVisible(true);
            }, 50)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (disabled) {
                return
            }
            setDisabled(true)
            await api.put(`inventCategories-update/${decryptedId}`, {
                name: items.name,
                description: items.description
            })
            
            Swal.fire({
                title: 'Berhasil!',
                text: 'Data kategori berhasil diperbarui',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
            navigate('/category/list-category')
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak dapat mengubah kategori',
                text:'Ada Kesalahan Dalam Sistem'
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
        fetchItems() 
    }
    
    return (
        <Layout title={'Update Category'}>
            <Block>
                <div className="xs:px-0 md:px-4">
                    <Back goHome={() => navigate('/category/list-category')} />
                    <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Update Category</p>
                    
                    {/* [5] TAMPILKAN LOADER JIKA LOADING TRUE */}
                    { loading && <Loader Class="mt-44"/> }

                    {/* [6] WRAP KONTEN UTAMA DENGAN TRANSITION */}
                    <Transition contentVisible={contentVisible}>
                        <div className="bg-white rounded-lg shadow-xl shadow-gray-200 border p-8">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-5">
                                    <label className='font-semibold'>Kategori</label>
                                    <div className='bg-white mt-2 p-3 rounded-md border-solid border-gray-300 border'>
                                        <input 
                                            type="text" 
                                            name="Nama" 
                                            value={items.name} 
                                            onChange={e => setItems({ ...items, name: e.target.value })}
                                            className="w-full p-3 border rounded placeholder:text-gray-400 placeholder:font"
                                            placeholder='Masukkan nama kategori'
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
                                            placeholder='Tambahkan deskripsi'
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-center justify-center mt-10 mx-auto max-w-full w-[25rem] space-y-2 text-center">
                                    <button 
                                        disabled={disabled} 
                                        type='submit' 
                                        className='w-full py-2 px-2 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 transition-colors duration-200 text-white disabled:bg-blue-300'
                                    >
                                        Update
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
                    </Transition>
                </div>
            </Block>
        </Layout>
    )
}

export default UpdateCategory