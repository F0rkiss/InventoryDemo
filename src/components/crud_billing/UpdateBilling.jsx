import React, { useEffect, useState } from 'react'
import Layout from '../component/Layout'
import { Block } from 'framework7-react'
import Back from '../component/Back'
import { useNavigate, useParams } from 'react-router-dom'
import SelectPaginate from '../component/SelectPaginate'
import Select from 'react-select'
import api from '../../api/api'
import Swal from 'sweetalert2'
import { DecryptID } from '../../helper/EncryptHelper'

function UpdateBilling() {
    const navigate = useNavigate()
    const [items, setItems] = useState({
        user : null,
        penanggung_jawab: null,
        tgl_berlangganan: '',
        tgl_selesai_berlangganan: '',
        tgl_pembayaran: '',
        biaya: '',
        note: '',
    })
    const [disabled, setDisabled] = useState(false)
    const [decryptedId, setDecryptedId] = useState('')
    const {id} = useParams()
    const status = [
        {value: 'aktif', label: 'Aktif'},
        {value: 'tidak aktif', label: 'Tidak Aktif'}
    ]
    
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
        const response = await api.get(`billing-detail/${decryptedId}`)
        const data = response.data.data
        setItems({
            user  : data.user?.EmpName ? {value : data.user?.id, label : data.user?.EmpName} : null,
            penanggung_jawab : data.penanggungJawab,
            tgl_berlangganan : data.tanggal_berlangganan,
            tgl_selesai_berlangganan: data.tanggal_selesai_berlangganan,
            tgl_pembayaran : data.tanggal_pembayaran,
            biaya : data.biaya,
            status : {value : data.status, label: data.status},
            note : data.note
        })
    }

    const handleSubmit = async (e) => {
       e.preventDefault()
       try {
        const awal = new Date(items.tgl_berlangganan)
        const selesai = new Date(items.tgl_selesai_berlangganan)
        const pembayaran = new Date(items.tgl_pembayaran)

        if (awal > selesai) {
            await Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: 'Tanggal Selesai Berlangganan Tidak Boleh Lebih Awal Dari Tanggal Berlangganan',
                confirmButtonColor: '#EF4444    ',
            })
            return
        } 
        if (awal > pembayaran || pembayaran > selesai) {
            await Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: 'Pembayaran Harus Diantara Awal Berlangganan dan Selesai Berlangganan',
                confirmButtonColor: '#EF4444    ',
            })
            return
        }
        setDisabled(true)
        const response = await api.put(`billing-update/${decryptedId}`,{ 
            user_id : items.user?.value,
            penanggungJawab : items.penanggung_jawab,
            tanggal_berlangganan : items.tgl_berlangganan,
            tanggal_selesai_berlangganan : items.tgl_selesai_berlangganan,
            tanggal_pembayaran : items.tgl_pembayaran,
            status : items.status?.value,
            biaya : items.biaya,
            note : items.note
        })
        navigate(-1)
       } catch (error) {
        Swal.fire({
            icon:'error',
            title:'Tidak Dapat Mengupdate Billing',
            text:'Ada Kesalahan Dalam Sistem'
        })
       } finally {
        setDisabled(false)
       }
    }

    return (
    <Layout title={'Update Billing'}>
        <Block>
            <Back goHome={() => navigate(-1)}/>
            <div className='bg-white rounded shadow-sm p-3 mt-4'>
                <form onSubmit={handleSubmit}>
                    <div className="mb-5">
                        <label>User</label>
                        <SelectPaginate
                            source={'billing-getUser'}
                            handleSelectChange={user => setItems({...items, user})}
                            itemLabel={['EmpName' || 'name']}
                            selectName={'User'}
                            selectValue={items.user}
                            required={true}
                        />
                    </div>
                    
                    <div className="mb-5">
                        <label>Penanggung Jawab</label>
                        <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                            <input 
                                type="text"
                                className='w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light capitalize'
                                placeholder='Masukkan Penanggung Jawab'
                                value={items.penanggung_jawab || ''}
                                onChange={e => setItems({...items, penanggung_jawab : e.target.value})}
                                required
                                maxLength={40}
                            />
                        </div>
                    </div>
                    
                    <div className="mb-5">
                        <label>Tanggal Berlangganan</label>
                        <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                            <input 
                                type="date"
                                className='w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light'
                                value={items.tgl_berlangganan}
                                onChange={e => setItems({...items, tgl_berlangganan : e.target.value})}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="mb-5">
                        <label>Tanggal Selesai Berlangganan</label>
                        <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                            <input 
                                type="date"
                                className='w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light'
                                value={items.tgl_selesai_berlangganan}
                                onChange={e => setItems({...items, tgl_selesai_berlangganan : e.target.value})}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="mb-5">
                        <label>Tanggal Pembayaran</label>
                        <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                            <input 
                                type="date"
                                className='w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light'
                                value={items.tgl_pembayaran}
                                onChange={e => setItems({...items, tgl_pembayaran : e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <div className="mb-5">
                        <label>Status</label>
                            <Select
                                options={status}
                                value={items.status}
                                onChange={status => setItems({...items, status})}
                                placeholder="Pilih Status"
                                className="w-full"
                                required
                            />
                    </div>
                    
                    <div className="mb-5">
                        <div className="flex justify-between">
                            <label>Biaya</label>
                            <p className='text-xs text-red-500 mt-1'>* Hanya Menerima Nomor</p>
                        </div>
                        <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                            <input 
                                type="text"
                                className='w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light'
                                placeholder='Masukkan Biaya'
                                value={items.biaya}
                                onChange={e => setItems({...items, biaya : e.target.value.replace(/\D/g, "")})}
                                maxLength={12}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="mb-5">
                        <label>Note</label>
                        <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                            <textarea 
                                className='w-full h-16 p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light'
                                placeholder='Masukkan Catatan'
                                value={items.note}
                                onChange={e => setItems({...items, note : e.target.value})}
                                required 
                            />
                        </div>
                    </div>
                    
                    <div className="flex">
                        <button disabled={disabled} type='submit' className="bg-cyan-400 text-white p-2 rounded w-1/2 me-3">
                            Update Billing
                        </button>
                        <button type='button' onClick={fetchItems} className="bg-red-400 text-white p-2 rounded w-1/2">
                            Reset
                        </button>
                    </div>
                </form>
            </div>
        </Block>
    </Layout>
  )
}

export default UpdateBilling