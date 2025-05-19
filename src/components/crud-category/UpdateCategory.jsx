import React, { useEffect, useState } from 'react'
import CustomNavbar from '../component/CustomNavbar'
import { Page, Block } from 'framework7-react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/api'
import Back from '../component/Back'
import Layout from '../component/Layout'
import { DecryptID } from '../../helper/EncryptHelper'
import Swal from 'sweetalert2'


function UpdateCategory() {

    const [items, setItems] = useState({
        name: '',
        kode: ''
    })
    const [decryptedId, setDecryptedId] = useState('')
    const [disabled, setDisabled] = useState(false)
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
            const response = await api.get(`/category/${decryptedId}`)
            const data = response.data.data;
            setItems({
                name: data.name,
                kode: data.kode
            })
        } catch (error) {

        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (disabled) {
                return
            }
            setDisabled(true)
            const response = await api.put(`/category/${decryptedId}`, {
                name: items.name,
                kode: items.kode.toUpperCase(),
            })
            navigate('/category/list-category')
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Mengupdate Kategori',
                text:'Ada Kesalahan Dalam Sistem'
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
        <Layout title={'Update Category'}>
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
                                    maxLength={40}
                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
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
                            <button disabled={disabled} type='submit' className='w-3/12 py-2 rounded-lg bg-cyan-400 text-white me-6'>Submit</button>
                            <button className='w-3/12 py-2 rounded-lg bg-red-400 text-white' onClick={resetValue} type='button'>Reset</button>
                        </div>
                    </form>
                </div>
            </Block>
        </Layout>
    )
}

export default UpdateCategory