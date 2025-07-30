import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/api'; 
import Back from '../component/Back';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { Block, Page } from 'framework7-react';
import SelectPaginate from '../component/SelectPaginate';
import { accessOptions, findAccessOption } from '../../helper/FindOptions';
import Swal from 'sweetalert2';
import Layout from '../component/Layout';
import { DecryptID } from '../../helper/EncryptHelper';
import Transition from '../component/Transition';
import { instanceOf } from 'prop-types';

function UpdateBarang() {
    const navigate = useNavigate();
    const [contentVisible, setContentVisible] = useState(false)
    const [error, setError] = useState({});
    const [decryptedId, setDecryptedId] = useState('')
    const [item, setItem] = useState({
        name : '',
        kode_barang : '',
        kode_gudang : '',
        satuan : '',
        image : null,
        jenis_barang : null,
        categories : null,
        sumber_barang : null,
        tingkat_kebutuhan : null,
        is_asset : null
    });
    const [disabled, setDisabled] = useState(false)
    const fileInputRef = useRef(null)
    const { id } = useParams();

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
            const response = await api.get(`/inventBarang-detail/${decryptedId}`);
            const data = response.data.data;
            setItem({
                name : data.name,
                kode_barang : data.kode_barang,
                kode_gudang : data.kode_gudang,
                satuan : data.satuan,
                image : data.image,
                jenis_barang : data.jenis_barang ? { value: data.jenis_barang?.id, label: data.jenis_barang?.name } : null,
                categories : data.category_barang ? { value: data.category_barang?.id, label: data.category_barang?.name } : null,
                sumber_barang : data.sumber_barang ? { value: data.sumber_barang?.id, label: data.sumber_barang?.name } : null,
                tingkat_kebutuhan : data.tingkat_kebutuhan ? { value: data.tingkat_kebutuhan?.id, label: data.tingkat_kebutuhan?.name } : null,
                is_asset : findAccessOption(data.is_asset)
            });
        } catch (error) {
            
        } finally { setTimeout(() => setContentVisible(true), 50) }
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
            formdata.append('_method', "PUT")
            formdata.append('invent_jenis_barangs_id', item.jenis_barang?.value)
            formdata.append('invent_sumber_barangs_id', item.sumber_barang?.value)
            formdata.append('invent_tingkat_kebutuhans_id', item.tingkat_kebutuhan?.value)
            formdata.append('invent_categories_id', item.categories?.value)
            formdata.append('name', item.name)
            formdata.append('is_asset', item.is_asset?.value)
            formdata.append('satuan', item.satuan)
            formdata.append('kode_barang', item.kode_barang)
            formdata.append('kode_gudang', item.kode_gudang)
            if (item.image instanceof File) {
                formdata.append('image', item.image)
            }
            for (const [key, value] of formdata.entries()) {
                console.log(key, value);
            }

            const response = await api.post(`/inventBarang-update/${decryptedId}`, formdata, {
                headers : {
                    'Content-Type' : 'multipart/form-data'
                }
            });
            Swal.fire({
                title: 'Berhasil diubah!',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
            navigate('/barang/list-barang');
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

    // const handleInputChange = (field) => (e) => {
    //     setItem({ ...item, [field]: e.target.value });
    // };

    const handleSelectChange = (field) => (selectedOption) => {
        setItem({ ...item, [field]: selectedOption });
    };

    const clearAll = () => {
        setItem({
           name : '',
            kode_barang : '',
            kode_gudang : '',
            satuan : '',
            image : null,
            jenis_barang : null,
            categories : null,
            sumber_barang : null,
            tingkat_kebutuhan : null,
            is_asset : null
        })
    }

    return (
        <Layout title={'Update Barang'}>
            <Block>
                <Back goHome={() => navigate('/barang/list-barang')} />
                <Transition contentVisible={contentVisible}>
                    <div className="container mt-6 bg-white p-5 shadow-md rounded-lg font-inter -translate-y-3 mx-auto">
                        <form onSubmit={updateItem}>
                            <div className="mb-5">
                                <label>Name</label>
                                <div className='bg-white p-2 rounded-md border-solid border-gray-300 border mt-2'>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={item.name} 
                                        onChange={e => setItem({ ...item, name: e.target.value })}
                                        className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light "
                                        maxLength={80}
                                        placeholder='Name'
                                    />
                                </div>
                            </div>
                            <div className="mb-5">
                                <label>Kode Barang</label>
                                <div className='bg-white p-2 rounded-md border-solid border-gray-300 border mt-2'>
                                    <input 
                                        type="text" 
                                        name="kode_barang" 
                                        value={item.kode_barang} 
                                        onChange={e => setItem({ ...item, kode_barang: e.target.value })}
                                        className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light "
                                        maxLength={80}
                                        placeholder='Kode Barang'
                                    />
                                </div>
                            </div>
                            <div className="mb-5">
                                <label>Kode Gudang</label>
                                <div className='bg-white p-2 rounded-md border-solid border-gray-300 border mt-2'>
                                    <input 
                                        type="text" 
                                        name="kode_gudang" 
                                        value={item.kode_gudang} 
                                        onChange={e => setItem({ ...item, kode_gudang: e.target.value })}
                                        maxLength={80}
                                        placeholder='Kode Gudang'
                                        className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                    />
                                </div>
                            </div>
                            <div className="mb-5">
                                <label>Satuan</label>
                                <div className='bg-white p-2 rounded-md border-solid border-gray-300 border mt-2'>
                                    <input 
                                        type="text" 
                                        name="satuan" 
                                        value={item.satuan} 
                                        onChange={e => setItem({ ...item, satuan: e.target.value })}
                                        maxLength={80}
                                        placeholder='Satuan'
                                        className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                    />
                                </div>
                            </div>
                            <div className="mb-5">
                                <label className='font-semibold'>Aset</label>
                                <Select 
                                    options={accessOptions} 
                                    value={item.is_asset}
                                    placeholder="Aset" 
                                    onChange={is_asset => setItem({ ...item, is_asset })}
                                />
                            </div>
                            <div className="mb-5 g-4">
                                <label className='font-semibold'>Jenis Barang </label>
                                <SelectPaginate
                                    source={'inventJenisBarang'}
                                    selectValue={item.jenis_barang}
                                    selectName={'Jenis Barang'}
                                    itemLabel={['name']}
                                    handleSelectChange={jenis_barang => setItem({...item, jenis_barang})}
                                />
                            </div>
                            <div className="mb-5 g-4">
                                <label className='font-semibold'>Categories </label>
                                <SelectPaginate
                                    source={'inventCategories'}
                                    selectValue={item.categories}
                                    selectName={'Category'}
                                    itemLabel={['name']}
                                    handleSelectChange={categories => setItem({...item, categories})}
                                />
                            </div>
                            <div className="mb-5 g-4">
                                <label className='font-semibold'>Sumber Barang </label>
                                <SelectPaginate
                                    source={'inventSumberBarang'}
                                    selectValue={item.sumber_barang}
                                    selectName={'Sumber Barang'}
                                    itemLabel={['name']}
                                    handleSelectChange={sumber_barang => setItem({...item, sumber_barang})}
                                />
                            </div>
                            <div className="mb-5 g-4">
                                <label className='font-semibold'>Tingkat Kebutuhan </label>
                                <SelectPaginate
                                    source={'tingkatKebutuhanBarang'}
                                    selectValue={item.tingkat_kebutuhan}
                                    selectName={'Tingkat Kebutuhan'}
                                    itemLabel={['name']}
                                    handleSelectChange={tingkat_kebutuhan => setItem({...item, tingkat_kebutuhan})}
                                />
                            </div>
                            <div className="mb-5">
                                <label>Image:</label>
                                <div className='bg-white p-2 rounded-md border-solid border-gray-300 border font-light font-inter'>
                                <input 
                                    type="file" 
                                    id="img" 
                                    name="img" 
                                    accept="image/jpeg, image/png"
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
                </Transition>
            </Block>
        </Layout>
    )
}

export default UpdateBarang;
