import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Page, Block, Fab, Icon } from 'framework7-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import BarangCards from '../component/cards/BarangCards';
import Loader from '../component/Loader';
import Transition from '../component/Transition';
import SearchBar from '../component/SearchBar';
import Layout from '../component/Layout';
import ScrollPagination from '../component/ScrollPagination';
import DataEmpty from '../component/DataEmpty';
import useMenuAccess from '../../hooks/useMenuAccess';
import ImagePreviewModal from '../component/modal/ImagePreviewModal';
// import FilterAssetToggle from '../component/FilterAssetToggle'; // <-- DIHAPUS
import { encrypting } from '../../helper/EncryptHelper';

function StokList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // For input value
  const [searchTerm, setSearchTerm] = useState(''); // For actual search term used in fetching
  // const [filterAsset, setFilterAsset] = useState('all'); // <-- DIHAPUS
  const [contentVisible, setContentVisible] = useState(false);
  const { canCreate } = useMenuAccess('InventStok');
  const [empty, setEmpty] = useState(false)
  const navigate = useNavigate()

  // image preview state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

  // --- LOGIKA FETCH DIPERBARUI ---

  // Helper untuk membangun parameter request secara konsisten
  const buildParams = (cursor) => {
    const params = {};
    if (cursor) {
      params.cursor = cursor;
    }

    const url = `/inventStok`; // Selalu gunakan endpoint utama
    const isSearching = !!searchTerm;

    if (isSearching) {
      params.search = searchTerm;
    }
    
    return { url, params };
  };

  // Memicu fetch ulang saat searchTerm atau filterAsset berubah
  useEffect(() => {
    setContentVisible(false); // Sembunyikan konten saat memuat data baru
    fetchItems(); 
  }, [searchTerm]); // <-- filterAsset dihapus dari dependency

  const fetchItems = async () => {
    setLoading(true);
    setItems([]); // Selalu reset item saat filter/search berubah
    setNextCursor(null); // Reset cursor
    try {
        const { url, params } = buildParams(null); // Dapatkan url dinamis dan params
        const response = await api.get(url, { params }); // Gunakan url dan params dari helper
        const data = response.data.data;
        
        if (!data.data || data.data.length === 0) {
          setEmpty(true)
        } else {
          setEmpty(false)
        }
        setItems(data.data || []); // Pastikan items adalah array
        setNextCursor(data.next_cursor);
    } catch (error) {
      console.error("Error fetching items:", error);
      setEmpty(true); // Tampilkan empty state jika ada error
      setItems([]);
    } finally {
      setLoading(false);
      setTimeout(() => setContentVisible(true), 100);
    }
  };

  const fetchMoreItems = async () => {
    if (!nextCursor || loading) return;
    setLoading(true);
    try {
      const { url, params } = buildParams(nextCursor); // Dapatkan url dinamis dan params
      const response = await api.get(url, { params }); // Gunakan url dan params dari helper
      const data = response.data.data;
      
      setItems((prevItems) => {
        const existingIds = new Set(prevItems.map(item => item.id));
        const newItems = (data.data || []).filter(item => !existingIds.has(item.id));
        return [...prevItems, ...newItems];
      });
      setNextCursor(data.next_cursor);
    } catch (error) {
      console.error("Error fetching more items:", error);
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

  
  const handleDetailClick = async (id) => {
      const encryptedId = await encrypting(id)
      if (encryptedId) {
        navigate(`/stok/detail-stok/${encryptedId}`)
      }
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setSelectedImageUrl('');
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setIsPreviewOpen(true);
  };


  return (
    <>  
    <Layout title={'List Stok'}>
        <Block>
          <div className='mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
                <p className='ms-3 md:text-3xl text-2xl font-semibold capitalize w-full md:w-auto'>Daftar Stok Barang Non-Aset</p>
                <SearchBar
                    onChange={handleSearchChange}
                    disable={loading}
                    values={searchQuery}
                    containerClass="w-full md:w-auto" // Tambahkan class untuk searchbar
                />
          </div>  

            <Transition contentVisible={contentVisible}>
                <div className="space-y-4">
                    <ScrollPagination
                        loading={loading}
                        nextCursor={nextCursor}
                        fetchMoreItems={fetchMoreItems}
                        rootSelector=".page-content"
                    >
                        { 
                            items.map((item) => (
                            <BarangCards
                                item={item}
                                handleDetailClick={handleDetailClick}
                                handleImageClick={handleImageClick}
                                key={item.id}
                                initial={'Stok'}
                            />
                            ))
                        }
                    </ScrollPagination>
                </div>
            </Transition>
        { loading && <Loader Class="mt-20" />}
        { !loading && contentVisible && items.length === 0 && <DataEmpty/>}
      </Block>
      <ImagePreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        imageUrl={selectedImageUrl}
      />
    </Layout>
    </> 
  );
}

export default StokList;