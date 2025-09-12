import React, {useState, useEffect} from 'react'
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { Page, Block } from 'framework7-react';
import { useParams } from 'react-router-dom';
import Back from '../component/Back';
import Layout from '../component/Layout';
import { DecryptID } from '../../helper/EncryptHelper';

function UpdateRole() {
    const [items, setItems] = useState({
        name : '',
    })
    const [decryptedId, setDecryptedId] = useState('')
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
            const response = await api.get(`inventApprovalStep-detail/${decryptedId}`);
            const data = response.data.data;
            setItems({
                approval_step: null,
                user_id: null,
                invent_type_request_id: null,
                is_upline: null,
                note: ""
            });
        } catch (error) {

        }
    };
    // console.log(data)
    
    const handleSubmit = async (e) => {
        e.preventDefault();        
        try {
            if (disabled) return;
    
            setDisabled(true);
            await api.put(`inventApprovalStep-update/${decryptedId}`, {
                approval_step: null,
                user_id: null,
                invent_type_request_id: null,
                is_upline: null,
                note: ""
            });
            navigate('/approval-step/list-approval-step');
        } catch (error) {
            console.error('Submit Error:', error);
    
            // Cek error yang aman
            const statusCode = error?.response?.data?.statusCode || 500;
            setError(statusCode);
        } finally {
            setDisabled(false);
        }
    }
    
    
  return (
        <Layout title={'Update User'}>
            <Block>
                <Back goHome={() => navigate('/approval-step/list-approval-step')} />
                <div className='bg-white rounded shadow-sm p-3 mt-4'>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-5">
                            <label>User:</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={items.approval_step} 
                                    onChange={e => setItems({ ...items, name: e.target.value })}
                                    maxLength={50}
                                    placeholder='Nama'
                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light capitalize"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-5">
                            <label>Approval Step:</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={items.appro} 
                                    onChange={e => setItems({ ...items, name: e.target.value })}
                                    maxLength={50}
                                    placeholder='Approval Step'
                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light capitalize"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-5">
                            <label>Type Request:</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={items.appro} 
                                    onChange={e => setItems({ ...items, name: e.target.value })}
                                    maxLength={50}
                                    placeholder='Type Request'
                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light capitalize"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-5">
                            <label>Atasan:</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={items.appro} 
                                    onChange={e => setItems({ ...items, name: e.target.value })}
                                    maxLength={50}
                                    placeholder='Atasan Keberapa'
                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light capitalize"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-5">
                            <label>Note:</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={items.appro} 
                                    onChange={e => setItems({ ...items, name: e.target.value })}
                                    maxLength={50}
                                    placeholder='Note'
                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light capitalize"
                                    required
                                />
                            </div>
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

export default UpdateRole