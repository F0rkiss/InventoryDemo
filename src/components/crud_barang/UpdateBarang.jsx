import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/api'; 
import Back from '../component/Back';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { Block, Page } from 'framework7-react';
import SelectPaginate from '../component/SelectPaginate';
import Swal from 'sweetalert2';
import Layout from '../component/Layout';
import { DecryptID } from '../../helper/EncryptHelper';

function UpdateItem() {
    const [error, setError] = useState({});
    const [decryptedId, setDecryptedId] = useState('')
    const [item, setItem] = useState({
        category: null,
        user: null,
        brand: '',
        typeMonitor: '',
        status: null,
        unitDevice: '',
        dateBarangMasuk: '',
        spekOrigin: '',
        // spekAkhir: '',
        note: '',
        image: null,
    });
    const [disabled, setDisabled] = useState(false)
    const fileInputRef = useRef(null)
    const { id } = useParams();
    const navigate = useNavigate();

    const statuses = [
        { value: 'in use', label: 'In Use' },
        { value: 'out', label: 'Out' },
        { value: 'in service', label: 'Servis' },
        { value: 'rusak', label: 'Rusak' }
    ];

    useEffect(() => {
        const decryptedId = DecryptID(id)
        setDecryptedId(decryptedId)
        if (!decryptedId) {
            navigate(-1)
        }
    }, [id]);

    useEffect(() => {
        if(decryptedId) {
            fetchItem()
        }
    }, [decryptedId])

    const fetchItem = async () => {
        try {
            const response = await api.get(`/barang/${decryptedId}`);
            const data = response.data.data;
            setItem({
                category: data.category ? { value: data.category.id, label: data.category.name } : null,
                brand: data.brand,
                typeMonitor: data.type_monitor,
                unitDevice: data.unit_device,
                dateBarangMasuk: data.date_barang_masuk,
                spekOrigin: data.spek_origin,
                image : data.image,
                note: data.note
            });
        } catch (error) {
            
        } 
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file && file.size > 5242880) {
            setItem({...item, image : null})
            fileInputRef.current.value = ''
            Swal.fire({
                icon: 'error',
                title: 'File Melebihi Batas Ukuran 5 MB'
            })
        } else {
            setItem({...item, image : file})
        }
    }

    
    const updateItem = async (e) => {
        e.preventDefault();
        setError({})
        try {
            if (disabled) {
                return
            }
            setDisabled(true)
            
            const formdata = new FormData()

            formdata.append('category_id', item.category ? item.category.value : null)
            formdata.append('_method', "PUT")
            formdata.append('brand', item.brand)
            formdata.append('type_monitor', item.typeMonitor)
            formdata.append('unit_device', item.unitDevice)
            formdata.append('date_barang_masuk', item.dateBarangMasuk)
            formdata.append('spek_origin', item.spekOrigin)
            formdata.append('note', item.note)
            if (item.image) {
                formdata.append('image', item.image)
            }

            const response = await api.post(`/barang/${decryptedId}`, formdata, {
                headers : {
                    'Content-Type' : 'multipart/form-data'
                }
            });
            navigate(-1);
        } catch (error) {
            const errorData = error?.response.data.msg
            if (errorData === "User tidak ditemukan"){
                setError(Swal.fire({
                    icon: "error",
                    title: "ERROR",
                    text: "Field User Tidak Bisa Kosong Kecuali Statusnya Rusak",
                }))
                fetchItem()
            } else {
                Swal.fire({
                    icon:'error',
                    title:'Tidak Dapat Mengupdate Barang',
                    text:'Ada Kesalahan Dalam Sistem'
                })
            }
        } finally {
            setDisabled(false)
        }
    }

    const handleInputChange = (field) => (e) => {
        setItem({ ...item, [field]: e.target.value });
    };

    const handleSelectChange = (field) => (selectedOption) => {
        setItem({ ...item, [field]: selectedOption });
    };

    return (
        <Layout title={'Update Barang'}>
                <Block>
                    <Back goHome={() => navigate('/barang/list-barang')} />
                    <div className="container mt-6 bg-white p-2 shadow-md rounded-md font-inter -translate-y-3 mx-auto">
                        <form onSubmit={updateItem}>
                            <div className="mb-5">
                                <label>Category:</label>
                                <SelectPaginate 
                                source={'category'}
                                selectName={'Kategori'}
                                itemLabel={['name']}
                                handleSelectChange={handleSelectChange('category')}
                                selectValue={item.category}
                                required={true}
                                />
                            </div>
                            <div className="mb-5">
                                <label>Brand:</label>
                                <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={item.brand}
                                        onChange={handleInputChange('brand')}
                                        className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                        placeholder='Nama Brand'
                                        maxLength={80}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-5">
                                <label>Type Monitor:</label>
                                <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                                    <input
                                        type="text"
                                        name="typeMonitor"
                                        value={item.typeMonitor}
                                        onChange={handleInputChange('typeMonitor')}
                                        maxLength={80}
                                        placeholder='Tipe Monitor'
                                        className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-5">
                                <label>Unit Device:</label>
                                <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                                    <input
                                        type="text"
                                        name="unitDevice"
                                        value={item.unitDevice}
                                        maxLength={255}
                                        onChange={handleInputChange('unitDevice')}
                                        className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                        placeholder='Nama Unit'
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-5">
                                <label>Date Barang Masuk:</label>
                                <div className='bg-white p-2 rounded-md border-solid border-gray-300 border font-light font-inter'>
                                    <input
                                        type="date"
                                        name="dateBarangMasuk"
                                        value={item.dateBarangMasuk}
                                        onChange={handleInputChange('dateBarangMasuk')}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-5">
                                <label>Spek Origin:</label>
                                <div className='bg-white p-2 rounded-md border-solid border-gray-300 border font-light font-inter'>
                                    <textarea
                                        name="spekOrigin"
                                        value={item.spekOrigin}
                                        onChange={handleInputChange('spekOrigin')}
                                        maxLength={255}
                                        className="w-full border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                        placeholder='Spek Origin'
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-5">
                                <label>Note:</label>
                                <div className='bg-white p-2 rounded-md border-solid border-gray-300 border font-light font-inter'>
                                    <textarea
                                        name="note"
                                        value={item.note}
                                        onChange={handleInputChange('note')}
                                        maxLength={255}
                                        className="w-full border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                        placeholder='Note'
                                    />
                                </div>
                            </div>
                        <div className="mb-5">
                            <label>Image:</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border font-light font-inter'>
                                <input 
                                    type="file" 
                                    id="img" 
                                    name="img" 
                                    accept="image/*"
                                    onChange={handleFileChange}      
                                    ref={fileInputRef}
                                    />
                            </div>
                        </div>
                            <div className='flex '>
                                <button disabled={disabled} type="submit" className="bg-cyan-400 text-white p-2 rounded">Update Item</button>
                                <button type='button' onClick={() => fetchItem()} className="bg-red-500 text-white p-2 rounded ms-3">Reset</button>
                            </div>
                        </form>
                    </div>
                </Block>
        </Layout>
    )
}

export default UpdateItem;
