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
                <div className="xs:px-0 md:px-4">
                    <Back goHome={() => navigate('/role/list-role')}/>
                    <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Create Role</p>
                    <div className='bg-white rounded-lg shadow-xl shadow-gray-200 border p-8'>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-5">
                                <label className="font-semibold">New Role</label>
                                <div className='bg-white mt-2 p-3 rounded-md border-solid border-gray-300 border'>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={items.name} 
                                        maxLength={50}
                                        onChange={e => setItems({ ...items, name: e.target.value })}
                                        placeholder='Masukkan nama role baru'
                                        className="w-full p-3 border rounded placeholder:text-gray-400 placeholder:font"
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center mt-10 mx-auto max-w-full w-[25rem] space-y-2 text-center">
                                <button disabled={disabled} type='submit' className='w-full py-2 px-2 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 transition-colors duration-200 text-white disabled:bg-blue-300'>Submit</button>
                                <button className='w-full py-2 px-2 rounded-lg font-medium border border-red-200 bg-red-50 hover:bg-red-100 transition-colors duration-200 text-red-600' onClick={clearAll} type='button'>Reset</button>
                            </div>
                        </form>
                    </div>
                </div>
            </Block>
        </Layout>
    </div>
  )
}

export default CreateRole