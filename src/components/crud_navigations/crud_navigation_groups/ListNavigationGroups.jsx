import React, { useEffect, useState, useRef } from 'react';
import api from '../../../api/api';
import SearchBar from '../../component/SearchBar';
import { Block } from 'framework7-react'; // Hapus import yang tidak terpakai jika perlu
import ScrollPagination from '../../component/ScrollPagination';
import Loader from '../../component/Loader';
import Transition from '../../component/Transition';
import { useNavigate } from 'react-router-dom';
import FlyingButton from '../../component/FlyingButton';
import Swal from 'sweetalert2';
import Layout from '../../component/Layout';
import { encrypting } from '../../../helper/EncryptHelper';
import NavigationCards from '../../component/cards/NavigationsCards';
import DataEmpty from '../../component/DataEmpty';
import useMenuAccess from '../../../hooks/useMenuAccess';

function ListNavigationGroup() {
    const [items, setItems] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [nextCursor, setNextCursor] = useState(null)
    const [loading, setLoading] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)
    
    // REF BARU: Untuk mencegah spam request (State update itu async, Ref itu sync)
    const loadingRef = useRef(false); 
    
    const navigate = useNavigate();
    const { canCreate, canUpdate, canDelete } = useMenuAccess('NavigationGroup')
    const typingTimeoutRef = useRef(null)

    useEffect(() => {
        fetchItems()
    }, [searchTerm])

    const fetchItems = async () => {
        if (loadingRef.current) return;

        try {
            loadingRef.current = true;
            setLoading(true);
            setNextCursor(null); 

            const url = searchTerm ? `inventNavigationGroup/${searchTerm}` : `inventNavigationGroup`;
            const response = await api.get(url);
            
            // Kita ambil Wrapper-nya dulu (Object yang membungkus 'data' dan 'next_cursor')
            const wrapper = response.data.data; 
            
            // Ambil array data dari dalam wrapper
            const dataArray = Array.isArray(wrapper.data) ? wrapper.data : [];
            
            setItems(dataArray);

            // Ambil next_cursor dari Wrapper, BUKAN dari dataArray
            if (wrapper && wrapper.next_cursor) {
                console.log("Next Cursor ditemukan:", wrapper.next_cursor); // Debugging
                setNextCursor(wrapper.next_cursor);
            } else {
                console.log("Next Cursor habis / tidak ada");
                setNextCursor(null);
            }

        } catch (error) {
            console.error("Error fetching initial items:", error);
            setItems([]);
        } finally {
            loadingRef.current = false;
            setLoading(false);
            setTimeout(() => setContentVisible(true), 50);
        }
    }

    const fetchMoreItems = async () => {
        // Guard: Jika tidak ada cursor atau sedang loading, berhenti.
        if (!nextCursor || loadingRef.current) return;

        try {
            loadingRef.current = true;
            // Jangan setLoading(true) global jika ingin UX lebih mulus (opsional),
            // tapi untuk konsistensi biarkan saja dulu.
            setLoading(true); 

            const url = searchTerm ? `inventNavigationGroup/${searchTerm}` : `inventNavigationGroup`;
            const response = await api.get(url, {
                params: { cursor: nextCursor }
            });

            const wrapper = response.data.data;
            const newDataRaw = wrapper.data || []; 

            if (newDataRaw.length === 0) {
                setNextCursor(null);
                return;
            }

            setItems((prevItems) => {
                // Filter duplikat berdasarkan ID
                const existingIds = new Set(prevItems.map(item => item.id));
                const newItems = newDataRaw
                    // .filter(item => item.deleted_at === null)
                    .filter(item => !existingIds.has(item.id));
                
                return [...prevItems, ...newItems];
            });

            // Update cursor untuk halaman berikutnya dari wrapper
            if (wrapper.next_cursor) {
                setNextCursor(wrapper.next_cursor);
            } else {
                setNextCursor(null);
            }

        } catch (error) {
            console.error("Error fetching more items:", error);
            setNextCursor(null);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }

    const handleSearchChange = (query) => {
        setSearchQuery(query);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            // Reset items saat mengetik agar UI bersih dulu
            setItems([]); 
            setNextCursor(null);
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
            });

            if (result.isConfirmed) {
                await api.delete(`inventNavigationGroup-delete/${id}`);
                setItems(items.filter((item) => item.id !== id));
                Swal.fire('Terhapus!', '', 'success');
            }
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Gagal Menghapus',
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

    console.log('Rendered with items:', items);
    
    return (
        <Layout title={'List Navigations'}>
            <Block>
                <div className='ms-3 mb-4 flex items-center justify-between'>
                    <p className='lg:text-3xl text-2xl font-semibold capitalize'>Navigation Group List</p>
                    <SearchBar
                        onChange={handleSearchChange}
                        disable={loading}
                        values={searchQuery}
                    />
                </div>
                <Transition contentVisible={contentVisible}>
                    {/* Tambahkan kondisi: Jangan render ScrollPagination jika items kosong, 
                        gunakan div biasa agar tidak trigger scroll event di halaman kosong */}
                    
                    {items.length > 0 ? (
                        <ScrollPagination rootSelector=".page-content" fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                                {items.map((item) => (
                                    <NavigationCards
                                        key={item.id}
                                        item={item}
                                        goToDetail={goToDetail}
                                        goToUpdate={goToUpdate}
                                        deleteItems={deleteItems}
                                        canDelete={canDelete}
                                        canUpdate={canUpdate}
                                    />
                                ))}
                            </div>
                        </ScrollPagination>
                    ) : (
                        !loading && <DataEmpty/>
                    )}
                </Transition>
                {loading && <Loader Class={'mt-44'} />}
            </Block>
            {canCreate && <FlyingButton goTo={'/navigation-groups/create-navigation-groups'} />}
        </Layout>
    )
}

export default ListNavigationGroup;