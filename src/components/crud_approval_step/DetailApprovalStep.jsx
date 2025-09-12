import React, {useState, useEffect} from 'react'
import api from '../../api/api'
import { useParams } from 'react-router-dom'
import { Page, Block } from 'framework7-react';
import CustomNavbar from '../component/CustomNavbar';
import Back from '../component/Back';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '../../assets/image/gambar/Profile_avatar_placeholder_large.png'
import Loader from '../component/Loader';
import Transition from '../component/Transition';
import Layout from '../component/Layout';
import { DecryptID } from '../../helper/EncryptHelper';

function DetailApprovalStep() {

    const [item, setItems] = useState({})
    const {id} = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)
    const [decryptedId, setDecryptedId] = useState('')
    
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
            setLoading(true)
            const response = await api.get(`/inventApprovalStep-detail/${decryptedId}`)
            const data = response.data.data
            setItems(data)
        } catch (error) {
            console.error('API Error:', error.response?.data || error.message);
        } finally {
            setLoading(false)
            setTimeout(() => setContentVisible(true), 50)
        }
    }

  return (
    <Layout title={'Detail Approval Step'}>
        <Block>
            <Back goHome={() => navigate('/approval-step/list-approval-step')}/>
                {
                    loading ?
                    (
                        <Loader Class={'mt-20'} />
                    ) : (
                    <Transition contentVisible={contentVisible}>
                        <div className='bg-white rounded-xl shadow overflow-hidden p-6 mt-8'>
                            <div className='flex items-center gap-4 pb-5 border-b border-slate-100'>
                            <div className='h-12 w-12 capitalize rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-semibold'>
                            {(item.user?.EmpName || '-')
                                .split(' ')
                                .slice(0, 2) // ambil max 2 kata
                                .map(word => word[0])
                                .join('')}
                            </div>
                            <div className='min-w-0'>
                                    <p className='text-xl font-semibold text-slate-900 truncate capitalize'>
                                        {item.user?.EmpName || '-'}
                                    </p>
                                    <div className='flex flex-wrap items-center gap-2 mt-1'>
                                        <span className='px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100'>
                                            Step: {item.approval_step || '-'}
                                        </span>
                                        {item.type_request?.name && (
                                            <span className='px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-100'>
                                                {item.type_request.name}
                                            </span>
                                        )}
                                        {item.type_request?.jenis && (
                                            <span className='px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-100'>
                                                {item.type_request.jenis}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-5'>
                                <div className='p-4 rounded-lg bg-slate-50 border border-slate-100'>
                                    <p className='text-xs uppercase tracking-wide text-slate-500'>Approval Step</p>
                                    <p className='mt-1 text-slate-900'>{item.approval_step || '-'}</p>
                                </div>
                                <div className='p-4 rounded-lg bg-slate-50 border border-slate-100'>
                                    <p className='text-xs uppercase tracking-wide text-slate-500'>Type Request</p>
                                    <p className='mt-1 text-slate-900'>{item.type_request?.name || '-'}</p>
                                </div>
                                <div className='p-4 rounded-lg bg-slate-50 border border-slate-100'>
                                    <p className='text-xs uppercase tracking-wide text-slate-500'>Jenis Type Request</p>
                                    <p className='mt-1 text-slate-900'>{item.type_request?.jenis || '-'}</p>
                                </div>
                                <div className='p-4 rounded-lg bg-slate-50 border border-slate-100'>
                                    <p className='text-xs uppercase tracking-wide text-slate-500'>Phone</p>
                                    <p className='mt-1 text-slate-900'>{item.Emp || '-'}</p>
                                </div>
                                <div className='md:col-span-2 p-4 rounded-lg bg-slate-50 border border-slate-100'>
                                    <p className='text-xs uppercase tracking-wide text-slate-500'>Deskripsi Type Request</p>
                                    <p className='mt-1 text-slate-900 whitespace-pre-wrap'>
                                        {item.type_request?.description || '-'}
                                    </p>
                                </div>
                                <div className='md:col-span-2 p-4 rounded-lg bg-indigo-50 border border-indigo-100'>
                                    <p className='text-xs uppercase tracking-wide text-indigo-700'>Note</p>
                                    <p className='mt-1 text-slate-900 whitespace-pre-wrap'>
                                        {item.note || '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Transition>
                    )
                }
        </Block>        
    </Layout>
  )
}

export default DetailApprovalStep