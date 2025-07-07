import React, {useState, useEffect} from 'react'
import api from '../../api/api'
import { useParams } from 'react-router-dom'
import { Page, Block } from 'framework7-react';
import CustomNavbar from '../component/CustomNavbar';
import Back from '../component/Back';
import { useNavigate } from 'react-router-dom';
import BillingDetailBillingAvatar from '../../assets/image/gambar/Profile_avatar_placeholder_large.png'
import Loader from '../component/Loader';
import Transition from '../component/Transition';
import Layout from '../component/Layout';
import { DecryptID } from '../../helper/EncryptHelper';
import DateFormatToIDN from '../../helper/DateFormatHelper'

function DetailBilling() {

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
            const response = await api.get(`/billing-detail/${decryptedId}`)
            const data = response.data.data
            setItems(data)
        } catch (error) {
            console.error('API Error:', error.response?.data || error.message);
        } finally {
            setTimeout(() => setContentVisible(true), 50)
        }
        setLoading(false)
    }
    
    
    return (
    <Layout title={'Detail Billing'}>
        <Block>
            <Back goHome={() => navigate('/billing/list-billing')}/>
                {
                    loading ?
                    (
                        <Loader Class={'mt-20'} />
                    ) : (
                    <Transition contentVisible={contentVisible}>
                        {/* <p>{item.msg}</p> */}
                    <div className='bg-white rounded-2vw shadow-sm overflow-hidden p-6 text-lg mt-8'>
                        <div className='flex justify-between'>
                        <p className='capitalize'><b>Name : </b>{item.user?.EmpName || "TIDAK ADA"}</p>
                        <i className={`bx bxs-circle ${item.status === 'aktif' ? 'text-green-500' : item.status === 'diproses' ? 'text-yellow-500' :'text-red-500'}`}></i>
                        </div>
                        <p className='capitalize'><b>Penanggung Jawab : </b>{item.penanggungJawab}</p>

                        {/* <p><b>Phone : </b>{item.data?.EmpPhone}</p> */}
                        <p><b>Biaya :</b>{new Intl.NumberFormat().format(item.biaya).replace(/,/g, '.')}</p>
                        <p><b>Note :</b>{item.note}</p>
                        <p><b>Tanggal Berlangganan :</b>{DateFormatToIDN(item.tanggal_berlangganan, false)}</p>
                        <p><b>Tanggal Selesai Berlangganan :</b>{DateFormatToIDN(item.tanggal_selesai_berlangganan, false)}</p>
                        <p><b>Tanggal Pembayaran Berlangganan :</b>{DateFormatToIDN(item.tanggal_pembayaran,false)}</p>
                    </div>
                    </Transition>
                    )
                }
        </Block>        
    </Layout>
  )
}

export default DetailBilling