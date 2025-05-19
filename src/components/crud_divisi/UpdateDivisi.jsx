import React, { useEffect, useState, useP } from 'react'
import CustomNavbar from '../component/CustomNavbar'
import { Page, Block } from 'framework7-react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/api'
import Back from '../component/Back'
import Layout from '../component/Layout'
import { DecryptID } from '../../helper/EncryptHelper'
import Swal from 'sweetalert2'


function UpdateDivisi() {
    const [items, setItems] = useState({
        name: '',
        kode: ''
    })

    const [decryptedId, setDecryptedId] = useState('')
    const [disabled, setDisabled] = useState(false)

    const navigate = useNavigate()
    const { id } = useParams();

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
        const response = await api.get(`/divisi/${decryptedId}`)
        const data = response.data.data
        setItems({
            name: data.name,
            kode: data.kode
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (disabled) {
                return
            }
            setDisabled(true)
            if (items.kode.length !== 3) {
                Swal.fire({
                    title: `Terlalu Pendek`,
                    icon: 'error',
                });
                return;
            }
            const response = await api.put(`/divisi/${decryptedId}`, {
                name: items.name,
                kode: items.kode.toUpperCase(),
            })
            navigate('/divisi/list-divisi')
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Mengupdate Divisi',
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
        <Layout title={'Update Divisi'}>
            <Block >
                <Back goHome={() => navigate('/divisi/list-divisi')} />
                <div className="p-6 mt-6 bg-white shadow-sm rounded">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-5">
                            <label>Nama Divisi :</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                                <input
                                    type="text"
                                    name="Nama"
                                    value={items.name}
                                    maxLength={45}
                                    onChange={e => setItems({ ...items, name: e.target.value })}
                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light "
                                    placeholder='Nama Divisi'
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label>Kode Divisi :</label>
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
                                    maxLength={3}
                                    placeholder='Kode'
                                    required
                                />
                            </div>
                            <p className='text-xs text-red-500 mt-1 ms-1'>Kode Hanya Boleh 3 Karakter dan Tidak Boleh Nomor</p>
                        </div>
                        <div className="flex justify-center">
                            <button type='submit' disabled={disabled} className='w-3/12 py-2 rounded-lg bg-teal-400 text-white me-2'>Submit</button>
                            <button className='w-3/12 py-2 rounded-lg bg-red-400 text-white' onClick={resetValue} type='button'>Reset</button>
                        </div>
                    </form>
                </div>
            </Block>
        </Layout>
    )
}

export default UpdateDivisi