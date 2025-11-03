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
import PaymentMethodCards from '../component/cards/PaymentMethodCards'
import DataEmpty from '../component/DataEmpty'
import useMenuAccess from '../../hooks/useMenuAccess'

function PaymentMethodList() {
    const [items, setItems] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [nextCursor, setNextCursor] = useState(null)
    const [loading, setLoading] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)
    const navigate = useNavigate();
    const { canCreate, canUpdate, canDelete } = useMenuAccess('PaymentType')

    useEffect(() => {
        fetchItems()
    }, [searchTerm])

    const fetchItems = async () => {
        try {
            setLoading(true)
            const response = await api.get(`paymentType`)
            const data = response.data.data
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
            const response = await api.get(`paymentType`, {
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
            // console.error('Error fetching more items:', error)
        } finally {
            setLoading(false)
            setTimeout(() => setContentVisible(true), 50)
        }
    }

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

    const deleteItems = async (id, name) => {
        try {
            const result = await Swal.fire({
                title: `Apakah Anda Mau Menghapus Metode Pembayaran ${name}?`,
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
                await api.delete(`paymentType/${id}`);
                setItems(items.filter((item) => item.id !== id));
                Swal.fire('Terhapus!', '', 'success');
            }
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Menghapus Metode Pembayaran',
                text:'Ada Kesalahan Dalam Sistem'
            })
        }
    };    

    const goToUpdate = async(id) => {
        const encryptingID = await encrypting(id)
        navigate(`/update-payment-method/${encryptingID}`)
    }

    return (
        <Layout title={'List Payment Method'}>
            <Block>
                <div className='ms-3 mb-4 flex items-center justify-between'>
                    <p className='lg:text-3xl text-2xl font-semibold capitalize'>Daftar Metode Pembayaran</p>
                    <SearchBar
                        onChange={handleSearchChange}
                        disable={loading}
                        values={searchQuery}
                    />
                </div>              
                <Transition contentVisible={contentVisible}>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                        <ScrollPagination rootSelector=".page-content" fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
                            {
                                ( items?.map((item) => (
                                    <PaymentMethodCards
                                    key={item.id}
                                    item={item}
                                    goToUpdate={goToUpdate}
                                    deleteItems={deleteItems}
                                    canUpdate={canUpdate}
                                    canDelete={canDelete}
                                    />
                                )))
                            }
                        </ScrollPagination>
                    </div>
                    {
                        items.length <= 0 && !loading && <DataEmpty/>
                    }
                </Transition>
                {loading && <Loader Class={'mt-44'} />}
            </Block>
            { canCreate && <FlyingButton goTo={'/create-payment-method'} />}
        </Layout>
    )
}

export default PaymentMethodList;