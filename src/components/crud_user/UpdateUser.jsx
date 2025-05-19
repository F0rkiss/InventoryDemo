import React, {useState, useEffect} from 'react'
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { Page, Block } from 'framework7-react';
import { useParams } from 'react-router-dom';
import CustomNavbar from '../component/CustomNavbar';
import SelectPaginate from '../component/SelectPaginate';
import Select from 'react-select';
import Back from '../component/Back';
import Layout from '../component/Layout';
import { DecryptID } from '../../helper/EncryptHelper';
function UpdateUser() {
    const [items, setItems] = useState({
        name : '',
        email : '',
        password : '',
        role : null,
        department : null,
    })
    const [decryptedId, setDecryptedId] = useState('')
    const role = ([
        {value : 'admin', label : 'Admin'},
        {value : 'user', label : 'User'}
    ])
    const [error, setError] = useState(0)
    const [disabled, setDisabled] = useState(false)
    const {id} = useParams()
    const navigate = useNavigate();

    useEffect(() => {
        const decryptedIds = DecryptID(id)
        setDecryptedId(decryptedIds)
        if (!decryptedIds) {
            navigate(-1)
        }
    }, [id])

    useEffect(() => {
        if (decryptedId) {
            fetchItems()
        }
    }, [decryptedId])

    const fetchItems = async () => {
        try {
            const response = await api.get(`user/${decryptedId}`);
            const data = response.data.data;
            setItems({
                name: data.name || '',
                email: data.email || '',
                password: data.password || '',
                department: data.department ? { value: data.department.id, label: data.department.name } : null,
                role: data.role ? { value: data.role, label: data.role } : null,
            });
        } catch (error) {

        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();        
        try {
            if (disabled) {
                return
            }
            setDisabled(true)
            await api.put(`user/${decryptedId}`, {
                name : items.name,
                email : items.email,
                password : items.password,
                role : items.role?.value,
                department_id : items.department?.value,
                divisi_id : items.divisi?.value,
            })
        navigate('/user/list-user')
        } catch (error) {
            setError(error.response.data.statusCode)
        } finally {
            setDisabled(false)
        }
    }
  return (
        <Layout title={'Update User'}>
            <Block>
                <Back goHome={() => navigate('/user/list-user')} />
                <div className='bg-white rounded shadow-sm p-3 mt-4'>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-5">
                            <label>Nama:</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={items.name} 
                                    onChange={e => setItems({ ...items, name: e.target.value })}
                                    maxLength={50}
                                    placeholder='Nama'
                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-5">
                            <div className="flex items-center justify-between">
                                <label>Email: </label>
                                <p className={`text-red-500 text-xs ${error == 400 ? 'inline' : 'hidden'}`}>* Email Tidak Boleh Sama</p>
                            </div>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={items.email} 
                                    onChange={e => setItems({ ...items, email: e.target.value })}
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
                                />
                            </div>
                        </div>
                        <div className="mb-5">
                            <label>Department :</label>
                            <SelectPaginate
                            source={'department'}
                            itemLabel={['name']}
                            selectName={'Department'}
                            handleSelectChange={department => setItems({...items, department})}
                            selectValue={items.department}
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
                            <button disabled={disabled} type="submit" className="bg-cyan-400 text-white p-2 rounded w-1/2 me-3">Update User</button>
                            <button type="button" onClick={fetchItems} className="bg-red-400 text-white p-2 rounded w-1/2">Clear</button>
                        </div>
                    </form>
                </div>
            </Block>
        </Layout>
  )
}

export default UpdateUser