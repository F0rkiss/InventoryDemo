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
        role : null
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
            const response = await api.get(`inventUser-detail/${decryptedId}`);
            const data = response.data.data;
            setItems({
                name: data.data?.EmpName || '',
                role: role.find(r => r.value === data.data?.role?.name)
            });
            console.log('Fetched User:', role);
        } catch (error) {
            console.log("apa yang salah anjengggg")
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();        
        try {
            if (disabled) {
                return
            }
            setDisabled(true)
            await api.put(`inventUser-update/${decryptedId}`, {
                name : items.name,
                role: items.role?.value
            })
        navigate('/user/list-user')
        } catch (error) {
            setError(error.response.data.statusCode)
        } finally {
            setDisabled(false)
            setError(error.response.data.statusCode)
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
                                    disabled
                                />
                            </div>
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