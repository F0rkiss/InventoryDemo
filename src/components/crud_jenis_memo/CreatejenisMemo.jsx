import React, {useEffect, useState} from 'react'
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { Page, Block } from 'framework7-react';
import CustomNavbar from '../component/CustomNavbar';
import SelectPaginate from '../component/SelectPaginate';
import Select from 'react-select';
import Back from '../component/Back';
import Layout from '../component/Layout';
import Swal from 'sweetalert2';
import { isDynamic, findisDynamicOption } from '../../helper/FindOptions';

function CreateJenisMemo() {

    const [items, setItems] = useState({
        name : '',
        description: '',
        is_dynamic: null
    })

    const [disabled, setDisabled] = useState(false)
    const [error, setError] = useState(null)
    
    const navigate = useNavigate();

    useEffect(() => {
        if (error) {
            setError(null)
        }
    }, [items.email])

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (disabled) {
                return
            }
            setDisabled(true)

            await api.post('jenisMemo-create', {
                name : items.name,
                description: items.description,
                is_dynamic: items.is_dynamic?.value
            })
            navigate('/jenismemo/list-jenismemo')
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Membuat Jenis Memo',
                text:'Ada Kesalahan Dalam Sistem'
            })
            setError(error.response.data)
        } finally {
            setDisabled(false)
        }
    }

    const clearAll = () => {
        setItems({
            name : '',
            description: ''
        })
    }
  return (
    <div>
        <Layout title={'Create Jenis Memo'}>
            <Block>
                <Back goHome={() => navigate('/jenismemo/list-jenismemo')}/>
                <div className='bg-white rounded shadow-sm p-3'>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-5">
                            <label>Nama Jenis Memo:</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={items.name} 
                                    maxLength={50}
                                    onChange={  e => setItems({ ...items, name: e.target.value })}
                                    placeholder='Nama'
                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                    required 
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className=''>Description</label>
                            <div className='bg-white p-2 rounded-md border border-gray-300 border mt-2'>
                            <input 
                                type="text" 
                                name="description" 
                                value={items.description} 
                                onChange={e => setItems({ ...items, description: e.target.value })}
                                className="w-full p-2 placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                placeholder='Deskripsi'
                                required
                            />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label>Dinamis atau Statis</label>
                                <Select 
                                onChange={is_dynamic => setItems({...items, is_dynamic})}
                                value={items.is_dynamic}
                                options={isDynamic}
                                required
                                />
                        </div>
                        <div className="flex">
                            <button disabled={disabled} type="submit" className="bg-cyan-400 text-white p-2 rounded w-1/2 me-3">Create Jenis Memo</button>
                            <button type="button" onClick={clearAll} className="bg-red-400 text-white p-2 rounded w-1/2">Clear</button>
                        </div>
                    </form>
                </div>
            </Block>
        </Layout>
    </div>
  )
}

export default CreateJenisMemo