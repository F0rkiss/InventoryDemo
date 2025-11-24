import React, { useEffect, useRef, useState } from 'react'
import api from '../../api/api'
import SearchBar from '../component/SearchBar'
import Layout from '../component/Layout'
import Transition from '../component/Transition'
import ScrollPagination from '../component/ScrollPagination'
import Loader from '../component/Loader'
import { Block } from 'framework7-react'
import FlyingButton from '../component/FlyingButton'
import { useNavigate } from 'react-router-dom'
import BillingCards from '../component/cards/BillingCards'
import RestoreButton from '../component/RestoreButton'
import DataEmpty from '../component/DataEmpty'
import { encrypting } from '../../helper/EncryptHelper'
import Swal from 'sweetalert2'
import useMenuAccess from '../../hooks/useMenuAccess'

function ListBilling() {
    const [items, setItems] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [nextCursor, setNextCursor] = useState(null)
    const [loading, setLoading] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)
    const typingTimeoutRef = useRef(null)
    const { canCreate, canDelete, canUpdate } = useMenuAccess('Billing')
    const navigate = useNavigate()

    useEffect(() => {
        fetchItems()
    }, [searchTerm])

    const fetchItems = async () => {
        try {
            setLoading(true)
            const response = await api.get(searchTerm ? `billing-search/${searchTerm}` : `billing`)
            const data = response.data.data
            setItems(data.data)
            setNextCursor(data.next_cursor)
        } catch (error) {
                        
        } finally {
            setLoading(false)
            setTimeout(setContentVisible(true), 50)
        }
    }

    const fetchMoreItems = async () => {
        if (loading || !nextCursor) return
        try {
            setLoading(true)
            const response = await api.get(searchTerm ? `billing-search/${searchTerm}` : `billing`, {
                params : {
                    cursor : nextCursor
                }
            })
            const data = response.data.data
            setItems((prevItems) => {
                const existingIds = new Set (prevItems.map(item => item.id))
                const newItems = data.data.filter(item => !existingIds.has(item.id))
                return [...prevItems, ...newItems]
            })
            setNextCursor(data.next_cursor)
        } catch (error) {
            
        } finally {
            setLoading(false)
            setTimeout(() => setContentVisible(true), 50)
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
              await api.delete(`/billing-delete/${id}`);
              setItems(items.filter((item) => item.id !== id));
              Swal.fire('Terhapus!', '', 'success');
            }
          } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Menghapus Billing',
                text:'Ada Kesalahan Dalam Sistem'
            })
          }
    }

    const goToUpdate = async (id) => {
        const encryptingID = await encrypting(id)
        navigate(`/billing/update-billing/${encryptingID}`)
    }

    const goToDetail = async (id) => {
        const encryptingID = await encrypting(id)
        navigate(`/billing/detail-billing/${encryptingID}`)
    }


  return (
    <Layout title={'List Billing'}>
        <Block>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2'>
                <p className='lg:text-3xl text-2xl font-semibold capitalize'>Daftar Billing</p>
                <SearchBar
                    onChange={handleSearchChange}
                    disable={loading}
                    values={searchQuery}
                />
          </div>
            <Transition contentVisible={contentVisible}>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    <ScrollPagination rootSelector=".page-content" fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
                        {
                            ( items.map((item) => (
                                <BillingCards
                                key={item.id}
                                item={item}
                                goToUpdate={goToUpdate}
                                deleteItems={deleteItems}
                                goToDetail={goToDetail}
                                canDelete={canDelete}
                                canUpdate={canUpdate}
                                />
                            )))
                        }
                    </ScrollPagination>
                </div>
            </Transition>
            { items.length <= 0 && !loading && <DataEmpty/> }
            { loading && <Loader Class={'mt-40'}/> }
        </Block>
        { canCreate && <FlyingButton goTo={'/billing/create-billing'} />}
    </Layout>
  )
}

export default ListBilling