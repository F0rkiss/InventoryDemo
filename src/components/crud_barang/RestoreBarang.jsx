import React, { useEffect, useRef, useState } from 'react'
import Layout from '../component/Layout'
import { Block } from 'framework7-react'
import SearchBar from '../component/SearchBar'
import api from '../../api/api'
import ScrollPagination from '../component/ScrollPagination'
import BarangCards from '../component/cards/BarangCards'
import DataEmpty from '../component/DataEmpty'
import Loader from '../component/Loader'
import Swal from 'sweetalert2'
import Back from '../component/Back'
import { useNavigate } from 'react-router-dom'

const RestoreBarang = () => {

    const [items, setItems] = useState([])
    const [loading,setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [nextCursor, setNextCursor] = useState(null)
    const [empty, setEmpty] = useState(false)
    const typingTimeoutRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchItems()
    }, [searchTerm])


    const fetchItems = async () => {
        try {
            setLoading(true)
            const response = await api.get(searchTerm ? `barangTrash/${searchTerm}` : `barang/trash`) 
            const data = response.data.data
            if (data.data.length <= 0) {
              setEmpty(true)
            } else {
              setEmpty(false)
            }
            setItems(data.data)
            setNextCursor(data.next_cursor)
        } catch (error) {
        } finally {
            setLoading(false)
        }
    }

    const fetchMoreItems = async() => {
        if (loading || !nextCursor) return;
        setLoading(true)
        try {
            const response = await api.get(searchTerm ? `barangTrash/${searchTerm}` : `barang/trash`, {
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
        setSearchQuery(query) 
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }
        typingTimeoutRef.current = setTimeout(() => {
          setSearchTerm(query)  
        }, 750)
    } 

    const restoreItems =  async (id) => {
      try {
          const result = await Swal.fire({
            title: `Apakah Anda Mau Restore Barang Ini`,
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
            await api.get(`/barang/restore/${id}`);
            setItems((prevItems) => prevItems.filter((item) => item.id !== id));
            await Swal.fire('Berhasil!', '', 'success');
          }
        } catch (error) {
          Swal.fire({
            icon:'error',
            title:'Tidak Dapat Merestore MR',
            text:'Ada Kesalahan Dalam Sistem'
          })
        }
    }

    return (
    <Layout title={'Restore Barang'}>
        <SearchBar onChange={handleSearchChange} values={searchQuery} disable={loading}/>
        <Block>
            <Back goHome={() => navigate('/barang/list-barang') }></Back>
            <div className='ms-3 mb-6 mt-3 flex justify-between'>
                <p className='text-xl font-bold capitalize'>Restore Barang</p>
            </div>
              <ScrollPagination
                loading={loading}
                nextCursor={nextCursor}
                fetchMoreItems={fetchMoreItems}
              >
                { 
                  items.map((item) => (
                    <BarangCards
                      restore={true}
                      item={item}
                      restoreItems={restoreItems}
                      key={item.id}
                    />
                  ))
                }
              </ScrollPagination>    
            {
               items.length == 0 && !loading && <DataEmpty/>
            }          
            {
              loading && <Loader Class={'mt-44'}/>
            }
        </Block>
    </Layout>
  )
}

export default RestoreBarang