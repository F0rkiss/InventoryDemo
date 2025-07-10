import React, { useEffect, useRef, useState } from 'react'
import { Block} from 'framework7-react'
import api from '../../api/api'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../component/SearchBar'
import Loader from '../component/Loader'
import Transition from '../component/Transition'
import ScrollPagination from '../component/ScrollPagination'
import Layout from '../component/Layout'
import FlyingButton from '../component/FlyingButton'
import MakeRequestCards from '../component/cards/MakeRequestCards'
import RestoreButton from '../component/RestoreButton'
import DataEmpty from '../component/DataEmpty'
import { encrypting } from '../../helper/EncryptHelper'
import Swal from 'sweetalert2'

  function MakeRequestList() {

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [nextCursor, setNextCursor] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [contentVisible, setContentVisible] = useState(false)
    const typingTimeoutRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
      fetchItems();
    }, [searchTerm] )

    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await api.get(searchTerm ? `inventMakeRequest/${searchTerm}` : 'inventMakeRequest');
        const data = response.data.data;
        setItems(data.data);
        setNextCursor(data.next_cursor);
        setLoading(false);
        setTimeout(() => setContentVisible(true), 50);
      } catch (error) {
        setLoading(false);
      }
    };

    const fetchMoreItems = async () => {
      if (!nextCursor || loading) return;
      try {
        setLoading(true);
        const response = await api.get(searchTerm ? `inventMakeRequest/${searchTerm}` : 'inventMakeRequest', {
          params: {
            cursor: nextCursor,
          },
        });
        const data = response.data.data;
  
          setItems(
            (prevItems) => {
            const existingIds = new Set(prevItems.map(item => item.id));
            const newItems = data.data.filter(item => !existingIds.has(item.id));
            return [...prevItems, ...newItems];
          }
        );
        setNextCursor(data.next_cursor);
        setLoading(false);
        setTimeout(() => setContentVisible(true), 50);
      } catch (error) {
        setLoading(false);
      }
    };
  

    const handleSearchChange = (query) => {
      setSearchQuery(query);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current); 
      }
      typingTimeoutRef.current = setTimeout(() => {
        setSearchTerm(query); 
      }, 750);
    };

    
    const deleteItems = async (id, name) => {
      try {
        const result = await Swal.fire({
          title: `Apakah Anda ingin menghapus tipe request ini?`,
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
          await api.delete(`inventMakeRequest-delete/${id}`);
          setItems(items.filter((item) => item.id !== id));
          Swal.fire('Terhapus!', '', 'success');
        }
      } catch (error) {
        Swal.fire({
          icon:'error',
          title:`Tidak Dapat Menghapus ${name}`,
          text:'Ada Kesalahan Dalam Sistem'
      })
      }
    };
  
    const goToUpdate = async(itemid) => {
      const encryptingID = await encrypting(itemid)
      navigate(`/make-request/update-make-request/${encryptingID}`);
    }
    
    const goToDetail = async (id) => {
      const encryptingID = await encrypting(id)
      navigate(`/make-request/detail-make-request/${encryptingID}`)
    } 

    return (
      <Layout title={'List Make Request'}>
          <SearchBar   
            values={searchQuery}
            onChange={handleSearchChange}
            disable={loading}
          />
          <Block>
              <div className='ms-3 mb-6 flex justify-between'>
                  <p className='text-xl font-bold capitalize'>Data Make Request</p>
                  {/* <RestoreButton goTo={'/category/restore-category'} /> */}
              </div>
                  <Transition contentVisible={contentVisible}>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                      <ScrollPagination fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
                          {
                            ( items.map((item) => (
                                <MakeRequestCards
                                key={item.id}
                                item={item}
                                goToDetail={goToDetail}
                                deleteItems={deleteItems}
                                goToUpdate={goToUpdate}
                                />
                            )))
                          }
                      </ScrollPagination>
                    </div>
                    {
                      items.length <= 0 && !loading && <DataEmpty/>
                    }
                  </Transition>
                  {loading && <Loader Class="mt-44" />}
          </Block>
          {/* <FlyingButton goTo={'/make-request/create-make-request'} /> */}
      </Layout>
    )
  }

  export default MakeRequestList;