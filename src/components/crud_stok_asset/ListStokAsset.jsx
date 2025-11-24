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
import FlyingButton from '../component/FlyingButton';
import DataEmpty from '../component/DataEmpty';
import { encrypting } from '../../helper/EncryptHelper';
import useMenuAccess from '../../hooks/useMenuAccess';
import ImagePreviewModal from '../component/modal/ImagePreviewModal';
import Swal from 'sweetalert2';

function AssetStokList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // For input value
  const [searchTerm, setSearchTerm] = useState(''); // For actual search term used in fetching
  const [contentVisible, setContentVisible] = useState(false);
  const { canUpdate, canCreate, canDelete } = useMenuAccess('InventStokAsset');
  const navigate = useNavigate()

  // image preview state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

  // Helper untuk membangun parameter request secara konsisten
  const buildParams = (cursor) => {
    const params = {};
    if (cursor) {
      params.cursor = cursor;
    }

    let url;
    const isSearching = !!searchTerm;

    if (isSearching) {
      // SearchTerm disertakan di URL
      url = `/inventStok-admin/${searchTerm}`; 
    } else {
      // Endpoint standar jika tidak ada search
      url = `/inventStok-admin`; 
    }
    
    return { url, params };
  };

  // Memicu fetch ulang saat searchTerm berubah
  useEffect(() => {
    setContentVisible(false); // Sembunyikan konten saat memuat data baru
    fetchItems(); 
  }, [searchTerm]); 

  const fetchItems = async () => {
    setLoading(true);
    setItems([]); // Selalu reset item saat filter/search berubah
    setNextCursor(null); // Reset cursor
    try {
        const { url, params } = buildParams(null); // Dapatkan url dinamis dan params
        const response = await api.get(url, { params }); // Gunakan url dan params dari helper
        const data = response.data.data;
        setItems(data.data || []); // Pastikan items adalah array
        setNextCursor(data.next_cursor);
    } catch (error) {
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

  const handleDeleteClick = async (id) => {
    try {
      const result = await Swal.fire({
        title: `Apakah Anda mau menghapus stok aset ini?`,
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
        const response = await api.delete(`/inventStok-delete/${id}`);
        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
        await Swal.fire('Terhapus!', '', 'success');
      }
    } catch (error) {
      Swal.fire({
        icon:'error',
        title:'Tidak dapat menghapus stok aset',
        text:'Ada Kesalahan Dalam Sistem'
    })
    }
  };
  
  const handleDetailClick = async (id) => {
      const encryptedId = await encrypting(id)
      if (encryptedId) {
        navigate(`/stok-asset/detail-stok/${encryptedId}`)
      }
  };

  const handleUpdateClick = async (id) => {
    const encryptingID = await encrypting(id)
    if (encryptingID){
      navigate(`/stok-asset/update-stok/${encryptingID}`);
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
                <p className='ms-3 md:text-3xl text-2xl font-semibold capitalize w-full md:w-auto'>Daftar Stok Barang Aset</p>
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
                                handleUpdateClick={handleUpdateClick}
                                handleDeleteClick={handleDeleteClick}
                                handleImageClick={handleImageClick}
                                key={item.id}
                                initial={'StokAsset'}
                                canUpdate={canUpdate}
                                canDelete={canDelete}
                            />
                            ))
                        }
                    </ScrollPagination>
                </div>
            </Transition>
        { loading && <Loader Class="mt-20" />}
        { !loading && contentVisible && items.length === 0 && <DataEmpty/>}
      </Block>
      {canCreate && <FlyingButton goTo={'/stok-asset/create-stok'} />}
      <ImagePreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        imageUrl={selectedImageUrl}
      />
    </Layout>
    </> 
  );
}

export default AssetStokList;