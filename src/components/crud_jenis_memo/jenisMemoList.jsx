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
import JenisMemoCards from '../component/cards/JenisMemoCards'
import RestoreButton from '../component/RestoreButton'
import DataEmpty from '../component/DataEmpty'

function JenisMemoList() {
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
            const response = await api.get(searchTerm ? `jenisMemo/${searchTerm}` : `jenisMemo`)
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
                searchTerm ? `jenisMemo/${searchTerm}` : `jenisMemo`
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
                await api.delete(`jenisMemo-delete/${id}`);
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

    // const goToDetail = async (id) => {
    //     const encryptingID = await encrypting(id)
    //     navigate(`/jenismemo/detail-jenismemo/${encryptingID}`)
    // } 

    const goToUpdate = async(id) => {
        const encryptingID = await encrypting(id)
        navigate(`/jenismemo/update-jenismemo/${encryptingID}`)
    }

    return (
        <Layout title={'List Jenis Memo'}>
            <SearchBar
                onChange={handleSearchChange}
                disable={loading}
                values={searchQuery}
            />
            <Block>
                <div className='ms-3 mb-6 flex justify-between'>
                    <p className='text-xl font-semibold capitalize'>Data Jenis Memo</p>
                </div>                
                <Transition contentVisible={contentVisible}>
                    <ScrollPagination fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
                        {
                            ( items?.map((item) => (
                                <JenisMemoCards
                                key={item.id}
                                item={item}
                                goToUpdate={goToUpdate}
                                deleteItems={deleteItems}
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
            <FlyingButton goTo={'/jenismemo/create-jenismemo'} />
        </Layout>
    )
}

export default JenisMemoList;