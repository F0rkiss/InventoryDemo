import React, {useEffect, useState} from 'react'
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { Page, Block } from 'framework7-react';
import Back from '../component/Back';
import Layout from '../component/Layout';
import Swal from 'sweetalert2';

function CreateRole() {
    const [items, setItems] = useState({
        name : '',
        email : '',
        password : '',
        role : null,
        department : null,
        divisi : null,
    })
    const [disabled, setDisabled] = useState(false)
    const [error, setError] = useState(null)

    const role = ([
        {value : 'admin', label : 'Admin'},
        {value : 'role', label : 'role'}
    ])
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

            await api.post('role-create', {
                name : items.name,
            })
            navigate('/role/list-role')
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Membuat role MR',
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
            email : '',
            password : '',
            role : null,
            department : null,
            divisi : null,
        })
    }
  return (
    <div>
        <Layout title={'Create role'}>
            <Block>
                <Back goHome={() => navigate('/role/list-role')}/>
                <div className='bg-white rounded-lg shadow-sm p-5'>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-5">
                            <label>Nama:</label>
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
                        <div className="flex">
                            <button disabled={disabled} type="submit" className="bg-cyan-400 text-white p-2 rounded w-1/2 me-3">Create role</button>
                            <button type="button" onClick={clearAll} className="bg-red-400 text-white p-2 rounded w-1/2">Clear</button>
                        </div>
                    </form>
                </div>
            </Block>
        </Layout>
    </div>
  )
}

export default CreateRole