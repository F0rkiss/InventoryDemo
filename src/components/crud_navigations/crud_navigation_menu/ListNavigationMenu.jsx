import React, { useEffect, useState, useRef } from 'react';
import api from '../../../api/api';
import SearchBar from '../../component/SearchBar';
import { Block } from 'framework7-react';
import ScrollPagination from '../../component/ScrollPagination';
import Loader from '../../component/Loader';
import Transition from '../../component/Transition';
import { useNavigate } from 'react-router-dom';
import FlyingButton from '../../component/FlyingButton';
import Layout from '../../component/Layout';
import NavigationCards from '../../component/cards/NavigationsCards';
import RestoreButton from '../../component/RestoreButton';
import DataEmpty from '../../component/DataEmpty';

function ListNavigationMenu() {
    const [items, setItems] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [nextCursor, setNextCursor] = useState(null)
    const [loading, setLoading] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)
    const navigate = useNavigate();
    const typingTimeoutRef = useRef(null)

    useEffect(() => {
        fetchItems()
    }, [searchTerm])

    

    const fetchItems = async () => {
        try {
            setLoading(true)
            const response = await api.get(searchTerm ? `inventNavigationMenu/${searchTerm}` : `inventNavigationMenu`)
            const data = response.data.data
            setItems(data.data.filter(item => item.deleted_at === null));               setNextCursor(data.next_cursor)
        } catch (error) {

        } finally {
            setLoading(false)
            setTimeout(() => setContentVisible(true), 50)
        }
    }

    const fetchMoreItems = async () => {
        if (!nextCursor || loading) return;
        try {
            setLoading(true)
            const response = await api.get(
                searchTerm ? `inventNavigationMenu/${searchTerm}` : `inventNavigationMenu`
                , {
                params: {
                    cursor: nextCursor
                }
            })
            const data = response.data.data
            setItems((prevItems) => {
                const existingIds = new Set(prevItems.map(item => item.id));
                const newItems = data.data
                .filter(item => item.deleted_at === null)
                .filter(item => !existingIds.has(item.id));
                return [...prevItems, ...newItems];
            });
            setNextCursor(data.next_cursor);
        } catch (error) {

        } finally {
            setLoading(false)
            setTimeout(() => setContentVisible(true), 50)
        }
    }

    const handleSearchChange = (query) => {
        setSearchQuery(query);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            setSearchTerm(query);
        }, 750);
    };
    
    return (
        <Layout title={'List Navigations Menu'}>
            <SearchBar
                onChange={handleSearchChange}
                disable={loading}
                values={searchQuery}
            />
            <Block>
                <div className='ms-3 mb-6 flex justify-between'>
                    <p className='text-xl font-bold capitalize'>Navigation Menu</p>
                </div>                
                <Transition contentVisible={contentVisible}>
                    <ScrollPagination fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
                        {
                            ( items?.map((item) => (
                                <NavigationCards
                                key={item.id}
                                item={item}
                                // goToDetail={goToDetail}
                                // goToUpdate={goToUpdate}
                                // deleteItems={deleteItems}
                                source={'menu'}
                                />
                            )))
                        }
                    </ScrollPagination>
                    {
                        items.length <= 0 && !loading && <DataEmpty/>
                    }
                </Transition>
                {loading && <Loader Class={'mt-44'} />}
            </Block>
        </Layout>
    )
}

export default ListNavigationMenu;