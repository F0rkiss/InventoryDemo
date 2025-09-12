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
import ApprovalStepCard from '../component/cards/ApprovalStepCard.jsx'
import DataEmpty from '../component/DataEmpty'
import { encrypting } from '../../helper/EncryptHelper'
import Swal from 'sweetalert2'
import useMenuAccess from '../../hooks/useMenuAccess'

  function ApprovalStepList() {

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [nextCursor, setNextCursor] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [contentVisible, setContentVisible] = useState(false)
    const typingTimeoutRef = useRef(null)
    const navigate = useNavigate()
    const { canUpdate, canDelete } = useMenuAccess('ApprovalStep')

    useEffect(() => {
      fetchItems();
    }, [searchTerm] )

    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await api.get(searchTerm ? `inventApprovalStep/${searchTerm}` : 'inventApprovalStep');
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
        const response = await api.get(searchTerm ? `inventApprovalStep/${searchTerm}` : 'inventApprovalStep', {
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

    const goToDetail = async (id) => {
      const encryptingID = await encrypting(id)
      navigate(`/approval-step/detail-approval-step/${encryptingID}`)
    }

    const goToUpdate = async (id) => {
      const encryptingID = await encrypting(id)
      navigate(`/approval-step/update-approval-step/${encryptingID}`)
    } 
  
    return (
      <Layout title={'List Approval Step'}>
          <Block>
              <div className='ms-3 mb-4 flex items-center justify-between'>
                <p className='lg:text-3xl text-2xl font-semibold capitalize'>Approval Step List</p>
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
                                <ApprovalStepCard
                                key={item.id}
                                item={item}
                                goToDetail={goToDetail}
                                goToUpdate={goToUpdate}
                                canDelete={canDelete}
                                canUpdate={canUpdate}
                                />
                            )))
                        }
                      </div>
                    </ScrollPagination>
                    {
                      items.length <= 0 && !loading && <DataEmpty/>
                    }
                  </Transition>
                  {loading && <Loader Class="mt-44" />}
          </Block>
      </Layout>
    )
  }

  export default ApprovalStepList;