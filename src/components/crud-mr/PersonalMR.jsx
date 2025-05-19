import { Block} from 'framework7-react'
import React, { useEffect, useRef, useState } from 'react'
import api from '../../api/api'
import ScrollPagination from '../component/ScrollPagination'
import SearchBar from '../component/SearchBar'
import Transition from '../component/Transition'
import Loader from '../component/Loader'
import Layout from '../component/Layout'
import FlyingButton from '../component/FlyingButton'
import useAuth from '../../hooks/useAuth'
import MRCards from '../component/cards/MRCards'
import DataEmpty from '../component/DataEmpty'
import Swal from 'sweetalert2'
import { encrypting } from '../../helper/EncryptHelper'
import { useNavigate } from 'react-router-dom'

function PersonalMR() {

    const [items, setItems] = useState([])
    const [nextCursor, setNextCursor] = useState(null)
    const [loading, setLoading] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)
    const navigate = useNavigate()
    const {role} = useAuth()

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async() => {
        try {
            setLoading(true)
            const response = await api.get('makeRequest/personal')
            const data = response.data.data

            setItems(data.data)
            setNextCursor(data.next_cursor)
        } catch (error) {

        } finally {
            setLoading(false)
            setTimeout(() => setContentVisible(true), 50)
        }
    }

    const fetchMoreItems = async () => {
        if (!nextCursor || loading ) return
        try {
            setLoading(true)
            const response = await api.get('makeRequest/personal', {
                params: {
                    cursor : nextCursor,
                }
            })
            const data = response.data.data
            setItems(
                (prevItems) => {
                const beforeIds = prevItems.map(item => item.id)
                const existingIds = new Set(prevItems.map(item => item.id))
                const newItems = data.data.filter(item => !existingIds.has(item.id))
                return [...prevItems, ...newItems]
              }
            )
            setNextCursor(data.next_cursor)
        } catch (error) {
        } finally {
            setLoading(false)
            setTimeout(() => setContentVisible(true), 50)
        }
    }
    const handleReject = async (item, id) => {

        const formdata = new FormData()
        formdata.append('status', 'reject')
        formdata.append('_method', 'PUT')
        const result = await Swal.fire({
            title: 'Apakah Anda Yakin',
            text: 'Untuk Menolak Request ini',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya',
            cancelButtonText: 'Tidak'
        })
        if (result.isConfirmed) {
            try {
                await updateData(item.id, 'reject')
                    setItems(prev => prev.map(item => item.id == id ? {...item, status : 'reject'} : item))
                    Swal.fire(
                        'Request Telah Direject',
                        'Berhasil',
                        'success'
                    )
                if (item.jenis_permintaan === 'perbaikan/upgrade' && item.status == 'in prosess') {
                    const enkripsi = await encrypting([item.barangs[0].id, item.id])
                    navigate(`/make-request/history/${enkripsi}`)
                }
            } catch (error) {
                Swal.fire({
                    icon:'error',
                    title:'Error Tidak Bisa',
                    confirmButtonColor:'#EF4444'
                })
            }
           
        }
    }

    const updateData = async (id, status) => {
        try {  
        const formdata = new FormData();
        formdata.append("status", status)
        formdata.append("_method", "PUT")
        const response = await api.post(`makeRequest/admin/updateStatus/${id}`, formdata , {
            headers : {
                'Content-Type' : "multipart/form-data"
            }
        })
        const data = response.data.data
        setItems(prevItems => prevItems.map(item => item.id == id ? {...item, status, tanggal_penerimaan : (status == 'in prosess' && data.tanggal_penerimaan.split('T')[0] ) } : item))
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Mengubah Status MR',
                text:'Ada Kesalahan Dalam Sistem'
            })
        }
    }

    const handleProsess = async (item) => {
        try {
            const result = await Swal.fire({
                icon:'question',
                title: 'Apakah Anda Mau Memprosess MR ini',
                text:'Anda Yakin ?',
                confirmButtonColor: '#4ADE80',
                cancelButtonColor: '#d33',
                showCancelButton: true,    
                confirmButtonText: 'Ya',
                cancelButtonText: 'Tidak'
            })
            if (result.isConfirmed) {
                await updateData(item.id, 'in prosess')
                Swal.fire(
                    'Request Telah Diprosess',
                    'Berhasil',
                    'success'
                )
                if (item.jenis_permintaan === 'perbaikan/upgrade') {
                    const enkripsi = await encrypting([item.barangs[0].id, item.id])
                    navigate(`/make-request/history/${enkripsi}`)
                }
            }
        } catch (error) {

        }
    }
    
    const doneMR = async (id) => {
        const encryptingID = await encrypting(id)
        if (encryptingID) {
            navigate(`/make-request/done-make-request/${encryptingID}`)
        }
    }

    const UpdateMR = async (id) => {
        const encryptingID = await encrypting(id)
        if (encryptingID) {
            navigate(`/make-request/update-make-request-personal/${encryptingID}`)
        }
    }

    const deleteItems = async(id) => {
        try {
            const result = await Swal.fire({
                title: "Apakah Anda Yakin Untuk Menghapus Make Request Ini",
                icon : 'info',
                showDenyButton : true,
                confirmButtonText: "Ya",
                denyButtonText: "Tidak",
                customClass: {
                    actions: 'my-actions',
                    confirmButton: 'order-2',
                    denyButton: 'order-3',
                }
            });
            if (result.isConfirmed) {
                await api.delete(role == 'admin' ? `makeRequest/admin/delete/${id}` : `makeRequest/delete/${id}`)
                setItems(items.filter(item => item.id !== id))
                Swal.fire('Terhapus', ' ' ,'success')
            }
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Menghapus MR',
                text:'Ada Kesalahan Dalam Sistem'
            })
        }
    }
      

  return (
    <Layout title={'Make Request Personal'}>
        
            <Transition contentVisible={contentVisible}>
                {
                    <Block>
                        <p className='text-xl font-bold capitalize ms-3 mb-3'>Make Request Personal</p>
                            <ScrollPagination fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
                                {
                                    ( items.map((item) => (
                                        <MRCards
                                            key={item.id}
                                            item={item}
                                            items={items}
                                            deleteItems={deleteItems}
                                            UpdateMR={UpdateMR}
                                            handleReject={handleReject}
                                            handleProsess={handleProsess}
                                            doneMR={doneMR}
                                        />
                                    )))
                                }
                            </ScrollPagination>
                            {
                                items.length <= 0 && !loading && <DataEmpty/>
                            }
                    </Block>
                }   
                <FlyingButton goTo={'/make-request/create-make-request'} />
            </Transition>
            {
                loading && <Loader Class={'mt-44'}/>
            }
    </Layout>
  )
}


export default PersonalMR