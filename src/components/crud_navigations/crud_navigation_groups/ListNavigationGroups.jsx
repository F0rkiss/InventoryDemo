import React, { useEffect, useState, useRef } from 'react';
import api from '../../../api/api';
import SearchBar from '../../component/SearchBar';
import { Page, Block, Fab, Icon } from 'framework7-react';
import ScrollPagination from '../../component/ScrollPagination';
import Loader from '../../component/Loader';
import Transition from '../../component/Transition';
import { useNavigate } from 'react-router-dom';
import FlyingButton from '../../component/FlyingButton';
import Swal from 'sweetalert2';
import Layout from '../../component/Layout';
import { encrypting } from '../../../helper/EncryptHelper';
import NavigationCards from '../../component/cards/NavigationsCards';
import RestoreButton from '../../component/RestoreButton';
import DataEmpty from '../../component/DataEmpty';

function ListNavigationGroup() {
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
            const response = await api.get(searchTerm ? `inventNavigationGroup/${searchTerm}` : `inventNavigationGroup`)
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
                searchTerm ? `inventNavigationGroup/${searchTerm}` : `inventNavigationGroup`
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

    const deleteItems = async (id, name) => {
        try {
            const result = await Swal.fire({
                title: `Apakah Anda ingin menghapus navigasi ini?`,
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
                await api.delete(`inventNavigationGroup-delete/${id}`);
                setItems(items.filter((item) => item.id !== id));
                Swal.fire('Terhapus!', '', 'success');
            }
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Menghapus User',
                text:'Ada Kesalahan Dalam Sistem'
            })
        }
    };    

    const goToDetail = async (id) => {
        const encryptingID = await encrypting(id)
        navigate(`/navigation-groups/detail-navigation-groups/${encryptingID}`)
    } 

    const goToUpdate = async(id) => {
        const encryptingID = await encrypting(id)
        navigate(`/navigation-groups/update-navigation-groups/${encryptingID}`)
    }
    
    return (
        <Layout title={'List Navigations'}>
            <SearchBar
                onChange={handleSearchChange}
                disable={loading}
                values={searchQuery}
            />
            <Block>
                <div className='ms-3 mb-6 flex justify-between'>
                    <p className='text-xl font-bold capitalize'>Navigation Group</p>
                </div>                
                <Transition contentVisible={contentVisible}>
                    <ScrollPagination fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
                        {
                            ( items?.map((item) => (
                                <NavigationCards
                                key={item.id}
                                item={item}
                                goToDetail={goToDetail}
                                goToUpdate={goToUpdate}
                                deleteItems={deleteItems}
                                source={'group'}
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
            <FlyingButton goTo={'/navigation-groups/create-navigation-groups'} />
        </Layout>
    )
}

export default ListNavigationGroup;