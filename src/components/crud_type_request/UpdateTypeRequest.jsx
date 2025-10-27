import React, { useEffect, useState } from 'react'
import CustomNavbar from '../component/CustomNavbar'
import { Page, Block } from 'framework7-react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/api'
import Back from '../component/Back'
import Layout from '../component/Layout'
import { DecryptID } from '../../helper/EncryptHelper'
import Transition from '../component/Transition';
import Swal from 'sweetalert2'

function UpdateTypeRequest() {

    const [items, setItems] = useState({
        name: '',
        jenis: '',
        description: '',
        is_stok: ''
    })
    const [decryptedId, setDecryptedId] = useState('')
    const [disabled, setDisabled] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)
    const [originalItems, setOriginalItems] = useState(null)

    const navigate = useNavigate()
    const { id } = useParams()

    useEffect(() => {
        const decryptedIds = DecryptID(id)
        setDecryptedId(decryptedIds)
        if (!decryptedIds) {
            navigate(-1)
        }
    }, [id])

    useEffect(() => {
        if (decryptedId) {
            fetchItems()
        }
    }, [decryptedId])

    const fetchItems = async () => {
        try {
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
            setTimeout(() => setContentVisible(true), 50)
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
        setItems({
            name: '',
            jenis: '',
            description: '',
            is_stok: ''
        })
    }
    return (
        <Layout title={'Update Type Request'}>
            <Block>
                <Back goHome={() => navigate('/type-request/list-type-request')} />
                <Transition contentVisible={contentVisible}>
                    <div className="p-6 mt-6 bg-white shadow-sm rounded">
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
                            <div className="mb-5">
                                <label className='font-semibold'>Jenis</label>
                                <div className='bg-white p-2 rounded-md border-solid border-gray-300 border mt-2'>
                                <input 
                                    type="text" 
                                    name="Jenis" 
                                    value={items.jenis} 
                                    onChange={e => setItems({ ...items, jenis: e.target.value })}
                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                    placeholder='Jenis'
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
                            </div>
                            <div className="mb-4">
                            <label className='font-semibold'>Diambil Dari Stok</label>
                                <div className='bg-white p-2 rounded-md border border-gray-300 border mt-2'>
                                    <select
                                    value={items.is_stok}
                                    onChange={e => setItems({ ...items, is_stok: e.target.value })}
                                    className="w-full p-2 border rounded appearance-none placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                    required
                                    >
                                    <option value="" disabled>Pilih status stok</option>
                                    <option value="ya">Iya</option>
                                    <option value="tidak">Tidak</option>
                                    <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-center mt-6">
                                <button disabled={disabled} type='submit' className='w-4/12 py-2 rounded-md bg-teal-400 text-white me-2'>Submit</button>
                                <button className='w-4/12 py-2 rounded-md bg-red-400 text-white' onClick={resetValue} type='button'>Reset</button>
                            </div>
                        </form>
                    </div>
                </Transition>
            </Block>
        </Layout>
    )
}

export default UpdateTypeRequest;