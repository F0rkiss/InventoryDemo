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
import PurchaseOrderCards from '../component/cards/PurchaseOrderCards'
import { encrypting } from '../../helper/EncryptHelper'
import { useAuth } from '../../auth/AuthContext'
import useMenuAccess from '../../hooks/useMenuAccess'

  function PurchaseOrderList() {

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [nextCursor, setNextCursor] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [contentVisible, setContentVisible] = useState(false)
    const [sortByCompleted, setSortByCompleted] = useState(false); // 1. State for sorting
    const typingTimeoutRef = useRef(null)
    const navigate = useNavigate()
    const { role } = useAuth()
    const { canUpdate } = useMenuAccess('PurchaseOrder');

    useEffect(() => {
      // 2. Reset list when sort changes and re-fetch
      setItems([]);
      setNextCursor(null);
      setContentVisible(false);
      fetchItems();
    }, [searchTerm, sortByCompleted] ) // Added sortByCompleted as a dependency

    const fetchItems = async () => {
      try {
        setLoading(true);
        // 3. Add sort parameter to API call
        const params = {};
        if (sortByCompleted) {
          // IMPORTANT: Change 'completed' if your API uses a different value
          params.status = 'purchaseOrder-toggle?is_completed=1';
        }

        const response = await api.get(searchTerm ? `purchaseOrder/${searchTerm}` : 'purchaseOrder', { params });
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

        // 4. Ensure pagination also uses the sort parameter
        const params = {
          cursor: nextCursor,
        };
        if (sortByCompleted) {
            params.status = 'purchaseOrder-toggle?is_completed=1';
        }

        const response = await api.get(searchTerm ? `purchaseOrder/${searchTerm}` : 'purchaseOrder', { params });
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
  
    // 5. Handler to toggle the sort state
    const handleSortToggle = () => {
      setSortByCompleted(prev => !prev);
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
                  <button
                      onClick={handleSortToggle}
                      className={`px-3 py-3 w-fit h-full border text-2xl font-medium rounded-full flex justify-center items-center gap-2 transition-colors duration-200 ${
                          sortByCompleted 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                      >
                      <i className='bx bxs-sort-alt'></i>
                      {/* <span>{sortByCompleted ? 'Selesai' : 'All'}</span> */}
                  </button>
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
                <ScrollPagination fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
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