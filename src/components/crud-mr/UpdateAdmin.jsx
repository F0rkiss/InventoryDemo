import React, { useEffect, useState } from 'react'
import { useParams , useNavigate, Navigate } from 'react-router-dom'
import api from '../../api/api'
import Layout from '../component/Layout'
import { Block } from 'framework7-react'
import Select from 'react-select'
import Back from '../component/Back'
import SelectPaginate from '../component/SelectPaginate'
import MultiUpload from '../component/MultiUpload'


function UpdateAdmin() {

    const [items, setItems] = useState({
        jenis_permintaan : null,
        description : '',
        keperluan : '',
        bukti : [],
        barang : [],
    })
    const [role, setRole] = useState('')
    const navigate = useNavigate()
    const {id} = useParams()
    const [loading, setLoading] = useState(true)
    const baseURL = import.meta.env.VITE_URL

    const options = [
        {label : 'Barang Baru' ,value : 'barang_baru'},
        {label : 'Perbaikan / Upgrade', value : 'perbaikan/upgrade'}
    ]

    useEffect(() => {
        fetchItems()
    }, [id])

    useEffect(() => {
        console.log(items.barang)
    }, [items])

    const fetchItems = async () => {
       try {
        const response = await api.get(`makeRequest/detail/${id}`)
        const data = response.data.data
        const imageURL = data.bukti?.map((bukti) => `${baseURL}${bukti}`)
        setItems({
            jenis_permintaan : {value : data.jenis_permintaan, label : data.jenis_permintaan},
            description : data.description,
            keperluan : data.keperluan,
            barang : data.barangs.map((barang) => ({value : barang.id ,label : `${barang.asset_kode} - ${barang.unit_device}`})),
            image : data.bukti == null ? null : imageURL
        })  
        setRole(data.user.role)
        console.log('berhasil brother', data)
       } catch (error) {
        
       } finally {
        setLoading(false)
       }
    }

    
    if (!loading && role !== 'admin') {
        return <Navigate to={`/update-mr/${id}`} replace/>
     }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
        const formdata = new FormData
        
        formdata.append('jenis_permintaan', items.jenis_permintaan?.value)
        formdata.append('description', items.description)
        formdata.append('keperluan', items.keperluan)
        items.barang.forEach((barangs) => {
            formdata.append('barang_ids[]', barangs.value)
        })
        items.image.forEach((images) => {
            if (images instanceof File) {
                formdata.append('bukti[]', images)
            }
        })
        formdata.append('_method', 'PUT')
        await api.post(`makeRequest/admin/update/${id}`, formdata ,{
            headers : {
                'Content-Type' : 'multipart/form-data'
            }
        })
        navigate('/list-makerequest')
        } catch (error) {
            console.error(error)
        }
    }
    
  return (
    <Layout title={'Update MR Admin'}>
        <Block>
            <Back goHome={() => navigate('/list-makerequest')}/>
            <div className="bg-white shadow-sm rounded-md p-3 mt-3">
                <form onSubmit={handleSubmit}>
                    <div className="jenis-permintaan mb-3">
                        <label htmlFor="jenis">Jenis Permintaan</label>
                        <Select
                        id='jenis'
                        options={options}
                        onChange={jenis_permintaan => setItems({...items, jenis_permintaan})}
                        value={items.jenis_permintaan}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="keperluan">Keperluan</label>
                        <div className='bg-white p-2 rounded-md border-solid border-gray-300 border  font-light font-inter'>
                                <input 
                                type="text"
                                id='keperluan'  
                                name='keperluan'
                                value={items.keperluan}
                                onChange={e => setItems({ ...items, keperluan: e.target.value })}
                                className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"                            
                                placeholder='Keperluan'
                                required
                                />
                            </div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="deskripsi">Deskripsi</label>
                        <div className='bg-white p-2 rounded-md border-solid border-gray-300 border  font-light font-inter'>
                                <input 
                                type="text"
                                id='deskripsi'  
                                name='deskripsi'
                                value={items.description}
                                onChange={e => setItems({ ...items, description: e.target.value })}
                                className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"                            
                                placeholder='Deskripsi'
                                required
                                />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor='barang'>Barang</label>
                        <SelectPaginate
                        required={true}
                        source={'barang'}
                        itemLabel={['asset_kode','unit_device']}
                        selectName={'Barang'}
                        handleSelectChange={barang => setItems({...items, barang})}
                        selectValue={items.barang}
                        isMulti={true}
                        id='barang'
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor='barang'>Barang</label>
                        <MultiUpload
                        required={true}
                        items={items}
                        setItems={setItems}
                        />
                    </div>
                    <div className="tombol mt-6">
                        <button type='submit' className='bg-teal-400 text-white py-3 rounded-md'>Submit</button>
                    </div>
                </form>
            </div>
        </Block>
    </Layout>
  )
}

export default UpdateAdmin