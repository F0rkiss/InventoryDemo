import React, { useEffect, useState, useRef } from 'react'
import api from '../../api/api'
import SearchBar from '../component/SearchBar'
import { Page, Block, Fab, Icon } from 'framework7-react'
import ScrollPagination from '../component/ScrollPagination'
import Loader from '../component/Loader'
import Transition from '../component/Transition'
import { useNavigate } from 'react-router-dom'
import FlyingButton from '../component/FlyingButton'
import Swal from 'sweetalert2'
import Layout from '../component/Layout'
import { encrypting } from '../../helper/EncryptHelper'
import RoleCards from '../component/cards/RoleCards'
import DataEmpty from '../component/DataEmpty'
import useMenuAccess from '../../hooks/useMenuAccess'

function RoleList() {
    const [items, setItems] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [nextCursor, setNextCursor] = useState(null)
    const [loading, setLoading] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)
    const navigate = useNavigate();
    const { canCreate, canUpdate, canDelete } = useMenuAccess('Role')
    const typingTimeoutRef = useRef(null)

    useEffect(() => {
        fetchItems()
    }, [searchTerm])

    const fetchItems = async () => {
        try {
            setLoading(true)
            const response = await api.get(searchTerm ? `role/${searchTerm}` : `role`)
            const data = response.data.data
            // console.log('fetched items: ', data.data)
            setItems(data.data);  
            setNextCursor(data.next_cursor)
        } catch (error) {
            console.error('Error fetching items:', error)
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
                searchTerm ? `role/${searchTerm}` : `role`
                , {
                params: {
                    cursor: nextCursor
                }
            })
            const data = response.data.data
            console.log('fetched items: ', data.data)
            setItems((prevItems) => {
                const existingIds = new Set(prevItems.map(item => item.id));
                const newItems = data.data.filter(item => !existingIds.has(item.id));
                return [...prevItems, ...newItems];
            });
            setNextCursor(data.next_cursor);
        } catch (error) {
            console.error('Error fetching more items:', error)
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
                title: `Apakah Anda Mau Menghapus User ${name}`,
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
                await api.delete(`role-delete/${id}`);
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
        navigate(`/role/detail-role/${encryptingID}`)
    } 

    const goToUpdate = async(id) => {
        const encryptingID = await encrypting(id)
        navigate(`/role/update-role/${encryptingID}`)
    }

    return (
        <Layout title={''}>
            <Block>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2'>
                <p className='lg:text-3xl text-2xl font-semibold capitalize'>Daftar Role</p>
                <SearchBar
                    onChange={handleSearchChange}
                    disable={loading}
                    values={searchQuery}
                />
            </div>                
                <Transition contentVisible={contentVisible}>
                    <ScrollPagination rootSelector=".page-content" fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                            {
                                ( items?.map((item) => (
                                    <RoleCards
                                    key={item.id}
                                    item={item}
                                    goToDetail={goToDetail}
                                    goToUpdate={goToUpdate}
                                    deleteItems={deleteItems}
                                    canUpdate={canUpdate}
                                    canDelete={canDelete}
                                    />
                                    )))
                            }
                        </div>
                    </ScrollPagination>
                    {
                        items.length <= 0 && !loading && <DataEmpty/>
                    }
                </Transition>
                {loading && <Loader Class={'mt-44'} />}
            </Block>
            { canCreate && <FlyingButton goTo={'/role/create-role'} />}
        </Layout>
    )
}

export default RoleList;