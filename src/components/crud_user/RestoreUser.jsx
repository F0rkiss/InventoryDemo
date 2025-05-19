import React, { useEffect, useRef, useState } from 'react'
import api from '../../api/api'
import Layout from '../component/Layout'
import { Block } from 'framework7-react'
import SearchBar from '../component/SearchBar'
import UserCards from '../component/cards/UserCards'
import Transition from '../component/Transition'
import Loader from '../component/Loader'
import ScrollPagination from '../component/ScrollPagination'
import DataEmpty from '../component/DataEmpty'
import Swal from 'sweetalert2'
import Back from '../component/Back'
import { useNavigate } from 'react-router-dom'

const RestoreUser = () => {
  
    const [items, setItems] = useState([])
    const [loading,setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [nextCursor, setNextCursor] = useState(null)
    const typingTimeoutRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchItems()
    }, [searchTerm])

    const fetchItems = async () => {
        try {
            setLoading(true)
            const response = await api.get(searchTerm ? `userTrash/${searchTerm}` : 'user/trash') 
            const data = response.data.data
            setItems(data.data)
            setNextCursor(data.next_cursor)
        } catch (error) {
        } finally {
            setLoading(false)
        }
    }

    const fetchMoreItems = async () => {
        if (loading || !nextCursor) return;
        try {
            setLoading(true)
            const response = await api.get(searchTerm ? `userTrash/${searchTerm}` : 'user/trash', {
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
    
    const restoreItems =  async (id, name) => {
        try {
            const result = await Swal.fire({
              title: `Apakah Anda Mau Restore User ${name}`,
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
              await api.get(`/user/restore/${id}`);
              setItems(items.filter((item) => item.id !== id));
              await Swal.fire('Berhasil!', '', 'success');
            }
          } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Merestore User',
                text:'Ada Kesalahan Dalam Sistem'
            })
          }
    }

    return (
     <Layout title={'Restore User'}>
        <SearchBar disable={loading} values={searchQuery} onChange={handleSearchChange}/>
        <Block>
            <Back goHome={() => navigate('/user/list-user')} />
            <div className='ms-3 mb-6 mt-3 flex justify-between'>
                    <p className='text-xl font-bold capitalize'>Restore User</p>
            </div>
        </Block>
        <Transition contentVisible={!loading}>
            <Block>
              <ScrollPagination fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
                  {
                      ( items.map((item) => (
                          <UserCards
                          key={item.id}
                          item={item}
                          restoreItems={restoreItems}
                          restore={true}
                          />
                      )))
                  } 
              </ScrollPagination>
              {
                items.length <= 0 && !loading && <DataEmpty/>
              }
            </Block>
        </Transition>
        {
            loading && <Loader Class={'mt-44'} />
        }
     </Layout>
    )
}

export default RestoreUser