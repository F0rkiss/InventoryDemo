import React, { useEffect, useState } from 'react'
import CustomNavbar from '../component/CustomNavbar'
import { Page, Block } from 'framework7-react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/api'
import Back from '../component/Back'
import Layout from '../component/Layout'
import { DecryptID } from '../../helper/EncryptHelper'
import Swal from 'sweetalert2'
// [1] Import Loading & Transition
import Loader from '../component/Loader'
import Transition from '../component/Transition'

function UpdateTypeRequest() {

    const [items, setItems] = useState({
        name: '',
        jenis: '',
        description: '',
        is_stok: ''
    })
    const [decryptedId, setDecryptedId] = useState('')
    const [disabled, setDisabled] = useState(false)
    const [originalItems, setOriginalItems] = useState(null)

    // [2] State Loading
    const [loading, setLoading] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)

    const navigate = useNavigate()
    const { id } = useParams()

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
            setLoading(true) // [3] Mulai Loading
            const response = await api.get(`inventTypeRequest-detail/${decryptedId}`)
            const data = response.data.data;
            const formatted = {
                name: data.name,
                jenis: data.jenis,
                description: data.description,
                is_stok: data.is_stok
            }
            setItems(formatted)
            setOriginalItems(formatted)
        } catch (error) {
            // handle error
        } finally {
            // [4] Selesai Loading
            setTimeout(() => {
                setLoading(false);
                setContentVisible(true);
            }, 50)
        }
    }
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (disabled) return;
    
        const isChanged = JSON.stringify(items) !== JSON.stringify(originalItems)
        if (!isChanged) {
            Swal.fire({
                icon: 'info',
                title: 'Tidak ada perubahan',
                text: 'Data masih sama seperti sebelumnya',
                timer: 1500,
                showConfirmButton: false
            })
            navigate('/type-request/list-type-request')
            return
        }
    
        try {
            setDisabled(true)
            await api.put(`inventTypeRequest-update/${decryptedId}`, items)
            Swal.fire({
                title: 'Type request berhasil diubah!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            })
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Tidak dapat mengubah tipe request',
                text: 'Ada Kesalahan Dalam Sistem'
            })
        } finally {
            setDisabled(false)
        }
    }
    
    const resetValue = () => {
        fetchItems()
    }
    
    return (
        <Layout title={'Update Type Request'}>
            <Block>
                <div className="xs:px-0 md:px-4">
                    <Back goHome={() => navigate('/type-request/list-type-request')} />
                    <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Update Type Request</p>
                    
                    {/* [5] Loader */}
                    { loading && <Loader Class="mt-44"/> }

                    {/* [6] Transition */}
                    <Transition contentVisible={contentVisible}>
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
                                            placeholder='Nama Tipe Request'
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mb-5">
                                    <label className='font-semibold'>Jenis</label>
                                    <div className='bg-white mt-2 p-3 rounded-md border-solid border-gray-300 border'>
                                        <input 
                                            type="text" 
                                            name="Jenis" 
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
                                            placeholder='Deskripsi'
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

export default UpdateTypeRequest;