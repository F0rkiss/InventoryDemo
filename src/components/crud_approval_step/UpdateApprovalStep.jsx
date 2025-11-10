import React, {useState, useEffect} from 'react'
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { Page, Block } from 'framework7-react';
import { useParams } from 'react-router-dom';
import Back from '../component/Back';
import Layout from '../component/Layout';
import { DecryptID } from '../../helper/EncryptHelper';
import Swal from 'sweetalert2';
import SelectPaginate from '../component/SelectPaginate';
import useAuth from '../../hooks/useAuth';

function UpdateApprovalStep() {
    const [items, setItems] = useState({
        approval_step: '',
        back_to_approval_step: '',
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

    const { user, type_request } = useAuth();
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
                back_to_approval_step: data.back_to_approval_step || '',
                user_id: data.user_id || '',
                invent_type_request_id: data.invent_type_request_id || '',
                is_upline: data.is_upline === 1 ? 'yes' : 'no',
                isAdminApproved: data.isAdminApproved === 1 ? 'yes' : 'no',
                note: data.note || '',
                // Display values
                user_name: data.user?.EmpName || '',
                type_request_name: data.type_request?.name || '',

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
                back_to_approval_step: parseInt(items.back_to_approval_step),
                user_id: parseInt(items.user_id),
                invent_type_request_id: parseInt(items.invent_type_request_id),
                is_upline: items.is_upline === 'yes' ? 1 : 0,
                isAdminApproved: items.isAdminApproved === 'yes' ? 1 : 0,
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
                text: error.response?.data?.msg || 'Ada kesalahan dalam sistem',
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
                        <SelectPaginate 
                            selectValue={
                            items.user_id
                                ? {label: items.user_name } // default selected
                                : null
                            }
                            source={'inventUser'}
                            selectName={'User'}
                            itemLabel={['EmpName']}
                            handleSelectChange={selectedUser =>
                            setItems({
                                ...items,
                                user_id: selectedUser?.value || '',
                                user_name: selectedUser?.label || ''
                            })
                            }
                            required
                        />
                        </div>
                        <div className="mb-5">
                            <div className="relative group inline-flex items-center gap-1">
                                <label>Approval Step:</label>
                                <i className="bx bx-info-circle text-yellow-500 cursor-pointer"></i>
                                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-hover:delay-0 delay-500 bg-white border border-gray-300 text-gray-700 text-xs rounded-md px-2 py-1 w-56 shadow-sm pointer-events-none">
                                Urutan persetujuan berdasarkan nomor yang menentukan siapa pengguna yang melakukan approval terlebih dahulu.
                                </div>
                            </div>
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
                            <div className="relative group inline-flex items-center gap-1">
                                <label>Back to Approval Step:</label>
                                <i className="bx bx-info-circle text-yellow-500 cursor-pointer"></i>
                                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-hover:delay-0 delay-500 bg-white border border-gray-300 text-gray-700 text-xs rounded-md px-2 py-1 w-56 shadow-sm pointer-events-none">
                                Jika User menolak, pembuat MR harus mengajukan ulang permintaan approval ke step yang ditentukan di field ini.
                                </div>
                            </div>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                                <input 
                                    type="number" 
                                    name="back_to_approval_step" 
                                    value={items.back_to_approval_step} 
                                    onChange={e => setItems({ ...items, back_to_approval_step: e.target.value })}
                                    min="1"
                                    max="10"
                                    step="1"
                                    placeholder='Back to Approval Step Number'
                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light capitalize"
                                />
                            </div>
                        </div>
                        <div className="mb-5">
                            <label>Type Request:</label>
                            <SelectPaginate 
                                selectValue={
                                    items.invent_type_request_id
                                        ? { label: items.type_request_name, value: items.invent_type_request_id }
                                        : null
                                }
                                source={'inventTypeRequest'}
                                selectName={'Type Request'}
                                itemLabel={['name']}
                                handleSelectChange={selectedType => 
                                    setItems({ 
                                        ...items,
                                        invent_type_request_id: selectedType?.value || '',
                                        type_request_name: selectedType?.label || ''
                                    })
                                }
                                required
                            />


                        </div>

                        <div className="mb-5">
                            <div className="relative group inline-flex items-center gap-1 flex justify-between">
                                <label>Is Upline:</label>
                                <i className="bx bx-info-circle text-yellow-500 cursor-pointer"></i>
                                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-500 group-hover:delay-0 bg-white border border-gray-300 text-gray-700 text-xs rounded-md px-2 py-1 w-56 shadow-sm pointer-events-none">
                                Atasan dari departemen user
                                </div>
                            </div>
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
                            <div className="relative group inline-flex items-center gap-1">
                                <label>is Admin Approved:</label>
                                <i className="bx bx-info-circle text-yellow-500 cursor-pointer"></i>
                                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-500 group-hover:delay-0 bg-white border border-gray-300 text-gray-700 text-xs rounded-md px-2 py-1 w-56 shadow-sm pointer-events-none">
                                user approval yang perlu membuat barang saat menyetujui
                                </div>
                            </div>
                            <div className=''>
                                <select 
                                    name="isAdminApproved" 
                                    value={items.isAdminApproved} 
                                    onChange={e => setItems({ ...items, isAdminApproved: e.target.value })}
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

export default UpdateApprovalStep