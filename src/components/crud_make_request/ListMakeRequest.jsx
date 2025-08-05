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
import DataEmpty from '../component/DataEmpty'
import { encrypting } from '../../helper/EncryptHelper'
import { useAuth } from '../../auth/AuthContext'
import useMenuAccess from '../../hooks/useMenuAccess'

  function MakeRequestList() {

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [nextCursor, setNextCursor] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [contentVisible, setContentVisible] = useState(false)
    const typingTimeoutRef = useRef(null)
    const navigate = useNavigate()
    const { role } = useAuth()
    const { canCreate, canUpdate } = useMenuAccess('MakeRequest');

    useEffect(() => {
      fetchItems();
    }, [searchTerm] )

    const fetchItems = async () => {
      try {
        setLoading(true);
        const url = role === 'admin'
          ? (searchTerm ? `inventMakeRequest-admin/${searchTerm}` : 'inventMakeRequest-admin')
          : (searchTerm ? `inventMakeRequest/${searchTerm}` : 'inventMakeRequest');

        const response = await api.get(url);
        const data = response.data.data;
        setItems(Array.isArray(data.data) ? data.data : []);
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
        const url = role === 'admin'
          ? (searchTerm ? `inventMakeRequest-admin/${searchTerm}` : 'inventMakeRequest-admin')
          : (searchTerm ? `inventMakeRequest/${searchTerm}` : 'inventMakeRequest');
        const response = await api.get(url, {
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
                  <p className='text-xl font-semibold capitalize'>Data Make Request</p>
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
                                goToUpdate={goToUpdate}
                                canUpdate={canUpdate}
                                />
                            )))
                          }
                      </ScrollPagination>
                    </div>
                  </Transition>
                  {
                    items.length === 0 && !loading && contentVisible && <DataEmpty/>
                  }
                  {loading && <Loader Class="mt-44" />}
          </Block>
          { canCreate && <FlyingButton goTo={'/make-request/create-make-request'} />}
      </Layout>
    )
  }

  export default MakeRequestList;