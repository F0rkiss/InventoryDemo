import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Page, Block, Fab, Icon } from 'framework7-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/api';
import Swal from 'sweetalert2';
import Loader from '../../component/Loader';
import Transition from '../../component/Transition';
import SearchBar from '../../component/SearchBar';
import ScrollPagination from '../../component/ScrollPagination';
import Layout from '../../component/Layout'
import BarangCards from '../../component/cards/BarangCards'
import DataEmpty from '../../component/DataEmpty';
import { encrypting } from '../../../helper/EncryptHelper';

const UserBarang = () => {

  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // For input value
  const [searchTerm, setSearchTerm] = useState(''); // For actual search term used in fetching
  const [contentVisible, setContentVisible] = useState(false);
  const typingTimeoutRef = useRef(null); 

  useEffect(() => {
    fetchItems();
  }, [searchTerm]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await api.get(searchTerm ? `/user/barang/${searchTerm}` : '/user/barang');
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
    setLoading(true);
    try {
      const response = await api.get(searchTerm ? `/user/barang/search/${searchTerm}` : '/user/barang', {
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

  const handleDetailClick = async (id) => {
    const encryptedId = await encrypting(id)
    if (encryptedId) {
      navigate(`/barang/detail-barang/${encryptedId}`)
    }
  };

  return (
    <Layout title={'Barang Anda'}>
      <SearchBar onChange={handleSearchChange} values={searchQuery} disable={loading}/>
      <Block>
        <Transition contentVisible={contentVisible}>
          <ScrollPagination fetchMoreItems={fetchMoreItems} nextCursor={nextCursor} loading={loading}>
              {items.map((item) => (
              <BarangCards
                item={item}
                isUser
                handleDetailClick={handleDetailClick}
                key={item.id}
              />
              ))}
          </ScrollPagination>
          {
            items.length <= 0 && !loading && <DataEmpty />
          }
        </Transition>
        {
          loading && <Loader Class={'mt-44'}/>
        }
      </Block>
    </Layout>
  )
}

export default UserBarang