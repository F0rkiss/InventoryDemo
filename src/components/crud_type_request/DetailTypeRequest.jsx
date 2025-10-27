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
import DateFormat from '../../helper/DateFormatHelper';
import InfoRow from '../component/infoRow';

function DetailTypeRequest() {

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
            const response = await api.get(`inventTypeRequest-detail/${decryptedId}`)
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
    <Layout title={'Detail Type Request'}>
        <Block>
            <Back goHome={() => navigate('/type-request/list-type-request')}/>
                {
                    loading ?
                    (
                        <Loader Class={'mt-20'} />
                    ) : (
                    <Transition contentVisible={contentVisible}>
                        {/* <p>{item.msg}</p> */}
                        <p className="text-xl sm:text-2xl lg:text-3xl font-semibold capitalize mt-3 ml-2">
                                Type Request Detail
                            </p>
                    <div className='bg-white rounded shadow-sm overflow-hidden p-6 text-lg mt-4'>
                        <InfoRow label="Nama Type Request" value={item.name} />
                        <InfoRow label="Jenis Type Request" value={item.jenis} />
                        <InfoRow label="Deskripsi" value={item.description} />
                        <div className='capitalize'>
                        <InfoRow label="Diambil Dari Stok" value={item.is_stok} />
                        </div>
                        <InfoRow label="Tanggal Dibuat" value={DateFormat(item.created_at)} />
                        <InfoRow label="Tanggal diPerbarui Di" value={DateFormat(item.updated_at)} />
                    </div>
                    </Transition>
                    )
                }
        </Block>        
    </Layout>
  )
}

export default DetailTypeRequest;