import React, { useEffect, useRef, useState } from 'react'
import api from '../../api/api';
import { Page, Block, Fab, Icon } from 'framework7-react';
import CustomNavbar from '../component/CustomNavbar';
import SearchBar from '../component/SearchBar';
import Transition from '../component/Transition';
import Loader from '../component/Loader';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import ScrollPagination from '../component/ScrollPagination';
import FlyingButton from '../component/FlyingButton';
import { encrypting } from '../../helper/EncryptHelper';
import DepartmentCards from '../component/cards/DepartmentCards';
import RestoreButton from '../component/RestoreButton';
import DataEmpty from '../component/DataEmpty';

function ListDepartment() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [nextCursor, setNextCursor] = useState(null)
    const [contentVisible, setContentVisible] = useState(false)
    const typingTimeoutRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchItems()
    }, [searchTerm])

    const fetchItems = async () => {
        try {
            setLoading(true)
            const response = await api.get(searchTerm ? `department/search/${searchTerm}` : '/department')
            const data = response.data.data
            setItems(data.data);
            setNextCursor(data.next_cursor);
        } catch (error) {

        } finally {
            setTimeout(() => setContentVisible(true), 50)
            setLoading(false)
        }
    }

    const fetchMoreItems = async () => {
        if (!nextCursor || loading) return;
        try {
            setLoading(true)
            const response = await api.get(searchTerm ? `department/search/${searchTerm}` : '/department', {
                params: {
                    cursor : nextCursor,
                }
            })
            const data = response.data.data;
            setItems((prevItems) => {
            const existingIds = new Set(prevItems.map(item => item.id));
            const newItems = data.data.filter(item => !existingIds.has(item.id));
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
    
    const goToUpdate = async(itemId) => {
        const encryptingID = await encrypting(itemId)
        if (encryptingID) {
            navigate(`/department/update-department/${encryptingID}`)
        }
    }

    const deleteItems = async (id, name) => {
        try {
          const result = await Swal.fire({
            title: `Apakah Anda Mau Menghapus Department ${name}`,
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
            await api.delete(`/department/${id}`);
            setItems(items.filter((item) => item.id !== id));
            Swal.fire('Terhapus!', '', 'success');
          }
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Menghapus Department',
                text:'Ada Kesalahan Dalam Sistem'
            })
        }
    }

    return (
        <Page className='bg-custom-gray font-inter'>
            <CustomNavbar title={'List Department'} />
            <SearchBar disable={loading} onChange={handleSearchChange}  values={searchQuery} />
            <Block>
                <div className='ms-3 mb-6 flex justify-between'>
                    <p className='text-xl font-bold capitalize'>Data Department</p>
                    <RestoreButton goTo={'/department/restore-department'} />
                </div>
                <Transition contentVisible={contentVisible}>
                    <ScrollPagination rootSelector=".page-content" fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
                        {
                            ( items.map((item) => (
                                <DepartmentCards
                                key={item.id}
                                item={item}
                                deleteItems={deleteItems}
                                goToUpdate={goToUpdate}
                                />
                            )))
                        }
                    </ScrollPagination>
                    {
                        items.length <= 0 && !loading && <DataEmpty/> 
                    }
                </Transition>
            </Block>
           <FlyingButton goTo={'/department/create-department'} />
            {
                loading && <Loader Class={'mt-20'}/>
            }
        </Page>
    )
}

export default ListDepartment