import React, {useEffect, useState} from 'react'
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { Page, Block } from 'framework7-react';
import Back from '../component/Back';
import Layout from '../component/Layout';
import Swal from 'sweetalert2';

function CreateApprovalStep() {
    const [items, setItems] = useState({
        name : '',
        email : '',
        password : '',
        approval_step : null,
        department : null,
        divisi : null,
    })
    const [disabled, setDisabled] = useState(false)
    const [error, setError] = useState(null)

    const approval_step = ([
        {value : 'admin', label : 'Admin'},
        {value : 'approval_step', label : 'approval_step'}
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

            await api.post('inventApprovalStep-create', {
                name : items.name,
            })
            navigate('/approval_step/list-approval_step')
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Membuat Approval Step MR',
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
            approval_step : null,
            department : null,
            divisi : null,
        })
    }
  return (
    <div>
        <Layout title={'Create Approval Step'}>
            <Block>
                <Back goHome={() => navigate('/approval_step/list-approval_step')}/>
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
                        <div className="flex">
                            <button disabled={disabled} type="submit" className="bg-cyan-400 text-white p-2 rounded w-1/2 me-3">Create approval_step</button>
                            <button type="button" onClick={clearAll} className="bg-red-400 text-white p-2 rounded w-1/2">Clear</button>
                        </div>
                    </form>
                </div>
            </Block>
        </Layout>
    </div>
  )
}

export default CreateApprovalStep