import React, { useEffect, useState } from 'react'
import Layout from '../component/Layout'
import Back from '../component/Back'
import { useNavigate, useParams } from 'react-router-dom'
import MRCards from '../component/cards/MRCards'
import { Block } from 'framework7-react'
import { DecryptID, encrypting } from '../../helper/EncryptHelper'
import Transition from '../component/Transition'
import Loader from '../component/Loader'
import api from '../../api/api'
import Swal from 'sweetalert2'
import { useAuth } from '../../auth/AuthContext'

const DetailMR = () => {
    const navigate = useNavigate()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const { id } = useParams()
    const [decryptedId, setDecryptedId] = useState('')
    const {role} = useAuth()

    useEffect(() => {
        const decryptedIds = DecryptID(id)
        setDecryptedId(decryptedIds)
        if (!decryptedIds) {
            navigate(-1)
        }
    }, [id])

    useEffect(() => {
        if (decryptedId) {
            fetchItems()
        }
    }, [decryptedId])
    
    const fetchItems = async () => {
        try {
            setLoading(true)
            const response = await api.get(`makeRequest/detail/${decryptedId}`)
            const data = response.data.data
            if (data.length == 0) {
                navigate(-1)
            }
            setItems([data])
        } catch (error) {

        } finally {
            setLoading(false)    
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
                navigate(-1)
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
        <Layout title={'Detail Make Request'}>
            <Block>
                <Back className={`mb-3`} goHome={() => navigate(-1)}/>
                <Transition contentVisible={!loading}>
                {
                    items.map((item) => (
                        <MRCards
                            key={item.id}
                            item={item}
                            items={items}
                            desktop={true}
                            deleteItems={deleteItems}
                            UpdateMR={UpdateMR}
                            handleReject={handleReject}
                            handleProsess={handleProsess}
                            doneMR={doneMR}
                        />
                    ))
                }
                </Transition>
                {
                    loading && <Loader Class={'mt-44'}/>
                }
            </Block>
        </Layout>
    )
}

export default DetailMR