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
import FilterStatusToggle from '../component/filters/FilterStatusToggle';

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
        
        let endpoint = 'purchaseOrder';
        const params = {};

        // 2. API logic updated to handle three filter states
        if (searchTerm) {
          params.search = searchTerm;
        } else {
          if (filterStatus === 'completed') {
            endpoint = 'purchaseOrder-toggle';
            params.is_completed = 1;
          } else if (filterStatus === 'not_completed') {
            endpoint = 'purchaseOrder-toggle';
            params.is_completed = 0; // Filter for not completed
          }
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
      // Guard clause ini sekarang menjadi lebih penting
      if (!nextCursor || loading) return;
      
      try {
        setLoading(true);

        let endpoint = searchTerm ? `purchaseOrder/${searchTerm}` : 'purchaseOrder';
        const params = {
          cursor: nextCursor,
        };
        if (searchTerm) {
          params.search = searchTerm;
        } else {
          if (filterStatus === 'completed') {
            endpoint = 'purchaseOrder-toggle';
            params.is_completed = 1;
          } else if (filterStatus === 'not_completed') {
            endpoint = 'purchaseOrder-toggle';
            params.is_completed = 0;
          }
        }

        const response = await api.get(endpoint, { params });
        const data = response.data.data;
        
        // Cek apakah data baru (dari API) benar-benar ada
        const newItemsFromApi = Array.isArray(data.data) ? data.data : [];

        // 1. Cek jika API mengembalikan array kosong
        if (newItemsFromApi.length === 0) {
            setNextCursor(null); // Paksa berhenti, data sudah habis
            setLoading(false);
            return; // Hentikan fungsi
        }
        
        // 2. Cek jika data yang dikembalikan hanya duplikat
        let newItemsAdded = false;
        setItems((prevItems) => {
            const existingIds = new Set(prevItems.map(item => item.id));
            const newItems = newItemsFromApi.filter(item => !existingIds.has(item.id));
            
            if (newItems.length > 0) {
              newItemsAdded = true; // Tandai bahwa ada item baru
            }
            return [...prevItems, ...newItems];
          }
        );

        // 3. Tentukan cursor berikutnya
        if (newItemsAdded) {
            // Jika ada item baru, gunakan cursor dari API
            setNextCursor(data.next_cursor);
        } else {
            // Jika tidak ada item baru (karena duplikat), paksa berhenti
            setNextCursor(null); 
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Failed to fetch more items:", error);
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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
                <p className='md:text-3xl text-2xl ms-3 font-semibold capitalize'>Purchase Order List</p>
                <div className='flex items-center gap-2'>
                  <SearchBar
                    onChange={handleSearchChange}
                    disable={loading}
                    values={searchQuery}
                  />
                  <FilterStatusToggle
                    value={filterStatus}
                    onChange={onFilterChange}
                    // disabled={loading}
                    // showText   // uncomment if you want to show the current label text
                  />
                </div>
              </div>
            <Transition contentVisible={contentVisible}>
              <div className='space-y-4'>
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