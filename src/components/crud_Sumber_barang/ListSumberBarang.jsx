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
import SumberBarangCards from '../component/cards/SumberBarangCards'
import DataEmpty from '../component/DataEmpty'
import { encrypting } from '../../helper/EncryptHelper'
import Swal from 'sweetalert2'
import useMenuAccess from '../../hooks/useMenuAccess'

  function SumberBarangList() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [nextCursor, setNextCursor] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [contentVisible, setContentVisible] = useState(false)
    const typingTimeoutRef = useRef(null)
    const { canCreate, canDelete, canUpdate } = useMenuAccess('SumberBarang')
    const navigate = useNavigate()

    useEffect(() => {
      fetchItems();
    }, [searchTerm])

    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await api.get(searchTerm ? `inventSumberBarang/${searchTerm}` : 'inventSumberBarang');
        const data = response.data.data;
        // console.log(data)
        setItems(data.data);
        setNextCursor(response.data.next_cursor);
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
        const response = await api.get(searchTerm ? `inventSumberBarang/${searchTerm}` : 'inventSumberBarang', {
          params: {
            cursor: nextCursor,
          },
        });
        const data = response.data.data;
        console.log(data)
  
          setItems(
            (prevItems) => {
            const existingIds = new Set(prevItems.map(item => item.id));
            const newItems = Array.isArray(data) ? data.filter(item => !existingIds.has(item.id)) : [];
            return [...prevItems, ...newItems];
          }
        );
        setNextCursor(response.data.next_cursor);
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
          title: `Apakah Anda ingin menghapus kategori ini?`,
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
          await api.delete(`inventSumberBarang-delete/${id}`);
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
      navigate(`/sumber-barang/update-sumber-barang/${encryptingID}`);
    }
    
    const goToDetail = async (id) => {
      const encryptingID = await encrypting(id)
      navigate(`/sumber-barang/detail-sumber-barang/${encryptingID}`)
    } 

    return (
      <Layout title={'List Sumber Barang'}>
          <Block>
            <div className='ms-3 mb-4 flex items-center justify-between'>
                <p className='lg:text-3xl text-2xl font-semibold capitalize'>Sumber Barang List</p>
                <SearchBar
                    onChange={handleSearchChange}
                    disable={loading}
                    values={searchQuery}
                />
            </div>
            <Transition contentVisible={contentVisible}>
                    <ScrollPagination fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {
                            (items || []).map((item) => (
                                <SumberBarangCards
                                key={item.id}
                                item={item}
                                goToDetail={goToDetail}
                                deleteItems={deleteItems}
                                goToUpdate={goToUpdate}
                                canDelete={canDelete}
                                canUpdate={canUpdate}
                              />
                            ))
                        }
                        </div>
                    </ScrollPagination>
                    {
                      items.length <= 0 && !loading && <DataEmpty/>
                    }
            </Transition>
            { loading && <Loader Class="mt-10" /> }
          </Block>
          { canCreate && <FlyingButton goTo={'/sumber-barang/create-sumber-barang'} />}
      </Layout>
    )
  }

  export default SumberBarangList;