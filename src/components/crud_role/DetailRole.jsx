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

function DetailRole() {

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
            const response = await api.get(`/inventRole-detail/${decryptedId}`)
            const data = response.data.data
            console.log('fetched items: ', data.data)
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
            <Back goHome={() => navigate('/role/list-role')}/>
                {
                    loading ?
                    (
                        <Loader Class={'mt-20'} />
                    ) : (
                    <Transition contentVisible={contentVisible}>
                        {/* <p>{item.msg}</p> */}
                    <div className='bg-white rounded shadow-sm overflow-hidden p-6 text-lg mt-8'>
                        <p className='capitalize'><b>Name : </b>{item.data?.name}</p>
                        <p><b>Email : </b>{item.data?.created_at}</p>
                        <p className='capitalize'><b>Role : </b>{item.data?.updated_at}</p>
                        {/* <p><b>Divisi : </b>{item.data?.str_upline_name || "Not Assign yet"}</p>
                        <p><b>Department : </b>{item.data?.str_name || "Not Assign yet"}</p>
                        <p><b>Kode Divisi : </b>{item.data?.department?.divisi?.kode || "Not Assign yet"}</p> */}
                    </div>
                    </Transition>
                    )
                }
        </Block>        
    </Layout>
  )
}

export default DetailRole