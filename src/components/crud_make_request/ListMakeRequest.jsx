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
import ExportButton from '../component/ExportSheets';

function MakeRequestList() {
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

    // 1) One helper to build URL + params consistently
    const buildReq = (cursor) => {
      const isFiltered = filterStatus !== 'all';
      const isSearching = !!searchTerm; // Check if there's an active search term

      let url = 'inventMakeRequest';

      const params = {};
      if (cursor) params.cursor = cursor;

      if (isSearching) {
        params.search = searchTerm
      } else {
          if (filterStatus === 'completed') {
            url = 'inventMakeRequest-personal-toggle';
            params.is_full_approval = 1
          } else if (filterStatus === 'not_completed') {
            url = 'inventMakeRequest-personal-toggle';
            params.is_full_approval = 0
          }
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
      return () => debounceRef.current && clearTimeout(debounceRef.current);
    }, []);

    const goToUpdate = async(itemid) => {
      const encryptingID = await encrypting(itemid)
      navigate(`/material-request/update-material-request/${encryptingID}`);
    }
    
    const goToDetail = async (id) => {
      const encryptingID = await encrypting(id)
      navigate(`/material-request/detail-material-request/${encryptingID}`)
    } 

    return (
      <Layout title={'List Make Request'}>
          <Block>
            {/* Header Section */}
            <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2'>
              <p className='md:text-3xl text-2xl ms-3 font-semibold'>Daftar Material Request</p>
              <div className="flex items-center gap-2">
                <SearchBar
                onChange={handleSearchChange}
                disable={loading}
                values={searchQuery}
                />
                <FilterStatusToggle
                    value={filterStatus}
                    onChange={onFilterChange}
                />
                <ExportButton/>
              </div>
            </div>
            
            <Transition contentVisible={contentVisible}>
              {/* Changed from grid to vertical stack */}
              <div className='space-y-4'>
                <ScrollPagination rootSelector=".page-content" fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
                    {
                      ( items.map((item) => (
                          <MakeRequestCards
                          key={item.id}
                          item={item}
                          goToDetail={goToDetail}
                          goToUpdate={goToUpdate}
                          canUpdate={canUpdate}
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
          { canCreate && <FlyingButton goTo={'/material-request/create-material-request'} />}
      </Layout>
    )
  }

  export default MakeRequestList;