import React, { useEffect, useRef, useState } from 'react'
import { Block} from 'framework7-react'
import api from '../../api/api'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../component/SearchBar'
import Loader from '../component/Loader'
import Transition from '../component/Transition'
import ScrollPagination from '../component/ScrollPagination'
import Layout from '../component/Layout'
import DataEmpty from '../component/DataEmpty'
import PurchaseOrderCards from '../component/cards/PurchaseOrderCards'
import { encrypting } from '../../helper/EncryptHelper'
import useMenuAccess from '../../hooks/useMenuAccess'
import FilterStatusToggle from '../component/FilterStatusToggle';

function PurchaseOrderList() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [nextCursor, setNextCursor] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [contentVisible, setContentVisible] = useState(false)
    const [filterStatus, setFilterStatus] = useState('all');
    const navigate = useNavigate()
    const { canUpdate } = useMenuAccess('PurchaseOrder');
    const onFilterChange = (next) => setFilterStatus(next);

    useEffect(() => {
      setItems([]);
      setNextCursor(null);
      setContentVisible(false);
      fetchItems();
    }, [searchTerm, filterStatus] ) // Dependency updated to filterStatus

    const fetchItems = async () => {
      try {
        setLoading(true);
        
        let endpoint = searchTerm ? `purchaseOrder/${searchTerm}` : 'purchaseOrder';
        const params = {};

        // 2. API logic updated to handle three filter states
        if (filterStatus === 'completed') {
          endpoint = 'purchaseOrder-toggle';
          params.is_completed = 1;
        } else if (filterStatus === 'not_completed') {
          endpoint = 'purchaseOrder-toggle';
          params.is_completed = 0; // Filter for not completed
        }

        const response = await api.get(endpoint, { params });
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

        let endpoint = searchTerm ? `purchaseOrder/${searchTerm}` : 'purchaseOrder';
        const params = {
          cursor: nextCursor,
        };
        
        // Apply the same logic for pagination
        if (filterStatus === 'completed') {
            endpoint = 'purchaseOrder-toggle';
            params.is_completed = 1;
        } else if (filterStatus === 'not_completed') {
            endpoint = 'purchaseOrder-toggle';
            params.is_completed = 0;
        }

        const response = await api.get(endpoint, { params });
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
    
    const goToUpdate = async(itemid) => {
      const encryptingID = await encrypting(itemid)
      navigate(`/purchase-order/update-purchase-order/${encryptingID}`);
    }
    
    const goToDetail = async (id) => {
      const encryptingID = await encrypting(id)
      navigate(`/purchase-order/detail-purchase-order/${encryptingID}`)
    } 

    return (
      <Layout title={'List Purchase Order'}>
          <Block>
            <div className='ms-3 mb-4 flex items-center justify-between'>
              <div className="flex justify-between items-center w-full">
                <p className='lg:text-3xl text-2xl font-semibold capitalize'>Purchase Order List</p>
                <div className='flex items-center'>
                  <FilterStatusToggle
                    value={filterStatus}
                    onChange={onFilterChange}
                    // disabled={loading}
                    // showText   // uncomment if you want to show the current label text
                  />
                  <SearchBar
                    onChange={handleSearchChange}
                    disable={loading}
                    values={searchQuery}
                  />
                </div>
              </div>
            </div>
            <Transition contentVisible={contentVisible}>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start'>
                <ScrollPagination rootSelector=".page-content" fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
                    {
                      ( items.map((item) => (
                          <PurchaseOrderCards
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
      </Layout>
    )
}

export default PurchaseOrderList;