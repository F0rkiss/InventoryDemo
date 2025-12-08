import React, { useEffect, useRef, useState } from 'react'
import { Block} from 'framework7-react'
import api from '../../api/api'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../component/SearchBar'
import Loader from '../component/Loader'
import Transition from '../component/Transition'
import ScrollPagination from '../component/ScrollPagination'
import Layout from '../component/Layout'
// import FlyingButton from '../component/FlyingButton' // Admin biasanya gak create dari sini, tapi kalau butuh tinggal uncomment
import MemoCards from '../component/cards/MemoCard'
import DataEmpty from '../component/DataEmpty'
import { encrypting } from '../../helper/EncryptHelper'
import { useAuth } from '../../auth/AuthContext'
import useMenuAccess from '../../hooks/useMenuAccess'
import FilterDynamicToggle from '../component/filters/FilterDynamicToggle';
import MemoDetailView from '../component/DetailMemoView'; // Pastikan path benar

function MemoListAdmin() {
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
    // Akses menu untuk Admin, sesuaikan 'Memo' dengan nama menu di database permission lu
    const { canUpdate } = useMenuAccess('Memo'); 
    
    const [filterStatus, setFilterStatus] = useState('all');
    const onFilterChange = (next) => setFilterStatus(next);

    useEffect(() => {
      setItems([]);
      setNextCursor(null);
      setContentVisible(false);
      setSelectedId(null); 
      setDetailData(null);
      fetchItems();
    }, [searchTerm, filterStatus] )

    const buildReq = (cursor) => {
      const isSearching = !!searchTerm; 
      let url = 'memo'; // Endpoint Admin (biasanya get all)

      const params = {};
      if (cursor) params.cursor = cursor;

      if (isSearching) {
        url = `memo/${encodeURIComponent(searchTerm)}`;
      } else {
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

    // --- LOGIC HANDLE KLIK CARD ---
    const handleCardClick = async (id) => {
        if (selectedId === id) {
            setSelectedId(null);
            setDetailData(null);
            return;
        }

        setSelectedId(id);
        setDetailData(null); 
        setLoadingDetail(true);

        try {
            const res = await api.get(`memo-detail/${id}`); // Endpoint detail admin
            setDetailData(res.data.data);
        } catch (error) {
            console.error("Gagal ambil detail:", error);
        } finally {
            setLoadingDetail(false);
        }
    };

    // --- LOGIC BACK BUTTON (MOBILE) ---
    const handleBackToList = () => {
        setSelectedId(null);
        setDetailData(null);
    }

    // Fungsi update (jika admin boleh update, uncomment logic button di bawah)
    const goToUpdate = async(itemid) => {
      const encryptingID = await encrypting(itemid)
      navigate(`/memo/update-memo/${encryptingID}`); // Pastikan route update ini benar
    }
    
    return (
      <Layout title={'List Memo Admin'}>
          <Block>
            {/* Header: Judul & SearchBar */}
            {/* Logic: Hidden di Mobile jika sedang buka Detail (biar bersih) */}
            <div className={`flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2 ${selectedId ? 'hidden lg:flex' : 'flex'}`}>
              <p className='md:text-3xl text-2xl ms-3 font-semibold'>Daftar Memo (All)</p>
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
                <div className="flex flex-col lg:flex-row gap-6 items-start relative min-h-[500px]">
                    
                    {/* --- LIST SECTION --- */}
                    {/* Mobile: Hidden kalau ada selectedId. Desktop: Lebar 5/12 kalau ada selectedId. */}
                    <div className={`
                        transition-all duration-300 ease-in-out
                        ${selectedId ? 'hidden lg:block lg:w-5/12' : 'w-full'}
                    `}>
                        <div className='space-y-3'>
                            <ScrollPagination rootSelector=".page-content" fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
                                {items.map((item) => (
                                    <MemoCards
                                        key={item.id}
                                        item={item}
                                        isSelected={selectedId === item.id}
                                        onClick={() => handleCardClick(item.id)}
                                        initial={'admin'} // Menampilkan icon user di card
                                    />
                                ))}
                            </ScrollPagination>
                        </div>
                        {items.length === 0 && !loading && contentVisible && <DataEmpty/>}
                        {loading && <Loader Class="mt-10" />}
                    </div>

                    {/* --- DETAIL SECTION --- */}
                    {/* Mobile: Full Width. Desktop: 7/12. Sticky biar enak scrollnya. */}
                    {selectedId && (
                        <div className="w-full lg:w-7/12 sticky top-4 h-[calc(100vh-150px)] overflow-y-auto animate-fade-in">
                            <MemoDetailView 
                                data={detailData} 
                                loading={loadingDetail}
                                onClose={handleBackToList} // Mengaktifkan tombol back di mobile
                                initial={'admin'} // Menampilkan info user pembuat di footer detail
                                goToUpdate={goToUpdate} // Pass fungsi update
                                canUpdate={canUpdate} // Cek permission admin
                            />
                        </div>
                    )}

                </div>
            </Transition>
          </Block>
      </Layout>
    )
  }

  export default MemoListAdmin;