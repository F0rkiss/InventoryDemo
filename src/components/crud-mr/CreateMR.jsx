import React, { useEffect, useState } from 'react'
import { Block } from 'framework7-react';
import api from '../../api/api';
import Layout from '../component/Layout';
import Select, { components } from 'react-select'
import { useNavigate, useParams } from 'react-router-dom';
import SelectPaginate from '../component/SelectPaginate';
import MultiUpload from '../component/MultiUpload';
import Loader from '../component/Loader';
import useAuth from '../../hooks/useAuth';
import Back from '../component/Back';
import { DecryptID } from '../../helper/EncryptHelper';
import Swal from 'sweetalert2';

const CreateMR = () => {

    const [items, setItems] = useState({
        jenis_permintaan : null,
        description: '',
        keperluan: '',
        image : [],
        barang: [],
    })

    const { barang_id } = useParams()
    const {role, email} = useAuth();
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();
    const [decryptedId, setDecryptedId] = useState('')
    const [disabled, setDisabled] = useState(false)
    
    const isPerbaikan = items.jenis_permintaan?.value == 'perbaikan/upgrade'
    const isNull = items.jenis_permintaan?.value == null
    const jenis = [
        {label : 'Barang Baru', value : 'barang_baru'},
        {label : 'Perbaikan/Upgrade', value : 'perbaikan/upgrade'},
    ]

    useEffect(() => {
        if (barang_id) {
            try {   
                setItems((prevItems) => ({...prevItems, jenis_permintaan : {value : 'perbaikan/upgrade', label : 'perbaikan/upgrade'}})) 
                const decryptedId = DecryptID(barang_id)
                setDecryptedId(decryptedId)
                if (!decryptedId) {
                    navigate(-1)
                }
            } catch (error) {
                navigate(-1)
            }
        }
    }, [barang_id])

    useEffect(() => {
        if (decryptedId) {
            check()
        }
    }, [decryptedId])

    useEffect(() => {
        return () => {
            items.image?.forEach(file => URL.revokeObjectURL(file));
        };
    }, [items.image]);

    
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

    const check = async () => {
        try {
            const response = await api.get(`detail-barang/${decryptedId}`) 
            const data = response.data.data
            if ( role == 'user' && data.user?.email !== email || data.isSelected) {
                navigate(-1)
            } else {
                setItems((prevItems) => ({...prevItems, barang : [{value : data.id, label : ` ${data.unit_device} - ${data.asset_kode}`, isFixed: true }]}))
            }
        } catch (error) {
            const err = error.response.data
            if (err.msg == "Barang bukan milik Anda atau tidak ditemukan") {
                navigate('/barang-anda')
            } 
        }
    }
    
    const getEndPoint = () => {
        if (role == 'admin') {
            return `makeRequest/admin/withOutId`
        } else {
            return `makeRequest/user/withoutid`  
        }
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setDisabled(true)
            const formdata = new FormData();
            
            formdata.append('jenis_permintaan', barang_id ? 'perbaikan/upgrade' : items.jenis_permintaan?.value)
            formdata.append('description', items.description)
            formdata.append('keperluan', items.keperluan)
            if (isPerbaikan) {
                items.image.forEach((file) => {
                    formdata.append('bukti[]', file); 
                });
                items.barang.forEach((b) => {
                    formdata.append('barang_ids[]', b.value); 
                });
            }
            setLoading(true)
            const endpoint = getEndPoint()
            const response = await api.post(endpoint, formdata, {
                headers : {
                    'Content-Type' : 'multipart/form-data'
                }
            })
            setLoading(false)
            navigate(-1)
        } catch (error) {
            const errorMsg = error.response.data?.msg?.bukti[0]
            if (errorMsg == "Total ukuran semua file di dalam bukti tidak boleh lebih dari 5 MB.") {
                await Swal.fire({
                    icon:'error',
                    title: 'Gambar Anda Melebihi Dari Batas 5 MegaBytes'
                })
            } else {
                Swal.fire({
                    icon:'error',
                    title:'Tidak Dapat Membuat Make Request',
                    text:'Ada Kesalahan Dalam Sistem'
                })
            }
        } finally {
            setDisabled(false)
            setLoading(false)
        }
    }

    const MultiValueRemove = (props) => {
        if (props.data.isFixed) {
          return null;
        }
        return <components.MultiValueRemove {...props}/>;
    };

  return (
    <Layout title={'Create MR'}>
        <Block>
        {
            loading ? (
                <Loader Class={'mt-60'} text='Uploading .....'/>
            ) : (
            <>
            <Back goHome={() => navigate(-1)} />
                <div className="bg-white shadow-sm rounded-sm p-3 mt-3">
                    <form onSubmit={handleSubmit}>
                        {
                            (!barang_id) &&
                            <div className={`jenis mb-3`}>
                                <label htmlFor='jenis'>Jenis Permintaan</label>
                                <Select
                                id='jenis'
                                options={jenis}
                                onChange={jenis_permintaan => setItems({...items, jenis_permintaan})}
                                value={items.jenis_permintaan}
                                />
                            </div>
                        }
                        {
                            !isNull &&
                        <div>
                            {
                                isPerbaikan &&  
                                <>
                                <div className={`barang mb-3`}>
                                    <label>Barang</label>
                                    <SelectPaginate 
                                        source= {
                                                    role === 'user' ? 'selectBarangForUser' : 'selectBarangForAdmin' 
                                                }
                                        handleSelectChange={barang => setItems({...items, barang})}
                                        components={{MultiValueRemove}}
                                        isMulti={true}
                                        selectName={'Barang'} 
                                        itemLabel={['username' ,'unit_device', 'asset_kode']}  
                                        selectValue={items.barang}
                                        isClearable={false}
                                    />
                                </div>
                                <div className={`bukti mb-3`}>
                                    <label>Bukti </label>
                                    <MultiUpload
                                    items={items}
                                    handleDelete={handleDelete}
                                    handleUpload={handleUpload}
                                    required={items.jenis_permintaan == 'perbaikan/upgrade'}
                                    />
                                    <p className='text-[0.7rem] text-red-500 mt-2'>* 1 File Maksimal 2 MB Dan Total Semua 5 MB</p>
                                </div>
                                </>
                            }
                            <div className="keperluan mb-3">
                                <label>Keperluan</label>
                                <div className='bg-white p-2 rounded-md border-solid border-gray-300 border  font-light font-inter'>
                                    <input 
                                        type="text"  
                                        name='keperluan'
                                        value={items.keperluan || ''}
                                        onChange={e => setItems({ ...items, keperluan: e.target.value })}
                                        maxLength={255}
                                        className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"                            
                                        placeholder='Keperluan'
                                        required
                                    />
                                </div>
                            </div>
                            <div className="keperluan mb-3">
                                <label>Deskripsi</label>
                                <div className='bg-white p-2 rounded-md border-solid border-gray-300 border  font-light font-inter'>
                                    <input 
                                        type="text"  
                                        name='deskripsi'
                                        value={items.description || ''}
                                        onChange={e => setItems({ ...items, description: e.target.value })}
                                        maxLength={255}
                                        className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"                            
                                        placeholder='Deskripsi'
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        }
                        { !isNull && 
                        <div className="tombol flex justify-center">
                            <button disabled={disabled} type='submit' className={`bg-cyan-400 rounded-md p-2 text-white w-36`}>
                                Submit
                            </button>
                        </div>
                        }
                    </form>
                </div>
            </>

                )
            }
        </Block>
    </Layout>
  )
}

export default CreateMR