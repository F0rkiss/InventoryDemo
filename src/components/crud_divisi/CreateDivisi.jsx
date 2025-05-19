import React, { useEffect, useState } from 'react'
import CustomNavbar from '../component/CustomNavbar'
import { Page, Block } from 'framework7-react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/api'
import Back from '../component/Back'
import Swal from 'sweetalert2'
import Layout from '../component/Layout'


function CreateDivisi() {
    const [items, setItems] = useState({
        name: '',
        kode: ''
      })  
      const [disabled, setDisabled] = useState(false)

      const navigate = useNavigate()
    
    
      const handleSubmit = async(e) =>{
        e.preventDefault();
        try {
            if (disabled) {
                return
            }
            setDisabled(true)
            if (items.kode.length !== 3) {
                Swal.fire({
                  title: `Kode Divisi Terlalu Pendek`,
                  icon: 'error',
                });
                return; 
              }

            const response = await api.post(`/divisi`, {
                name : items.name,
                kode: items.kode.toUpperCase(),
            })
        navigate('/divisi/list-divisi')
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Membuat Divisi',
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
        <Layout title={'Create Divisi'}>
            <Block>
                <Back goHome={() => navigate('/divisi/list-divisi')} />
                <div className=" mt-6 p-6 bg-white shadow-sm rounded">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-5">
                            <label>Nama Divisi :</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                            <input 
                                type="text" 
                                name="Nama" 
                                maxLength={45}
                                value={items.name} 
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
                        <button disabled={disabled} type='submit' className='w-3/12 py-2 rounded-lg bg-teal-400 text-white me-2'>Submit</button>
                        <button className='w-3/12 py-2 rounded-lg bg-red-400 text-white' onClick={resetValue} type='button'>Reset</button>
                        </div>
                    </form>
                </div>
            </Block>
        </Layout>
      )
}

export default CreateDivisi