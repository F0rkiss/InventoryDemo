import { Page, Block } from 'framework7-react'
import React, { useState, useEffect } from 'react'
import CustomNavbar from '../component/CustomNavbar'
import { useParams } from 'react-router-dom'
import Back from '../component/Back'
import Select from 'react-select'
import { useNavigate } from 'react-router-dom'
import api from '../../api/api'
import Transition from '../component/Transition'
import Loader from '../component/Loader'
import SelectPaginate from '../component/SelectPaginate'
import Layout from '../component/Layout'    
import Swal from 'sweetalert2'
import { DecryptID, encrypting } from '../../helper/EncryptHelper'
import MultiUpload from '../component/MultiUpload'

function DoneMR() {
  
    const [items, setItems] = useState({
        tgl_penerimaan : '',
        tgl_penyerahan : '',
        kode_penyerahan : '',
        jenis_permintaan : '',
        barang : [],
        image : [],
        note : '',
        lokasi : '',
    })
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(null);
    const [decryptedId, setDecryptedId] = useState('')
    const [contentVisible, setContentVisible] = useState(false)
    const [disableSubmit, setDisableSubmit] = useState(false)
    const [limitDate, setLimitDate] = useState(false)

    const navigate = useNavigate()
    const {id} = useParams()
    
    const tanggalSerah = new Date(items.tgl_penyerahan)
    const tanggalTerima = new Date(items.tgl_penerimaan)

    useEffect(() => {
    const decryptedIds = DecryptID(id) 
    if(!decryptedIds) {
        navigate(-1)
    }
    setDecryptedId(decryptedIds)
    }, [id])


    useEffect(() => {
        if (decryptedId) {
            fetchItems()    
        }
    }, [decryptedId])

    useEffect(() => {
        if (items.tgl_penyerahan && (tanggalTerima >= tanggalSerah)) {
            setLimitDate(true)
        } else {
            setLimitDate(false)
        }
    }, [items.tgl_penerimaan, items.tgl_penyerahan])

    const fetchItems = async() => {
        try {
            setLoading(true)
            const response = await api.get(`makeRequest/detail/${decryptedId}`)
            const item = response.data.data
            if (item.status !== 'in prosess') {
                navigate(-1)
            }
            setItems((prevItems) => ({
                ...prevItems,
                tgl_penerimaan : item.tanggal_penerimaan,
                barang : item.barangs.map((b) => ({value : b.id,  label : `${b.asset_kode} - ${b.unit_device}` })),
            }))
            setData(item)
        } catch (error) {

        } finally {
            setLoading(false)
            setTimeout(() => setContentVisible(true), 50)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setDisableSubmit(true)

            const formdata = new FormData()
            if (items.image === null || items.image.length == 0 ) {
                await Swal.fire({
                    icon: 'error',
                    title: 'ERROR',
                    text: 'Bukti Wajib Diupload',
                    confirmButtonColor: '#EF4444    ',
                })
                return
            }
            formdata.append('kode_penyerahan', items.kode_penyerahan)
            formdata.append('tanggal_penyerahan', items.tgl_penyerahan || '') 
            formdata.append('note', items.note) 
            items.image.forEach((images) => {
                if (images instanceof File) {
                    formdata.append('imgAfter[]', images)
                }
            })
            items.barang.forEach((barangs) => {
                formdata.append('barang_ids[]', barangs.value)
            })   
            if (data.barangs.length == 1 || items.barang.length == 1) {
                formdata.append('lokasi', items.lokasi)
            }
            formdata.append('status', 'done')
            formdata.append('_method', 'PUT')
            const response = await api.post(`makeRequest/admin/updateStatus/${decryptedId}`, formdata, {
                headers : {
                    'Content-Type' : 'multipart/form-data'
                }
            })
            if (data.barangs.length > 1) {
                const enkripsi = await encrypting([data.barangs[0].id, data.id])
                navigate(`/make-request/history/${enkripsi}`)
            } if (items.barang.length > 1){
                const enkripsi = await encrypting([items.barang[0].value, data.id])
                navigate(`/make-request/history/${enkripsi}`)
            } else {
                navigate(-1)
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error Dalam Sistem'
            })    
        } finally {
            setDisableSubmit(false)
        } 
    }

    const handleUpload = (e) => {
        const upload = e.target.files;
        const uploadArray = Array.from(upload);
        const filteredUpload = uploadArray.filter((gambar) => gambar.size < 2097152 )
        setItems((prevItems) => ({
            ...prevItems,
            image: (prevItems.image || []).concat(filteredUpload),
        }));
    };

    const handleDelete = (index) => {    
        setItems({ ...items, image: items.image.filter((_, i) => i !== index) })
    }


    
    return (
        <Layout title={'Done Make Request'}>
            {
                loading && <Loader Class={'mt-60'}/>
            }
            <Transition contentVisible={contentVisible}>
                <Block>
                    <Back goHome={() => navigate(-1)}/>
                    <div className="bg-white rounded-md shadow-sm p-3 mt-3 ">
                        <form onSubmit={handleSubmit}>
                            {
                                items.jenis_permintaan === 'barang_baru' &&
                                <div className={`barang mb-3`}>
                                    <label>Barang</label>
                                    <SelectPaginate 
                                    source={`selectBarangUpdateStatus/${data.id}/`}
                                    handleSelectChange={barang => setItems({...items, barang})}
                                    isMulti={true}
                                    selectName={'Barang'} 
                                    itemLabel={['user.name' ,'unit_device', 'asset_kode']}  
                                    selectValue={items.barang}
                                    required={true}
                                    />
                                </div>
                            }
                            <div className="mb-3">
                                <label>Tanggal Penyerahan:</label>
                                <div className='bg-white p-2 rounded-md border-solid border-gray-300 border text-gray-600 font-light font-inter flex justify-between'>
                                    <input 
                                        type="date" 
                                        onChange={e => setItems({ ...items, tgl_penyerahan: e.target.value })}
                                        className='w-full bg-red-500'
                                        value={items.tgl_penyerahan || ''}
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setItems({ ...items, tgl_penyerahan: '' })}
                                        className={`font-bold w-7 ms-3 border-s ${items.tgl_penyerahan == null || items.tgl_penyerahan == '' ? 'hidden' : ''}`}
                                    >
                                    <i className='bx bx-x-circle text-xl ms-2'></i>
                                    </button>
                                </div>
                                { limitDate &&
                                    <div>
                                        <p className='text-[11px] text-red-500'>* Tanggal Penyerahan Tidak Boleh Lebih Awal atau Sama Dari Tanggal Penerimaan</p>
                                    </div>
                                }
                            </div>
                            <div className="mb-3">
                                <label>Kode Penyerahan</label>
                                <div className={`bg-white p-2 rounded-md border-solid border-gray-300 border text-black font-light font-inter`}>
                                    <input 
                                    placeholder='Kode Penyerahan'
                                    type="text" 
                                    onChange={e => setItems({...items, kode_penyerahan : e.target.value})}
                                    className='w-full p-2 border rounded'
                                    value={items.kode_penyerahan|| ''}
                                    required
                                    />
                                </div>
                            </div>
                            {
                                data?.barangs.length == 1 || items.barang.length <= 1 && (
                                    <div className="mb-3">
                                        <label>Lokasi</label>
                                        <div className={`bg-white p-2 rounded-md border-solid border-gray-300 border text-black font-light font-inter`}>
                                            <input 
                                            placeholder='Lokasi'
                                            onChange={e => setItems({...items, lokasi : e.target.value})}
                                            value={items.lokasi|| ''}
                                            required
                                            />
                                        </div>
                                    </div>
                                )
                            }
                            <div className={`mb-3`}>
                                <label>Image:</label>
                                <MultiUpload
                                items={items}
                                handleDelete={handleDelete}
                                handleUpload={handleUpload}
                                />
                            </div>
                            <div className="mb-3">
                                <label>Note</label>
                                <div className={`bg-white p-2 rounded-md border-solid border-gray-300 border text-black font-light font-inter`}>
                                    <textarea 
                                    onChange={e => setItems({...items, note : e.target.value})}
                                    className='w-full border rounded'
                                    placeholder='Note'
                                    value={items.note|| ''}
                                    required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <button type='submit' disabled={disableSubmit || limitDate} className='bg-blue-400 h-10 w-32 rounded-md text-white disabled:bg-blue-300'>Submit</button>
                            </div>
                        </form>
                    </div>
                </Block>
            </Transition>
        </Layout>
    )
}   
export default DoneMR