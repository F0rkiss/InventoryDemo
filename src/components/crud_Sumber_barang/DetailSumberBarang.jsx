import React, {useState, useEffect} from 'react'
import api from '../../api/api'
import { useParams } from 'react-router-dom'
import { Page, Block } from 'framework7-react';
import Back from '../component/Back';
import { useNavigate } from 'react-router-dom';
import Loader from '../component/Loader';
import Transition from '../component/Transition';
import Layout from '../component/Layout';
import { DecryptID } from '../../helper/EncryptHelper';
import DateFormat from '../../helper/DateFormatHelper';

function DetailSumberBarang() {

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
            const response = await api.get(`inventSumberBarang-detail/${decryptedId}`)
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
    <Layout title={'Detail Sumber Barang'}>
        <Block>
            <Back goHome={() => navigate('/sumber-barang/list-sumber-barang')}/>
                {
                    loading ?
                    (
                        <Loader Class={'mt-20'} />
                    ) : (
                    <Transition contentVisible={contentVisible}>
                        {/* <p>{item.msg}</p> */}
                    <div className='bg-white rounded shadow-sm overflow-hidden p-6 text-lg mt-8'>
                        <p className='capitalize'><b>Type: </b><br />{item.data?.name}</p>
                        <p><b>Description: </b><br />{item.data?.description}</p>
                        <p><b>Created at: </b><br />{DateFormat(item.data?.created_at)}</p>
                        <p><b>Last updated: </b><br />{DateFormat(item.data?.updated_at)}</p>
                    </div>
                    </Transition>
                    )
                }
        </Block>        
    </Layout>
  )
}

export default DetailSumberBarang;