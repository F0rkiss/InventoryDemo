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
import TypeRequestCards from '../component/cards/TypeRequestCards'
import RestoreButton from '../component/RestoreButton'
import DataEmpty from '../component/DataEmpty'
import { encrypting } from '../../helper/EncryptHelper'
import Swal from 'sweetalert2'
import useMenuAccess from '../../hooks/useMenuAccess'

  function TypeRequestList() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [nextCursor, setNextCursor] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [contentVisible, setContentVisible] = useState(false)
    const navigate = useNavigate()
    const { canCreate, canUpdate, canDelete } = useMenuAccess('TypeRequest');

    useEffect(() => {
      fetchItems();
    }, [searchTerm] )

    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await api.get(searchTerm ? `inventTypeRequest/${searchTerm}` : 'inventTypeRequest');
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
        const response = await api.get(searchTerm ? `inventTypeRequest/${searchTerm}` : 'inventTypeRequest', {
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
  
    const debounceRef = useRef(null);
            
    const handleSearchChange = (query) => {
      setSearchQuery(query);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setSearchTerm(query.trim());
      }, 1200);
    };

    useEffect(() => {
    // cleanup on unmount
      return () => debounceRef.current && clearTimeout(debounceRef.current);
    }, []);

    
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
          await api.delete(`inventTypeRequest-delete/${id}`);
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
      navigate(`/type-request/update-type-request/${encryptingID}`);
    }
    
    const goToDetail = async (id) => {
      const encryptingID = await encrypting(id)
      navigate(`/type-request/detail-type-request/${encryptingID}`)
    }     

    return (
      <Layout title={'List Type Request'}>
          <Block>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2'>
                <p className='lg:text-3xl text-2xl font-semibold capitalize'>Daftar Type Request</p>
                <SearchBar
                    onChange={handleSearchChange}
                    disable={loading}
                    values={searchQuery}
                />
            </div>
            <Transition contentVisible={contentVisible}>
              <ScrollPagination rootSelector=".page-content" fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {
                      ( items.map((item) => (
                          <TypeRequestCards
                          key={item.id}
                          item={item}
                          goToDetail={goToDetail}
                          deleteItems={deleteItems}
                          goToUpdate={goToUpdate}
                          canUpdate={canUpdate}
                          canDelete={canDelete}
                          />
                      )))
                  }
                </div>
              </ScrollPagination>
              {
                items.length <= 0 && !loading && <DataEmpty/>
              }
            </Transition>
            { loading && <Loader Class="mt-44" />}
          </Block>
          {canCreate && <FlyingButton goTo={'/type-request/create-type-request'} />}
      </Layout>
    )
  }

  export default TypeRequestList;