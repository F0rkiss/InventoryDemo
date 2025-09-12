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
import DataEmpty from '../component/DataEmpty'
import PurchaseOrderPRCards from '../component/cards/PurchaseOrderPRCards'
import { encrypting } from '../../helper/EncryptHelper'
import { useAuth } from '../../auth/AuthContext'
import useMenuAccess from '../../hooks/useMenuAccess'

  function PurchaseOrderPRList() {

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [nextCursor, setNextCursor] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [contentVisible, setContentVisible] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
      setItems([]);
      setNextCursor(null);
      setContentVisible(false);
      fetchItems();
    }, [searchTerm] )

    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await api.get(searchTerm ? `purchaseOrder-listPurchaseRequest/${searchTerm}` : 'purchaseOrder-listPurchaseRequest');
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
        const response = await api.get(searchTerm ? `purchaseOrder-listPurchaseRequest/${searchTerm}` : 'purchaseOrder-listPurchaseRequest', {
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
    
    const goToDetail = async (id) => {
      const encryptingID = await encrypting(id)
      navigate(`/purchase-order-pr/detail-purchase-order-pr/${encryptingID}`)
    }

    const goToCreate = async (id) => {
      const encryptingID = await encrypting(id)
      navigate(`/purchase-order-pr/create-purchase-order-pr/${encryptingID}`)
    } 

    return (
      <Layout title={'List Purchase Order'}>
          <Block>
            <div className='ms-3 mb-4 flex items-center justify-between gap-1'>
              <p className='lg:text-3xl text-2xl font-semibold capitalize'>Create Purchase Order List</p>
              <SearchBar
                onChange={handleSearchChange}
                disable={loading}
                values={searchQuery}
              />
            </div>
            <Transition contentVisible={contentVisible}>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                <ScrollPagination rootSelector=".page-content" fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
                    {
                      ( items.map((item) => (
                          <PurchaseOrderPRCards
                          key={item.id}
                          item={item}
                          goToDetail={goToDetail}
                          goToCreate={goToCreate}
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
      </Layout>
    )
  }

  export default PurchaseOrderPRList;