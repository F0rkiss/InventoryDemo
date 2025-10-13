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
            <div className="px-4">
                <Back goHome={() => navigate('/billing/list-billing')}/>
                <p className='lg:text-3xl text-2xl font-semibold capitalize my-4'>Detail Billing</p>
                {
                    loading ?
                    (
                        <Loader Class={'mt-20'} />
                    ) : (
                    <Transition contentVisible={contentVisible}>
                        <div className="w-full font-inter grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* KARTU 1: INFORMASI UTAMA */}
                            <div className="bg-white border rounded-lg p-6 flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-bold capitalize text-2xl">{item.user?.EmpName || "TIDAK ADA"}</h2>
                                    <div className="flex items-center gap-2">
                                        <i className={`bx bxs-circle ${item.status === 'aktif' ? 'text-green-500' : item.status === 'diproses' ? 'text-yellow-500' :'text-red-500'}`}></i>
                                        <span className={`text-sm font-medium capitalize ${item.status === 'aktif' ? 'text-green-600' : item.status === 'diproses' ? 'text-yellow-600' :'text-red-600'}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Penanggung Jawab</span>
                                        <span className="font-medium capitalize">{item.penanggungJawab}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Biaya</span>
                                        <span className="font-medium text-green-600">Rp {new Intl.NumberFormat().format(item.biaya).replace(/,/g, '.')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* KARTU 2: TANGGAL & DETAIL */}
                            <div className="bg-white border rounded-lg p-6 flex flex-col">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">Informasi Tanggal</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Tanggal Berlangganan</span>
                                        <span className="font-medium">{DateFormatToIDN(item.tanggal_berlangganan, false)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Tanggal Selesai</span>
                                        <span className="font-medium">{DateFormatToIDN(item.tanggal_selesai_berlangganan, false)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Tanggal Pembayaran</span>
                                        <span className="font-medium">{DateFormatToIDN(item.tanggal_pembayaran, false)}</span>
                                    </div>
                                </div>
                                
                                {item.note && (
                                    <div className="mt-6 pt-4 border-t">
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Catatan</h4>
                                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{item.note}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Transition>
                    )
                }
            </div>
        </Block>        
    </Layout>
  )
}

export default DetailBilling