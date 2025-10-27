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
            <div className="xs:px-0 md:px-4">
                <Back goHome={() => navigate('/billing/list-billing')}/>
                <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Create Billing</p>

                <div className="p-8 bg-white shadow-sm rounded-lg border">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* User Selection */}
                        <div className="mb-5 space-y-2">
                            <label className="font-semibold">User</label>
                            <SelectPaginate
                                source={'billing-getUser'}
                                handleSelectChange={user => setItems({...items, user})}
                                itemLabel={['EmpName' || 'name']}
                                selectName={'User'}
                                required={true}
                            />
                        </div>
                        
                        {/* Penanggung Jawab */}
                        <div className="mb-4">
                            <label className="font-semibold">Penanggung Jawab</label>
                            <div className="bg-white p-2 rounded-md border border-gray-300 mt-2">
                                <input 
                                    type="text"
                                    className="w-full p-2 placeholder:text-gray-400"
                                    placeholder="Masukkan Penanggung Jawab"
                                    onChange={e => setItems({...items, penanggung_jawab : e.target.value})}
                                    required
                                    maxLength={40}
                                />
                            </div>
                        </div>
                        
                        {/* Date Fields Grid */}
                        <div className="md:grid md:grid-cols-3 md:gap-x-4">
                            {/* Tanggal Berlangganan */}
                            <div className="mb-4">
                                <label className="font-semibold">Tanggal Berlangganan</label>
                                <div className="bg-white p-2 rounded-md border border-gray-300 mt-2">
                                    <input 
                                        type="date"
                                        className="w-full p-2 placeholder:text-gray-400"
                                        onChange={e => setItems({...items, tgl_berlangganan : e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            
                            {/* Tanggal Selesai Berlangganan */}
                            <div className="mb-4">
                                <label className="font-semibold">Tanggal Selesai</label>
                                <div className="bg-white p-2 rounded-md border border-gray-300 mt-2">
                                    <input 
                                        type="date"
                                        className="w-full p-2 placeholder:text-gray-400"
                                        onChange={e => setItems({...items, tgl_selesai_berlangganan : e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            
                            {/* Tanggal Pembayaran */}
                            <div className="mb-4">
                                <label className="font-semibold">Tanggal Pembayaran</label>
                                <div className="bg-white p-2 rounded-md border border-gray-300 mt-2">
                                    <input 
                                        type="date"
                                        className="w-full p-2 placeholder:text-gray-400"
                                        onChange={e => setItems({...items, tgl_pembayaran : e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Status and Biaya Grid */}
                        <div className="md:grid md:grid-cols-2 md:gap-x-4">
                            {/* Status */}
                            <div className="mb-4">
                                <label className="font-semibold">Status</label>
                                <div className="mt-2">
                                    <Select
                                        options={status}
                                        onChange={status => setItems({...items, status})}
                                        placeholder="Pilih Status"
                                        className="w-full"
                                        required
                                    />
                                </div>
                            </div>
                            
                            {/* Biaya */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center">
                                    <label className="font-semibold">Biaya</label>
                                    <span className="text-xs text-red-500">* Hanya Nomor</span>
                                </div>
                                <div className="bg-white p-2 rounded-md border border-gray-300 mt-2">
                                    <input 
                                        type="text"
                                        className="w-full p-2 placeholder:text-gray-400"
                                        placeholder="Masukkan Biaya"
                                        value={items.biaya || ''}
                                        onChange={e => setItems({...items, biaya : e.target.value.replace(/\D/g, "")})}
                                        maxLength={12}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Note */}
                        <div className="mb-4">
                            <label className="font-semibold">Note</label>
                            <div className="bg-white p-2 rounded-md border border-gray-300 mt-2">
                                <textarea 
                                    className="w-full min-h-fit p-2 placeholder:text-gray-400"
                                    placeholder="Masukkan Catatan"
                                    onChange={e => setItems({...items, note : e.target.value})}
                                    maxLength={225}
                                    rows="3"
                                    required 
                                />
                            </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex flex-col items-center justify-self-center mt-10 max-w-full w-[25rem] space-y-2 text-center">
                            <button
                                type="submit"
                                className="py-2 px-4 w-full rounded-lg font-medium bg-blue-500 hover:bg-blue-600 transition-color duration-200 text-white"
                            >
                                Submit
                            </button>
                            <button
                                type="button"
                                className="py-2 px-4 w-full rounded-lg font-medium border border-red-200 bg-red-50 hover:bg-red-100 transition-color duration-200 text-red-600"
                                onClick={() => setItems({
                                    user: null,
                                    penanggung_jawab: null,
                                    tgl_berlangganan: '',
                                    tgl_selesai_berlangganan: '',
                                    tgl_pembayaran: '',
                                    biaya: '',
                                    note: '',
                                })}
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

export default CreateBilling