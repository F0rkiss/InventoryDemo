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
import useMenuAccess from '../../hooks/useMenuAccess'
import MemoDetailView from '../component/DetailMemoView';
import Swal from 'sweetalert2';
import FilterApprovalToggle from '../component/filters/FilterApprovalToggle';
import FilterDynamicToggle from '../component/filters/FilterDynamicToggle';

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
    const { canCreate, canUpdate, canDelete } = useMenuAccess('MemoPersonal');
   
    const [filterApproval, setFilterApproval] = useState('all'); // 'all', 'completed', 'not_completed'
    const [filterDynamic, setFilterDynamic] = useState('all');
    
    // const onFilterChange = (next) => setFilterStatus(next);

    useEffect(() => {
      setItems([]);
      setNextCursor(null);
      setContentVisible(false);
      setSelectedId(null); 
      setDetailData(null);
      fetchItems();
    }, [searchTerm, filterApproval, filterDynamic] )

    const buildReq = (cursor) => {
      const isSearching = !!searchTerm; 
      
      let url = 'memo-personal'; 
      const params = {};

      if (cursor) params.cursor = cursor;

      if (isSearching) {
        url = `memo-personal/${encodeURIComponent(searchTerm)}`;
      } else {
        const hasApprovalFilter = filterApproval !== 'all';
        const hasDynamicFilter = filterDynamic !== 'all';
        
        if (hasApprovalFilter || hasDynamicFilter) {
            url = 'memo-toggle/personal'; // Gunakan endpoint toggle jika ada filter

            // Logic Approval
            if (filterApproval === 'completed') {
                params.is_full_approval = 1;
            } else if (filterApproval === 'not_completed') {
                params.is_full_approval = 0;
            }

            // Logic Dynamic (bisa digabung dengan approval)
            if (filterDynamic === 'dynamic') {
                params.is_dynamic = 1;
            } else if (filterDynamic === 'manual') {
                params.is_dynamic = 0;
            }
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
      } catch (e) { } finally { setLoading(false); }
    };

    const debounceRef = useRef(null);
    const handleSearchChange = (query) => {
      setSearchQuery(query);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setSearchTerm(query.trim());
      }, 1200);
    };

    // --- LOGIC KLIK CARD ---
    const handleCardClick = async (id) => {
        if (selectedId === id) {
            setSelectedId(null);
            setDetailData(null);
            return;
        }

        // Set state biar UI berubah
        setSelectedId(id);
        setDetailData(null); 
        setLoadingDetail(true);

        try {
            const res = await api.get(`memo-detail/personal/${id}`);
            setDetailData(res.data.data);
        } catch (error) {
            console.error("Gagal ambil detail:", error);
        } finally {
            setLoadingDetail(false);
        }
    };

    // --- LOGIC BACK TOMBOL (MOBILE) ---
    const handleBackToDesktop = () => {
        setSelectedId(null);
        setDetailData(null);
    }

    const handleDeleteClick = async (id) => {
      try {
        const result = await Swal.fire({
          title: `Apakah Anda mau menghapus memo ini?`,
          icon: 'question',
          showDenyButton: true,
          confirmButtonText: 'Yes',
          denyButtonText: 'No',
          customClass: {
            actions: 'my-actions',
            confirmButton: 'order-2',
            denyButton: 'order-3',
          },
        });

        if (result.isConfirmed) {
          const response = await api.delete(`/memo-delete/${id}`);
          setItems((prevItems) => prevItems.filter((item) => item.id !== id));
          setSelectedId((prevSelectedId) => {
            if (prevSelectedId === id) {
              setDetailData(null);
              return null;
            }
            return prevSelectedId;
          });
          await Swal.fire('Terhapus!', '', 'success');
          
        }
      } catch (error) {
        Swal.fire({
          icon:'error',
          title:'Tidak dapat menghapus memo',
          text:'Ada Kesalahan Dalam Sistem'
      })
      }
    };

    const goToUpdate = async(itemid) => {
      const encryptingID = await encrypting(itemid)
      navigate(`/memo/update-memo/${encryptingID}`);
    }
    
    return (
      <Layout title={'List Memo'}>
          <Block>
            <div className={`flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2 ${selectedId ? 'hidden lg:flex' : 'flex'}`}>
              <p className='md:text-3xl text-2xl ms-3 font-semibold'>Daftar Personal Memo</p>
              <div className="flex items-center gap-2">
                <SearchBar onChange={handleSearchChange} disable={loading} values={searchQuery} />
                <FilterApprovalToggle
                    value={filterApproval}
                    onChange={setFilterApproval}
                />
                <FilterDynamicToggle
                    value={filterDynamic}
                    onChange={setFilterDynamic}
                />
              </div>
            </div>
            
            <Transition contentVisible={contentVisible}>
                <div className="flex flex-col lg:flex-row gap-6 items-start relative min-h-[500px]">
                    
                    <div className={`
                        transition-all duration-300 ease-in-out
                        ${selectedId ? 'hidden lg:block lg:w-5/12 ' : 'w-full'}
                    `}>
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
                        <div className="w-full lg:w-7/12 sticky top-24 h-[calc(100vh-150px)] overflow-y-auto animate-fade-in">
                            <MemoDetailView 
                                data={detailData} 
                                loading={loadingDetail}
                                onClose={handleBackToDesktop}
                                goToUpdate={goToUpdate}
                                canUpdate={canUpdate}
                                handleDelete={handleDeleteClick}
                                canDelete={canDelete}
                                initial="user"
                            />
                        </div>
                    )}
                </div>
            </Transition>
          </Block>
          { (canCreate && !selectedId) && <FlyingButton goTo={'/memo/create-memo'} />}
      </Layout>
    )
  }

  export default MemoList;