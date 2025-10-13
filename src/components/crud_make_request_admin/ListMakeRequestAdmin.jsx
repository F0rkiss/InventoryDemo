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
import FilterStatusToggle from '../component/FilterStatusToggle';

  function MakeRequestAdminList() {

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [nextCursor, setNextCursor] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [contentVisible, setContentVisible] = useState(false)
    const navigate = useNavigate()
    const { role } = useAuth()
    const { canCreate, canUpdate } = useMenuAccess('MakeRequest');

    const [filterStatus, setFilterStatus] = useState('all');
    const onFilterChange = (next) => setFilterStatus(next);

    useEffect(() => {
      setItems([]);
      setNextCursor(null);
      setContentVisible(false);
      fetchItems();
    }, [searchTerm, filterStatus] )

    const buildReq = (cursor) => {
      const isFiltered = filterStatus !== 'all';
      const isSearching = !!searchTerm; // Check if there's an active search term

      let url;
      const baseAdminUrl = 'inventMakeRequest-admin';

      // Determine the URL based on whether a search is active
      if (isFiltered) {
        // For filtering without a search
        url = 'inventMakeRequest-admin-toggle';
      } else {
        // Default URL for listing all items
        url = baseAdminUrl;
      }

      // Build query parameters
      const params = {};
      if (cursor) params.cursor = cursor;

      if (isSearching) {
        params.search = searchTerm;
      }
      if (isFiltered) {
        params.is_full_approval = (filterStatus === 'completed' ? 1 : 0);
      }

      return { url, params };
    };

    // 2) First page
    const fetchItems = async () => {
      try {
        setLoading(true);
        const { url, params } = buildReq(null);
        const res = await api.get(url, { params });
        const page = res.data.data;

        const list = Array.isArray(page?.data) ? page.data : [];
        setItems(list);
        setNextCursor(page?.next_cursor ?? null);
      } finally {
        setLoading(false);
        setTimeout(() => setContentVisible(true), 50);
      }
    };

    // 3) Next pages
    const fetchMoreItems = async () => {
      if (!nextCursor || loading) return;
      try {
        setLoading(true);
        const { url, params } = buildReq(nextCursor);
        const res = await api.get(url, { params });
        const page = res.data.data;

        const newList = Array.isArray(page?.data) ? page.data : [];

        // stop if no results or stuck cursor
        if (!newList.length || page?.next_cursor === nextCursor) {
          setNextCursor(null);
          return;
        }

        setItems(prev => {
          const ids = new Set(prev.map(it => it.id));
          const uniq = newList.filter(it => !ids.has(it.id));
          return [...prev, ...uniq];
        });

        setNextCursor(page?.next_cursor ?? null);
      } catch (e) {
        console.error('Error fetching more items:', e);
      } finally {
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
      navigate(`/make-request-admin/detail-make-request-admin/${encryptingID}`)
    } 

    return (
      <Layout title={'List Make Request'}>
          <Block>
            <div className='ms-3 mb-4 flex items-center justify-between'>
              <div className="flex justify-between items-center w-full">
                <p className='md:text-3xl text-lg font-semibold capitalize me-1'>All Make Request List</p>
                <div className='flex items-center'>
                  <FilterStatusToggle
                    value={filterStatus}
                    onChange={onFilterChange}
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
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                <ScrollPagination rootSelector=".page-content" fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
                    {
                      ( items.map((item) => (
                          <MakeRequestCards
                          key={item.id}
                          item={item}
                          goToDetail={goToDetail}
                        //   goToUpdate={goToUpdate}
                        //   canUpdate={canUpdate}
                          filterStatus={filterStatus}
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
          {/* { canCreate && <FlyingButton goTo={'/make-request/create-make-request'} />} */}
      </Layout>
    )
  }

  export default MakeRequestAdminList;