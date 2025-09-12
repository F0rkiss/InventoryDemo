import { Page, Block, Fab, Icon } from 'framework7-react';
import api from '../../api/api';
import React, { useEffect, useRef, useState } from 'react';
import FlyingButton from '../component/FlyingButton';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../component/SearchBar';
import Loader from '../component/Loader';
import ScrollPagination from '../component/ScrollPagination';
import Transition from '../component/Transition';
import Swal from 'sweetalert2';
import Layout from '../component/Layout';
import { encrypting } from '../../helper/EncryptHelper';
import DivisiCards from '../component/cards/DivisiCards';
import RestoreButton from '../component/RestoreButton';
import DataEmpty from '../component/DataEmpty';

function ListDivisi() {
  const [loading, setLoading] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [nextCursor, setNextCursor] = useState(null);
  const [items, setItems] = useState([]);
  const typingTimeoutRef = useRef(null)
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, [searchTerm]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get(searchTerm ? `/divisi/search/${searchTerm}` : `/divisi`);
      const data = response.data.data;
      setItems(data.data);
      setNextCursor(data.next_cursor);
    } catch (error) {

    } finally {
      setLoading(false);
      setTimeout(() => setContentVisible(true), 50);
    }
  };

  const fetchMoreItems = async () => {
    if (!nextCursor || loading) return;
    try {
      setLoading(true);
      const response = await api.get(searchTerm ? `divisi/search/${searchTerm}` : 'divisi', {
        params: {
          cursor: nextCursor
        }
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
      setTimeout(() => setContentVisible(true), 50);
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

  const goToUpdate = async(id) => {
    const encryptingID = await encrypting(id)
    navigate(`/divisi/update-divisi/${encryptingID}`);
  };

  const deleteItems = async (id, nama) => {
    try {
      const result = await Swal.fire({
        title: `Apakah Anda Mau Menghapus Divisi ${nama}`,
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
        await api.delete(`/divisi/${id}`);
        setItems(items.filter((item) => item.id !== id));
        Swal.fire('Terhapus!', '', 'success');
      }
    } catch (error) {
      Swal.fire({
        icon:'error',
        title:'Tidak Dapat Mengubah Status MR',
        text:'Ada Kesalahan Dalam Sistem'
    })
    }
  }
  
  return (
    <Layout title={'List Divisi'}>
      <SearchBar   
            values={searchQuery}
            onChange={handleSearchChange}
            disable={loading}
          />
      <Block className='font-inter'>
        <div className='ms-3 mb-6 flex justify-between'>
          <p className='text-xl font-bold capitalize'>Data Divisi</p>
          <RestoreButton goTo={'/divisi/restore-divisi'} />
        </div>
        <Transition contentVisible={contentVisible}>
              <ScrollPagination rootSelector=".page-content" fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
                  {
                      ( items.map((item) => (
                          <DivisiCards
                          key={item.id}
                          item={item}
                          deleteItems={deleteItems}
                          goToUpdate={goToUpdate}

                          />
                      )))
                  }
              </ScrollPagination>
             { items.length <= 0 && !loading && <DataEmpty/>}
        </Transition>
        {loading && <Loader Class="mt-44" />}
      </Block>
      <FlyingButton goTo={'/divisi/create-divisi'} />
    </Layout>
  );
}

export default ListDivisi;
