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

function DetailNavigationGroups() {

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
            const response = await api.get(`inventNavigationGroup-detail/${decryptedId}`)
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
    <Layout title={'Detail Navigation Group'}>
        <Block>
            <Back goHome={() => navigate('/navigations/list-navigations')}/>
                {
                    loading ?
                    (
                        <Loader Class={'mt-20'} />
                    ) : (
                    <Transition contentVisible={contentVisible}>
                        {/* <p>{item.msg}</p> */}
                    <div className='bg-white border rounded-lg overflow-hidden p-6 text-lg mt-8'>
                        <p className='capitalize'><b>Name : </b>{item.role?.name}</p>
                        <p><b>Menu Access : </b>{item.navigation_menu?.name}</p>
                        <p><b>Permission :</b></p>
                        <p className='flex gap-2 text-sm max-xs:text-sm'>
                            Create:
                            <span className={item.create_access === 1 ? 'text-green-500' : 'text-red-500'}>
                                {item.create_access === 1 ? 'Allowed' : 'Not Allowed'}
                            </span>
                        </p>
                        {/* READ ACCESS */}
                        <p className='flex gap-2 text-sm max-xs:text-sm'>
                            Read:
                            <span className={item.read_access === 1 ? 'text-green-500' : 'text-red-500'}>
                                {item.read_access === 1 ? 'Allowed' : 'Not Allowed'}
                            </span>
                        </p>
                        {/* UPDATE ACCESS */}
                        <p className='flex gap-2 text-sm max-xs:text-sm'>
                            Update:
                            <span className={item.update_access === 1 ? 'text-green-500' : 'text-red-500'}>
                                {item.update_access === 1 ? 'Allowed' : 'Not Allowed'}
                            </span>
                        </p>
                        {/* DELETE ACCESS */}
                        <p className='flex gap-2 text-sm max-xs:text-sm'>
                            Delete:
                            <span className={item.delete_access === 1 ? 'text-green-500' : 'text-red-500'}>
                                {item.delete_access === 1 ? 'Allowed' : 'Not Allowed'}
                            </span>
                        </p>
                    </div>
                    </Transition>
                    )
                }
        </Block>        
    </Layout>
  )
}

export default DetailNavigationGroups;