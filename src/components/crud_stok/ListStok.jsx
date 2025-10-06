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
import ModalBarang from '../component/modal/ModalBarang';
import Swal from 'sweetalert2';
import { encrypting } from '../../helper/EncryptHelper';
// import useMenuAccess from '../../hooks/useMenuAccess';
import ImagePreviewModal from '../component/modal/ImagePreviewModal';

function StokList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // For input value
  const [searchTerm, setSearchTerm] = useState(''); // For actual search term used in fetching
  const [contentVisible, setContentVisible] = useState(false);
  const [openModal, setOpenModal] = useState(false)
  const [empty, setEmpty] = useState(false)
  const navigate = useNavigate()
//   const { canCreate, canUpdate, canDelete } = useMenuAccess('InventStok');

  // image preview state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

  useEffect(() => {
    fetchItems(); 
  }, [searchTerm]);

  const fetchItems = async () => {
    setLoading(true);
    try {
        const response = await api.get(searchTerm ? `/inventStok/${searchTerm}` : '/inventStok');
        const data = response.data.data;
        if (data.data.length <= 0) {
          setEmpty(true)
        } else {
          setEmpty(false)
        }
        setItems(data.data);
        setNextCursor(data.next_cursor);
    } catch (error) {
      
    } finally {
      setLoading(false);
      setTimeout(() => setContentVisible(true), 100);
    }
  };

  const fetchMoreItems = async () => {
    if (!nextCursor || loading) return;
    setLoading(true);
    try {
      const response = await api.get(searchTerm ? `/inventStok/${searchTerm}` : '/inventStok', {
        params: {
          cursor: nextCursor,
        },
      });
      const data = response.data.data;
      setItems((prevItems) => {
        const existingIds = new Set(prevItems.map(item => item.id));
        const newItems = data.data.filter(item => !existingIds.has(item.id));
        return [...prevItems, ...newItems];
      });
      setNextCursor(data.next_cursor);
    } catch (error) {

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

  
//   const handleDeleteClick = async (id) => {
//     try {
//       const result = await Swal.fire({
//         title: `Apakah Anda Mau Menghapus Barang ini?`,
//         icon: 'question',
//         showDenyButton: true,
//         confirmButtonText: 'Yes',
//         denyButtonText: 'No',
//         customClass: {
//           actions: 'my-actions',
//           confirmButton: 'order-2',
//           denyButton: 'order-3',
//         },
//       });

//       if (result.isConfirmed) {
//         const response = await api.delete(`/inventBarang-delete/${id}`);
//         setItems((prevItems) => prevItems.filter((item) => item.id !== id));
//         await Swal.fire('Terhapus!', '', 'success');
//       }
//     } catch (error) {
//       Swal.fire({
//         icon:'error',
//         title:'Tidak Dapat Menghapus Barang',
//         text:'Ada Kesalahan Dalam Sistem'
//     })
//     }
//   };

//   const handleUpdateClick = async (id) => {
//     const encryptingID = await encrypting(id)
//     if (encryptingID){
//       navigate(`/barang/update-barang/${encryptingID}`);
//     }
//   };

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
          <div className='ms-3 mb-4 flex items-center justify-between'>
                <p className='lg:text-3xl text-2xl font-semibold capitalize'>Stok Barang List</p>
                <SearchBar
                    onChange={handleSearchChange}
                    disable={loading}
                    values={searchQuery}
                />
          </div>  
            <Transition contentVisible={contentVisible}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
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
        { items.length <= 0 && !loading &&  <DataEmpty/>}
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
