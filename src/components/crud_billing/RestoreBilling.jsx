import React, { useEffect, useRef, useState } from 'react'
import Layout from '../component/Layout'
import SearchBar from '../component/SearchBar'
import api from '../../api/api'
import { Block } from 'framework7-react'
import BillingCards from '../component/cards/BillingCards'
import ScrollPagination from '../component/ScrollPagination'
import Transition from '../component/Transition'
import Back from '../component/Back'
import Loader from '../component/Loader'
import DataEmpty from '../component/DataEmpty'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'

const RestoreBilling = () => {

    const [items, setItems] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [nextCursor, setNextCursor] = useState(null)
    const [firstVisible, setFirstVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const typingTimeoutRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchItems()
    }, [searchTerm])

    const fetchItems = async() => {
        try {
            setLoading(true)
            const response = await api.get(searchTerm ? `billingTrash/${searchTerm}` : 'billing/trash')
            const data = response.data.data
            setItems(data.data)
            setNextCursor(data.next_cursor)
        } catch (error) {
        } finally {
            setLoading(false)
            setFirstVisible(true)
        }
    }

    const fetchMoreItems = async() => {
        if (loading || !nextCursor) return;
        try {
            setLoading(true)
            const response = await api.get(searchTerm ? `billingTrash/${searchTerm}` : 'billing/trash', {
                params : {
                    cursor : nextCursor
                }
            })
            const data = response.data.data
            setItems((prevItems) => {
                const existingIds = new Set(prevItems.map(item => item.id))
                const newIds = data.data.filter((item) => !existingIds.has(item.id))
                return [...prevItems, ...newIds]
            })
            setNextCursor(data.next_cursor)
        } catch (error) {
        } finally {
            setLoading(false)
        }
    }

      
    const handleSearchChange = (query) => {
        setSearchQuery(query);
        if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current); 
        }
        typingTimeoutRef.current = setTimeout(() => {
        setSearchTerm(query); 
        }, 750);
    };
    
    const restoreItems =  async (id) => {
        try {
            const result = await Swal.fire({
              title: `Apakah Anda Mau Restore Billing Ini`,
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
              await api.get(`/billing/restore/${id}`);
              setItems(items.filter((item) => item.id !== id));
              await Swal.fire('Berhasil!', '', 'success');
            }
          } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Merestore Billing',
                text:'Ada Kesalahan Dalam Sistem'
            })
          }
    }

    return (
        <Layout title={'Restore Billing'}>
            <SearchBar onChange={handleSearchChange} values={searchQuery} disable={loading}/>
            <Block>                   
                <Back goHome={() => navigate('/billing/list-billing')} />
                <div className='ms-3 mb-6 mt-3 flex justify-between'>
                    <p className='text-xl font-bold capitalize'>Restore Billing</p>
                </div>                    
                <Transition contentVisible={firstVisible}>
                    <ScrollPagination fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
                        {
                            ( items.map((item) => (
                                <BillingCards
                                key={item.id}
                                item={item}
                                restoreItems={restoreItems}
                                restore={true}
                                />
                            )))
                        }
                    </ScrollPagination>
                    {
                        items.length == 0 && !loading && <DataEmpty />
                    }
                </Transition>
                { loading && <Loader  />}
            </Block>
        </Layout>
    )
}

export default RestoreBilling