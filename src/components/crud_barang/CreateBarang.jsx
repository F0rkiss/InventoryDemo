import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import Back from '../component/Back';
import { Block, Page } from 'framework7-react';
import { accessOptions } from '../../helper/FindOptions';
import Layout from '../component/Layout';
import SelectPaginate from '../component/SelectPaginate';
import Swal from 'sweetalert2';

function CreateBarang() { 
    const [newItem, setNewItem] = useState({
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
    const navigate = useNavigate()

    const goHome = () =>{
        navigate('/barang/list-barang')
    }

    useEffect(() => {
    }, [newItem])

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file && file.size > 5242880) {
            setNewItem((prevItems) => ({...prevItems, image : null}))
            fileInputRef.current.value = ''
            Swal.fire({
                icon: 'error',
                title: 'File Melebihi Batas Ukuran 5 MB'
            })
        } else {
            setNewItem({...newItem, image : file})
        }
    }

    const makeItem = async (e) => {
        e.preventDefault();
        try {    
        if (disabled) {
            return;
        }
        setDisabled(true)
        
        const formdata = new FormData()

        formdata.append('invent_jenis_barangs_id', newItem.jenis_barang?.value)
        formdata.append('invent_sumber_barangs_id', newItem.sumber_barang?.value)
        formdata.append('invent_tingkat_kebutuhans_id', newItem.tingkat_kebutuhan?.value)
        formdata.append('invent_categories_id', newItem.categories?.value)
        formdata.append('name', newItem.name)
        formdata.append('is_asset', newItem.is_asset?.value)
        formdata.append('satuan', newItem.satuan)
        formdata.append('kode_barang', newItem.kode_barang)
        formdata.append('kode_gudang', newItem.kode_gudang)
        if (newItem.image) {
            formdata.append('image', newItem.image)
        }
        await api.post('/inventBarang-create', formdata, {
            headers : {
                "Content-Type" : "multipart/form-data"
            }
        })
        Swal.fire({
            title: 'Barang baru berhasil dibuat!',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
        });
        navigate('/barang/list-barang')
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Membuat Barang',
                text:'Ada kesalahan dalam sistem'
            })
        } finally {
            setDisabled(false)
        }
    };

    return (
        <Layout title={'Create Barang'}>
            <Block>
                <Back goHome={goHome}/>
                <div className="p-6 mt-6 bg-white shadow-sm rounded-lg">
                    <form onSubmit={makeItem}>
                        <div className="mb-5">
                            <label>Name</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border mt-2'>
                            <input 
                                type="text" 
                                name="name" 
                                value={newItem.name} 
                                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light "
                                maxLength={80}
                                placeholder='Name'
                                required
                            />
                            </div>
                        </div>
                        <div className="mb-5">
                            <label>Kode Barang</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border mt-2'>
                            <input 
                                type="text" 
                                name="kode_barang" 
                                value={newItem.kode_barang} 
                                onChange={e => setNewItem({ ...newItem, kode_barang: e.target.value })}
                                className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light "
                                maxLength={80}
                                placeholder='Kode Barang'
                                required
                            />
                            </div>
                        </div>
                        <div className="mb-5">
                            <label>Kode Gudang</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border mt-2'>
                            <input 
                                type="text" 
                                name="kode_gudang" 
                                value={newItem.kode_gudang} 
                                onChange={e => setNewItem({ ...newItem, kode_gudang: e.target.value })}
                                maxLength={80}
                                placeholder='Kode Gudang'
                                className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                required
                            />
                            </div>
                        </div>
                        <div className="mb-5">
                            <label>Satuan</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border mt-2'>
                            <input 
                                type="text" 
                                name="satuan" 
                                value={newItem.satuan} 
                                onChange={e => setNewItem({ ...newItem, satuan: e.target.value })}
                                maxLength={80}
                                placeholder='Satuan'
                                className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                required
                            />
                            </div>
                        </div>
                        <div className="mb-5">
                            <label className='font-semibold'>Aset</label>
                            <Select 
                                options={accessOptions} 
                                value={newItem.is_asset}
                                placeholder="Aset" 
                                onChange={is_asset => setNewItem({ ...newItem, is_asset })}
                                required
                            />
                        </div>
                        <div className="mb-5 g-4">
                            <label className='font-semibold'>Jenis Barang </label>
                            <SelectPaginate
                                source={'inventJenisBarang'}
                                selectValue={newItem.jenis_barang}
                                selectName={'Jenis Barang'}
                                itemLabel={['name']}
                                handleSelectChange={jenis_barang => setNewItem({...newItem, jenis_barang})}
                                required
                            />
                        </div>
                        <div className="mb-5 g-4">
                            <label className='font-semibold'>Categories </label>
                            <SelectPaginate
                                source={'inventCategories'}
                                selectValue={newItem.categories}
                                selectName={'Category'}
                                itemLabel={['name']}
                                handleSelectChange={categories => setNewItem({...newItem, categories})}
                                required
                            />
                        </div>
                        <div className="mb-5 g-4">
                            <label className='font-semibold'>Sumber Barang </label>
                            <SelectPaginate
                                source={'inventSumberBarang'}
                                selectValue={newItem.sumber_barang}
                                selectName={'Sumber Barang'}
                                itemLabel={['name']}
                                handleSelectChange={sumber_barang => setNewItem({...newItem, sumber_barang})}
                                required
                            />
                        </div>
                        <div className="mb-5 g-4">
                            <label className='font-semibold'>Tingkat Kebutuhan </label>
                            <SelectPaginate
                                source={'tingkatKebutuhanBarang'}
                                selectValue={newItem.tingkat_kebutuhan}
                                selectName={'Tingkat Kebutuhan'}
                                itemLabel={['name']}
                                handleSelectChange={tingkat_kebutuhan => setNewItem({...newItem, tingkat_kebutuhan})}
                                required
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
                        <button disabled={disabled} type="submit" className="bg-cyan-400 text-white p-2 rounded">Create Item</button>
                    </form>
                </div>
            </Block>
        </Layout>
    );
}

export default CreateBarang;
