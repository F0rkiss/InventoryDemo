import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DecryptID, encrypting } from '../../helper/EncryptHelper'
import api from '../../api/api'
import Swal from 'sweetalert2'
import Layout from '../component/Layout'
import { Block } from 'framework7-react'
import Back from '../component/Back'
import Loader from '../component/Loader'
import BillingCards from '../component/cards/BillingCards'
import Transition from '../component/Transition'
const DetailBilling = () => {

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [decryptedId, setdecryptedId] = useState('')
    const {id} = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        const decrypting = DecryptID(id)
        setdecryptedId(decrypting)
        if (!decrypting) {
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
            const response = await api.get(`billing/${decryptedId}`)
            const data = response.data.data
            if (data.length == 0) {
                navigate(-1)
            }
            setItems([data])
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Ada Kesalahan Dalam Sistem'
            })
        } finally {
            setLoading(false)
        }
    }

    const goToUpdate = async (id) => {
        const encryptingID = await encrypting(id)
        navigate(`/billing/update-billing/${encryptingID}`)
    }

    const deleteItems = async (id) => {
        try {
            const result = await Swal.fire({
              title: `Apakah Anda Mau Menghapus Billing ini`,
              icon: 'question',
              showDenyButton: true,
              confirmButtonText: 'Yes',
              denyButtonText: 'No',
              customClass: {
                actions: 'my-actions',
                confirmButton: 'order-2',
                denyButton: 'order-3',
              },
            });
      
            if (result.isConfirmed) {
              await api.delete(`/billing/${id}`);
              setItems(items.filter((item) => item.id !== id));
              Swal.fire('Terhapus!', '', 'success');
              navigate(-1)
            }
          } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Menghapus Billing',
                text:'Ada Kesalahan Dalam Sistem'
            })
          }
    }

    return (
        <Layout title={'Detail Billing'}>
            <Block>
                <Back goHome={() => navigate(-1)}/>
                <Transition contentVisible={!loading}>
                    {
                        items.map((item) => (
                            <BillingCards 
                            key={item.id} 
                            item={item}
                            items={items}
                            setItems={setItems}
                            className={`mt-4`}
                            desktop={true}
                            goToUpdate={goToUpdate}
                            deleteItems={deleteItems}
                            />
                        ))
                    }
                </Transition>
                {
                    
                    loading && <Loader Class={'mt-44'} /> 
                }
            </Block>
        </Layout>
    )
}

export default DetailBilling