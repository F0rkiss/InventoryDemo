import React, {useState, useEffect} from 'react'
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { Page, Block } from 'framework7-react';
import { useParams } from 'react-router-dom';
import Back from '../component/Back';
import Layout from '../component/Layout';
import { DecryptID } from '../../helper/EncryptHelper';
import Swal from 'sweetalert2';

function UpdateRole() {
    const [items, setItems] = useState({
        approval_step: '',
        user_id: '',
        invent_type_request_id: '',
        is_upline: '',
        note: '',
        // Display values
        user_name: '',
        type_request_name: '',
        type_request_jenis: '',
        type_request_description: ''
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
                approval_step: data.approval_step || '',
                user_id: data.user_id || '',
                invent_type_request_id: data.invent_type_request_id || '',
                is_upline: data.is_upline === 1 ? 'yes' : 'no',
                note: data.note || '',
                // Display values
                user_name: data.user?.EmpName || '',
                type_request_name: data.type_request?.name || '',
                type_request_jenis: data.type_request?.jenis || '',
                type_request_description: data.type_request?.description || ''
            });
        } catch (error) {
            console.error('Error fetching approval step:', error);
        }
    };
    // console.log(data)
    
    const handleSubmit = async (e) => {
        e.preventDefault();        
        try {
            if (disabled) return;
    
            setDisabled(true);
            await api.put(`inventApprovalStep-update/${decryptedId}`, {
                approval_step: parseInt(items.approval_step),
                user_id: parseInt(items.user_id),
                invent_type_request_id: parseInt(items.invent_type_request_id),
                is_upline: items.is_upline === 'yes' ? 1 : 0,
                note: items.note
            });

            Swal.fire({
                title: 'Approval Step berhasil diperbarui!',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });

            navigate('/approval-step/list-approval-step');
        } catch (error) {
            console.error('Submit Error:', error);

            Swal.fire({
                icon: 'error',
                title: 'Gagal Update Approval Step',
                text: err.response?.data?.msg || 'Ada kesalahan dalam sistem',
            });
    
            // Cek error yang aman
            const statusCode = error?.response?.data?.statusCode || 500;
            setError(statusCode);
        } finally {
            setDisabled(false);
        }
    }
    
    
  return (
        <Layout title={'Update Approval Step'}>
            <Block>
                <Back goHome={() => navigate('/approval-step/list-approval-step')} />
                <div className='bg-white rounded shadow-sm p-3 mt-4'>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-5">
                            <label>User:</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                                <input 
                                    type="text" 
                                    name="user_name" 
                                    value={items.user_name} 
                                    onChange={e => setItems({ ...items, user_name: e.target.value })}
                                    maxLength={50}
                                    placeholder='Employee Name'
                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light capitalize"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-5">
                            <label>Approval Step:</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                                <input 
                                    type="number" 
                                    name="approval_step" 
                                    value={items.approval_step} 
                                    onChange={e => setItems({ ...items, approval_step: e.target.value })}
                                    min="1"
                                    max="10"
                                    step="1"
                                    placeholder='Approval Step Number'
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
                                    name="type_request_name" 
                                    value={items.type_request_name} 
                                    onChange={e => setItems({ ...items, type_request_name: e.target.value })}
                                    maxLength={50}
                                    placeholder='Type Request Name'
                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light capitalize"
                                    required
                                />
                            </div>
                        </div>
                        {/* <div className="mb-5">
                            <label>Jenis Request:</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                                <input 
                                    type="text" 
                                    name="type_request_jenis" 
                                    value={items.type_request_jenis} 
                                    onChange={e => setItems({ ...items, type_request_jenis: e.target.value })}
                                    maxLength={50}
                                    placeholder='Jenis Request'
                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light capitalize"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-5">
                            <label>Description:</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                                <input 
                                    type="text" 
                                    name="type_request_description" 
                                    value={items.type_request_description} 
                                    onChange={e => setItems({ ...items, type_request_description: e.target.value })}
                                    maxLength={50}
                                    placeholder='Description'
                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light capitalize"
                                    required
                                />
                            </div>
                        </div> */}
                        <div className="mb-5">
                            <label>Is Upline:</label>
                            <div className=''>
                                <select 
                                    name="is_upline" 
                                    value={items.is_upline} 
                                    onChange={e => setItems({ ...items, is_upline: e.target.value })}
                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light capitalize bg-white p-2 rounded-md border-solid border-gray-300 border"
                                    required
                                >
                                    <option value="">Select Option</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                            </div>
                        </div>
                        <div className="mb-5">
                            <label>Note:</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                                <input 
                                    type="text" 
                                    name="note" 
                                    value={items.note} 
                                    onChange={e => setItems({ ...items, note: e.target.value })}
                                    maxLength={50}
                                    placeholder='Note'
                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light capitalize"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex">
                            <button disabled={disabled} type="submit" className="bg-cyan-400 text-white p-2 rounded w-1/2 me-3">Update Approval Step</button>
                            <button type="button" onClick={fetchItems} className="bg-red-400 text-white p-2 rounded w-1/2">Clear</button>
                        </div>
                    </form>
                </div>
            </Block>
        </Layout>
  )
}

export default UpdateRole