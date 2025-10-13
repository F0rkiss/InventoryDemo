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

function DetailUser() {

    const [item, setItems] = useState({})
    // Membuat alias untuk mempermudah akses, sama seperti di Profile.jsx
    const user = item.data; 

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
            const response = await api.get(`/inventUser-detail/${decryptedId}`)
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
    <Layout title={'Detail User'}>
        <Block>
        {loading ? (
          <Loader Class="mt-72" />
        ) : (
            <div className='xs:px-0 md:px-4'>
                <Back goHome={() => navigate('/user/list-user')}/>
                <p className='lg:text-3xl text-2xl font-semibold capitalize my-4'>Detail User</p>
                    <Transition contentVisible={contentVisible}>
                    {/* Mengadopsi struktur grid dari Profile.jsx */}
                    <div className='grid grid-cols-1 md:grid-cols-2 bg-white border border-gray-300 shadow-xl shadow-gray-200 rounded-2xl mt-6 p-6 gap-x-8'>
                        {/* Kolom 1: Personal Information */}
                        <div className="col-start-1">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                Personal Information
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-gray-500 text-sm">Employee Name</p>
                                    <p className="text-gray-900 font-medium capitalize">
                                        {user?.EmpName || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Date of Birth</p>
                                    <p className="text-gray-900 font-medium capitalize">
                                        {user?.DOB || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Role</p>
                                    <p className="text-gray-900 font-medium capitalize">
                                        {item?.role || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Employee Code</p>
                                    <p className="text-gray-900 font-medium capitalize">
                                        {user?.EmpCode || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Email</p>
                                    <p className={`font-medium ${user?.email_verified_at ? 'text-gray-900' : 'text-yellow-600'}`}>
                                        {user?.email || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Phone</p>
                                    <p className="text-gray-900 font-medium">{user?.EmpPhone || '-'}</p>
                                </div>
                            </div>
                        </div>
                        {/* Kolom 2: Employee Information */}
                        <div className="col-start-1 md:col-start-2 mt-6 md:mt-0">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                Employee Information
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-gray-500 text-sm">Tingkat</p>
                                    <p className="text-gray-900 font-medium capitalize">
                                        {user?.level_name || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Posisi</p>
                                    <p className="text-gray-900 font-medium capitalize">
                                        {user?.posisi_name || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Posisi Atasan 1</p>
                                    <p className="text-gray-900 font-medium capitalize">
                                        {user?.posisi_upline_name || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Posisi Atasan 2</p>
                                    <p className="text-gray-900 font-medium capitalize">
                                        {user?.posisi_upline2_name || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Departmen</p>
                                    <p className="text-gray-900 font-medium">{user?.str_name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Divisi</p>
                                    <p className="text-gray-900 font-medium capitalize">
                                        {user?.str_upline_name || '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    </Transition>
            </div>
        )}
        </Block>        
    </Layout>
  )
}

export default DetailUser