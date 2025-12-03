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
import MemoCards from '../component/cards/MemoCard'
import DataEmpty from '../component/DataEmpty'
import { encrypting } from '../../helper/EncryptHelper'
import { useAuth } from '../../auth/AuthContext'
import useMenuAccess from '../../hooks/useMenuAccess'
import FilterDynamicToggle from '../component/filters/FilterDynamicToggle';
import MemoDetailView from './DetailMemoView';

function MemoList() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [nextCursor, setNextCursor] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [contentVisible, setContentVisible] = useState(false)

    const [selectedId, setSelectedId] = useState(null); 
    const [detailData, setDetailData] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const navigate = useNavigate()
    const { canUpdate } = useMenuAccess('Memo');
    const [filterStatus, setFilterStatus] = useState('all');
    const onFilterChange = (next) => setFilterStatus(next);

    useEffect(() => {
      setItems([]);
      setNextCursor(null);
      setContentVisible(false);
      setSelectedId(null); // Reset pilihan saat filter berubah
      setDetailData(null);
      fetchItems();
    }, [searchTerm, filterStatus] )

    // 1) One helper to build URL + params consistently
    const buildReq = (cursor) => {
      // Cek apakah ada search term
      const isSearching = !!searchTerm; 

      // Default URL
      let url = 'memo';

      const params = {};
      if (cursor) params.cursor = cursor;

      if (isSearching) {
        // Kita pakai encodeURIComponent biar aman kalau ada spasi atau karakter aneh
        url = `memo/${encodeURIComponent(searchTerm)}`;
      } else {
        // Logic filter jalan kalau TIDAK sedang searching
        if (filterStatus === 'dynamic') {
            url = 'memo-toggle';
            params.is_dynamic = 1;
        } else if (filterStatus === 'manual') {
            url = 'memo-toggle';
            params.is_dynamic = 0;
        }
      }
      
      return { url, params };
    };

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
        // console.error('Error fetching more items:', e);
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

    const handleCardClick = async (id) => {
        if (selectedId === id) {
            // Kalau diklik lagi, tutup detailnya (toggle)
            setSelectedId(null);
            setDetailData(null);
            return;
        }

        setSelectedId(id);
        setDetailData(null); // Kosongkan dulu biar loading kelihatan
        setLoadingDetail(true);

        try {
            // Panggil API Detail sesuai request
            const res = await api.get(`memo-detail/${id}`);
            // Asumsi response datanya ada di res.data.data
            setDetailData(res.data.data);
        } catch (error) {
            console.error("Gagal ambil detail:", error);
        } finally {
            setLoadingDetail(false);
        }
    };

    // const goToUpdate = async(itemid) => {
    //   const encryptingID = await encrypting(itemid)
    //   navigate(`/material-request/update-material-request/${encryptingID}`);
    // }
    
    // const goToDetail = async (id) => {
    //   const encryptingID = await encrypting(id)
    //   navigate(`/material-request/detail-material-request/${encryptingID}`)
    // } 

    return (
      <Layout title={'List Memo'}>
          <Block>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2'>
              <p className='md:text-3xl text-2xl ms-3 font-semibold'>Daftar Memo</p>
              <div className="flex items-center gap-2">
                <SearchBar
                    onChange={handleSearchChange}
                    disable={loading}
                    values={searchQuery}
                />
                <FilterDynamicToggle
                    value={filterStatus}
                    onChange={onFilterChange}
                />
              </div>
            </div>
            
            <Transition contentVisible={contentVisible}>
                <div className="flex flex-col lg:flex-row gap-6 items-start relative">
                    
                    <div className={`transition-all duration-300 ease-in-out ${selectedId ? 'w-full lg:w-5/12' : 'w-full'}`}>
                        <div className='space-y-3'>
                            <ScrollPagination rootSelector=".page-content" fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
                                {items.map((item) => (
                                    <MemoCards
                                        key={item.id}
                                        item={item}
                                        isSelected={selectedId === item.id}
                                        onClick={() => handleCardClick(item.id)}
                                    />
                                ))}
                            </ScrollPagination>
                        </div>
                        {items.length === 0 && !loading && contentVisible && <DataEmpty/>}
                        {loading && <Loader Class="mt-10" />}
                    </div>

                    {selectedId && (
                        <div className="hidden lg:block w-7/12 sticky top-4 h-[calc(100vh-150px)] overflow-y-auto">
                            <MemoDetailView 
                                data={detailData} 
                                loading={loadingDetail}
                                onClose={() => setSelectedId(null)}
                                // goToUpdate={goToUpdate}
                                // canUpdate={canUpdate}
                            />
                        </div>
                    )}

                </div>
            </Transition>
          </Block>
      </Layout>
    )
  }

  export default MemoList;