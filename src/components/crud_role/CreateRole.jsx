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
        {value : 'user', label : 'User'}
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

            if (items.password.length < 8) {
                Swal.fire({
                    title: `Password Wajib 8 Karakter`,
                    icon: 'error',
                });
                return;
            }

            if (disabled) {
                return
            }
            setDisabled(true)

            await api.post('user', {
                name : items.name,
                email : items.email,
                password : items.password,  
                role : items.role?.value,
                department_id : items.department?.value,
                divisi_id : items.divisi?.value,
            })
            navigate('/user/list-user')
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Membuat User MR',
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
        <Layout title={'Create User'}>
            <Block>
                <Back goHome={() => navigate('/user/list-user')}/>
                <div className='bg-white rounded shadow-sm p-3'>
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
                        <div className="mb-5">
                            <div className="flex justify-between items-center">   
                            <label>Email:</label>
                            {
                                error?.msg.email[0] == 'The email has already been taken.' &&
                                <p className='text-xs text-red-500'>* Email Sudah Terambil</p>
                            }
                            </div>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                                
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={items.email} 
                                    onChange={e => setItems({ ...items, email: e.target.value })}
                                    maxLength={254}
                                    placeholder='Email'
                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-5">
                            <label>Password:</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                                <input 
                                    type="password" 
                                    name="password" 
                                    value={items.password} 
                                    onChange={e => setItems({ ...items, password: e.target.value })}
                                    placeholder='Password'
                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-5">
                            <label>Department :</label>
                            <SelectPaginate
                            source={'department'}
                            selectName={'Department'}
                            itemLabel={['name']}
                            handleSelectChange={department => setItems({...items, department})}
                            />
                        </div>
                        <div className="mb-5 ">
                            <label>Role:</label>
                            <Select 
                                options={role} 
                                value={items.role} 
                                onChange={role => setItems({ ...items, role })}
                                required
                            />
                        </div>
                        <div className="flex">
                            <button disabled={disabled} type="submit" className="bg-cyan-400 text-white p-2 rounded w-1/2 me-3">Create User</button>
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