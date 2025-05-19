import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import Back from '../component/Back';
import { Block, Page } from 'framework7-react';
import Layout from '../component/Layout';
import SelectPaginate from '../component/SelectPaginate';
import Swal from 'sweetalert2';

function CreateItem() {
    const statuses = ([
        { value: 'in use', label: 'In Use' },
        { value: 'out', label: 'Out' },
        { value: 'in service', label: 'Servis' },
        { value: 'rusak', label: 'Rusak' }
    ]);
     
    const [newItem, setNewItem] = useState({
        category: null,
        user: null,
        brand: '',
        typeMonitor: '',
        status: null,
        unitDevice: '',
        dateBarangMasuk: '',
        spekOrigin: '',
        spekAkhir: '',    
        note: '',
        image : null,
    });
    
    const [disabled, setDisabled] = useState(false)
    const fileInputRef = useRef(null)
    const navigate = useNavigate()

    const goHome = () =>{
        navigate('/barang/list-barang')
    }

    useEffect(() => {
        console.log(newItem)
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

        formdata.append('user_id', newItem.user?.value)
        formdata.append('category_id', newItem.category?.value)
        formdata.append('status', newItem.status?.value)
        formdata.append('brand', newItem.brand)
        formdata.append('type_monitor', newItem.typeMonitor)
        formdata.append('unit_device', newItem.unitDevice)
        formdata.append('date_barang_masuk', newItem.dateBarangMasuk)
        formdata.append('spek_origin', newItem.spekOrigin)
        formdata.append('spek_akhir', newItem.spekAkhir)
        formdata.append('note', newItem.note)
        if (newItem.image) {
            formdata.append('image', newItem.image)
        }
        await api.post('/barang', formdata, {
            headers : {
                "Content-Type" : "multipart/form-data"
            }
        });
        navigate(-1)
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Membuat Barang',
                text:'Ada Kesalahan Dalam Sistem'
            })
        } finally {
            setDisabled(false)
        }
    };

    return (
        <Layout title={'Create Barang'}>
            <Block>
                <Back goHome={goHome}/>
                <div className="container mt-6 bg-white p-2 shadow-md rounded-md font-inter -translate-y-3 mx-auto   ">
                    <form onSubmit={makeItem}>
                        <div className="mb-5">
                            <label>User:</label>
                            <SelectPaginate
                            source={'user'}
                            selectName={'User'}
                            itemLabel={['name']}
                            handleSelectChange={user => setNewItem({...newItem, user})}
                            />
                        </div>
                        <div className="mb-5">
                            <label>Category:</label>
                            <SelectPaginate
                            selectName={'Kategori'}
                            source={'category'}
                            itemLabel={['name', 'kode']}
                            handleSelectChange={category => setNewItem({...newItem, category})}
                            />
                        </div>
                        <div className="mb-5 ">
                            <label>Status:</label>
                            <Select 
                                options={statuses} 
                                value={newItem.status} 
                                onChange={status => setNewItem({ ...newItem, status })}
                                required
                            />
                        </div>
                        <div className="mb-5">
                            <label>Brand:</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                            <input 
                                type="text" 
                                name="brand" 
                                value={newItem.brand} 
                                onChange={e => setNewItem({ ...newItem, brand: e.target.value })}
                                className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light "
                                maxLength={80}
                                placeholder='Nama Brand'
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
                                value={newItem.typeMonitor} 
                                onChange={e => setNewItem({ ...newItem, typeMonitor: e.target.value })}
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
                                value={newItem.unitDevice} 
                                onChange={e => setNewItem({ ...newItem, unitDevice: e.target.value })}
                                maxLength={255}
                                className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                placeholder='Nama Unit'
                                required
                            />
                            </div>
                        </div>
                        <div className="mb-5">
                            <label>Date Barang Masuk:</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border text-gray-400 font-light font-inter'>
                            <input 
                                type="date" 
                                name="dateBarangMasuk" 
                                value={newItem.dateBarangMasuk} 
                                onChange={e => setNewItem({ ...newItem, dateBarangMasuk: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                            />
                            </div>
                        </div>
                        <div className="mb-5">
                            <label>Spek Origin:</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border font-light font-inter'>
                            <input 
                                type="text" 
                                name="spekOrigin" 
                                value={newItem.spekOrigin} 
                                onChange={e => setNewItem({ ...newItem, spekOrigin: e.target.value })}
                                maxLength={255}
                                className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"                            
                                placeholder='Spek Origin'
                                required
                            />
                            </div>
                        </div>
                        <div className="mb-5">
                            <label>Note:</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border font-light font-inter'>
                            <input 
                                type="text" 
                                name="spekOrigin" 
                                value={newItem.note} 
                                onChange={e => setNewItem({ ...newItem, note: e.target.value })}
                                maxLength={255}
                                className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"                            
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

export default CreateItem;
