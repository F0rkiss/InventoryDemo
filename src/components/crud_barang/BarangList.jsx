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
import RestoreButton from '../component/RestoreButton';
import DataEmpty from '../component/DataEmpty';
import ModalBarang from '../component/modal/ModalBarang';
import Swal from 'sweetalert2';
import { encrypting } from '../../helper/EncryptHelper';


function ItemList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // For input value
  const [searchTerm, setSearchTerm] = useState(''); // For actual search term used in fetching
  const [contentVisible, setContentVisible] = useState(false);
  const typingTimeoutRef = useRef(null); 
  const [openModal, setOpenModal] = useState(false)
  const [empty, setEmpty] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchItems(); 
  }, [searchTerm]);

  const fetchItems = async () => {
    setLoading(true);
    try {
        const response = await api.get(searchTerm ? `/inventBarang/${searchTerm}` : '/inventBarang');
        const data = response.data.data;
        if (data.data.length <= 0) {
          setEmpty(true)
        } else {
          setEmpty(false)
        }
        setItems(data.data);
        setNextCursor(data.next_cursor);
    } catch (error) {
      // console.log(error)
    } finally {
      setLoading(false);
      setTimeout(() => setContentVisible(true), 100);
    }
  };

  const fetchMoreItems = async () => {
    if (!nextCursor || loading) return;
    setLoading(true);
    try {
      const response = await api.get(searchTerm ? `/inventBarang/${searchTerm}` : '/inventBarang', {
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
  
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setSearchTerm(query);
    }, 750);
  };

  
  const handleDeleteClick = async (id) => {
    try {
      const result = await Swal.fire({
        title: `Apakah Anda Mau Menghapus Barang ini?`,
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
        const response = await api.delete(`/inventBarang-delete/${id}`);
        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
        await Swal.fire('Terhapus!', '', 'success');
      }
    } catch (error) {
      Swal.fire({
        icon:'error',
        title:'Tidak Dapat Menghapus Barang',
        text:'Ada Kesalahan Dalam Sistem'
    })
    }
  };

  const handleUpdateClick = async (id) => {
    const encryptingID = await encrypting(id)
    if (encryptingID){
      navigate(`/barang/update-barang/${encryptingID}`);
    }
  };

  const handleDetailClick = async (id) => {
      const encryptedId = await encrypting(id)
      if (encryptedId) {
        navigate(`/barang/detail-barang/${encryptedId}`)
      }
  };

  return (
    <>  
    <Layout title={'List Barang'}>
        <SearchBar
          values={searchQuery}
          onChange={handleSearchChange}
          disable={loading}
        />
        <Block> 
            <div className='mb-3 flex justify-between'>
              <p className='ms-3  text-xl font-bold capitalize'>Data Barang</p>
            </div>
            <Transition contentVisible={contentVisible}>
              <ScrollPagination
                loading={loading}
                nextCursor={nextCursor}
                fetchMoreItems={fetchMoreItems}
              >
              { 
                items.map((item) => (
                  <BarangCards
                    item={item}
                    handleDetailClick={handleDetailClick}
                    handleDeleteClick={handleDeleteClick}
                    handleUpdateClick={handleUpdateClick}
                    key={item.id}
                  />
                ))
              }
              </ScrollPagination>
            </Transition>
        {loading && <Loader Class="mt-20" />}
        { items.length <= 0 && !loading &&  <DataEmpty/>}
        <FlyingButton goTo={'/barang/create-barang'}/>
      </Block>
      {
        openModal && 
        <ModalBarang
        onClose={() => setOpenModal(!openModal)}
        openState={openModal}
        />
      }
    </Layout>
      </> 
  );
}

export default ItemList;
