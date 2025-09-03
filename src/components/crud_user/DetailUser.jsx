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
            <div className='px-4'>
                <Back goHome={() => navigate('/user/list-user')}/>
                <p className='lg:text-3xl text-2xl font-semibold capitalize my-4'>Detail User</p>
                    <Transition contentVisible={contentVisible}>
                    <div className='bg-white rounded-md shadow-sm overflow-hidden p-6 text-base mt-8'>
                        <p className='text-gray-400'>
                            Name <span className='font-medium'>{item.data?.EmpName}</span>
                        </p>
                        <p className='capitalize'>
                            Role <span className='font-medium'>{item.data?.role?.name}</span>
                        </p>
                        <p className='capitalize'>
                            Email <span className='font-medium'>{item.data?.email}</span>
                        </p>
                        <p className='capitalize'>
                            Phone <span className='font-medium'>{item.data?.EmpPhone}</span>
                        </p>
                        <p>Divisi {item.data?.posisi_name || "Not Assign yet"}</p>
                        <p>Department {item.data?.str_name || "Not Assign yet"}</p>
                        <p>Tingkatan {item.data?.level_name || "Not Assign yet"}</p>
                    </div>
                    </Transition>
            </div>
        </Block>        
    </Layout>
  )
}

export default DetailUser