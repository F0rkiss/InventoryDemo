import React, { useEffect, useState } from 'react'
import Layout from '../component/Layout'
import { Block } from 'framework7-react'
import Back from '../component/Back'
import { useNavigate } from 'react-router-dom'
import SelectPaginate from '../component/SelectPaginate'
import Select from 'react-select'
import api from '../../api/api'
import Swal from 'sweetalert2'

function CreateBilling() {
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
    const status = [
        {value: 'aktif', label: 'Aktif'},
        {value: 'tidak aktif', label: 'Tidak Aktif'}
    ]

    const handleSubmit = async (e) => {
       e.preventDefault()
       try {
        const awal = new Date(items.tgl_berlangganan)
        const selesai = new Date(items.tgl_selesai_berlangganan)
        const pembayaran = new Date(items.tgl_pembayaran)

        if (awal >= selesai) {
            await Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: 'Tanggal Selesai Berlangganan Tidak Boleh Lebih Awal Dari Tanggal Berlangganan',
                confirmButtonColor: '#EF4444    ',
            })
            return
        } 

        if (awal > pembayaran || pembayaran >= selesai) {
            await Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: 'Pembayaran Harus Diantara Awal Berlangganan dan Selesai Berlangganan',
                confirmButtonColor: '#EF4444    ',
            })
            return
        }
        
        const response = await api.post('billing-create',{ 
            user_id : items.user?.value,
            penanggungJawab : items.penanggung_jawab,
            tanggal_berlangganan : items.tgl_berlangganan,
            tanggal_selesai_berlangganan : items.tgl_selesai_berlangganan,
            tanggal_pembayaran : items.tgl_pembayaran,
            status : items.status?.value,
            biaya : items.biaya,
            note : items.note
        })
        const data = response.data.data
        navigate('/billing/list-billing')
       } catch (error) {
        Swal.fire({
            icon:'error',
            title:'Tidak Dapat Membuat Billing',
            text:'Ada Kesalahan Dalam Sistem'
        })
       }
    }

    return (
    <Layout title={'Create Billing'}>
        <Block>
            <Back goHome={() => navigate('/billing/list-billing')}/>
            <div className="content bg-white shadow-sm p-3 rounded-md mt-3">
                <form onSubmit={handleSubmit}>
                    <div className='user-select mb-3'>
                        <label>User</label>
                        <SelectPaginate
                        source={'billing-getUser'}
                        handleSelectChange={user => setItems({...items, user})}
                        itemLabel={['EmpName' || 'name']}
                        selectName={'User'}
                        required={true}
                        />
                    </div>
                    <div className='pj-select mb-3'>
                        <label>Penanggung Jawab</label>
                        <div className='bg-white p-2 rounded-md border-solid border-gray-300 border text-gray-600 font-light font-inter'>
                        <input 
                            type="text"
                            className='w-full'
                            onChange={e => setItems({...items, penanggung_jawab : e.target.value})}
                            required
                            maxLength={40}
                            />
                        </div>
                    </div>
                    <div className="tgl-berlangganan mb-3">
                        <label>Tanggal Berlangganan</label>
                        <div className='bg-white p-2 rounded-md border-solid border-gray-300 border text-gray-400 font-light font-inter'>
                            <input 
                            type="date"
                            className='w-full '
                            onChange={e => setItems({...items, tgl_berlangganan : e.target.value})}
                            required
                            />
                        </div>
                    </div>
                    <div className="tgl-selesai-berlangganan mb-3">
                        <label>Tanggal Selesai Berlangganan</label>
                        <div className='bg-white p-2 rounded-md border-solid border-gray-300 border text-gray-400 font-light font-inter'>
                            <input 
                            type="date"
                            className='w-full '
                            onChange={e => setItems({...items, tgl_selesai_berlangganan : e.target.value})}
                            required
                            />
                        </div>
                    </div>
                    <div className="tgl-pembayaran mb-3">
                        <label>Tanggal Pembayaran</label>
                        <div className='bg-white p-2 rounded-md border-solid border-gray-300 border text-gray-400 font-light font-inter'>
                            <input 
                            type="date"
                            className='w-full '
                            onChange={e => setItems({...items, tgl_pembayaran : e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="status mb-3">
                        <label>Status</label>
                        <Select
                        options={status}
                        onChange={status => setItems({...items, status})}
                        required
                        />
                    </div>
                    <div className="biaya mb-3">
                        <label>Biaya</label>
                        <div className='bg-white p-2 rounded-md border-solid border-gray-300 border text-gray-600 font-light font-inter'>
                            <input 
                                type="text"
                                className='w-full '
                                value={items.biaya || ''}
                                onChange={e => setItems({...items, biaya : e.target.value.replace(/\D/g, "")})}
                                maxLength={12}
                                required
                                />
                        </div>
                    </div>
                    <div className="note mb-3">
                        <label>Note</label>
                        <div className='bg-white p-2 rounded-md border-solid border-gray-300 border text-gray-600 font-light font-inter mt-3'>
                            <textarea 
                            className='w-full h-16'
                            onChange={e => setItems({...items, note : e.target.value})}
                            required />
                        </div>
                    </div>
                    <div className="tombol">
                        <button type='submit' className='bg-cyan-400 text-white text-center p-2 rounded-md mt-3'>
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </Block>
    </Layout>
  )
}

export default CreateBilling