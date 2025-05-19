import React, { useEffect, useState } from 'react'
import MakeHistoryForms from '../component/forms/MakeHistoryForms'
import { Block } from 'framework7-react'
import api from '../../api/api'
import { useNavigate, useParams } from 'react-router-dom'
import { DecryptID, encrypting } from '../../helper/EncryptHelper'
import Layout from '../component/Layout'
import DetailBarangCards from '../component/cards/DetailBarangCards'
import Swal from 'sweetalert2'

const MRHistory = () => {
    
    const [itemHistories, setItemHistories] = useState({
        user: null,
        spek_upgraded: '',
        status: null,
        lokasi: '',
    })
    const [decryptedId, setDecryptedId] = useState('')
    const [currentPage, setCurrentPage] = useState('')
    const [barang, setBarang] = useState(null)
    const [items, setItems] = useState(null)
    const [idArray, setIdArray] = useState(null)
    const [disabled, setDisabled] = useState(false)
    const {id} = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        const decrypt = DecryptID(id)
        setDecryptedId(decrypt)
        if(!decrypt) {
            navigate(-1)
        }
    }, [id])

    useEffect(() => {
        if (decryptedId) {
            const array = decryptedId.split(',')
            setIdArray(array)
        }
    }, [decryptedId])

    useEffect(() => {
        if (items) {
            setItemHistories(({ user : barang.user && {value : barang.user?.id, label : barang.user?.name} ,status : {value : barang.status, label : barang.status} , spek_upgraded : '', lokasi: ''})) 
        }
    }, [items])

    useEffect(() => {
        if(idArray) {
            fetchItems()
        }
    }, [idArray])


    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (itemHistories.status.value !== 'rusak' && itemHistories.user == null) {
                Swal.fire({
                    icon: 'error',
                    title: 'Anda Harus Mengisi Usernya Jika Status Selain Rusak'
                })
                return
            }
            const back = items.barangs.length + 1
            setDisabled(true)
            const response = await api.post(`/history/${idArray[0]}`, {
                user_id : itemHistories.user?.value,
                status : itemHistories.status.value,
                spek_upgraded : itemHistories.spek_upgraded,
                lokasi : itemHistories.lokasi
            })
            if (currentPage + 1 == items.barangs.length ) {
                if (items.status == 'reject' || items.status == 'in prosess') {
                    navigate(-items.barangs.length)
                } else {
                    navigate(-back)
                }
            } else {               
                const barangIds = items.barangs.map(item => `${item.id}`)
                const item = parseInt(barangIds.indexOf(idArray[0]))
                const array = [...idArray]
                array[0] = barangIds[item + 1]
                const enkrip = await encrypting(array)
                navigate(`/make-request/history/${enkrip}`)
            }
        } catch (error) {
            const message = error.response.data.msg
            if (message.user_id[0] == "The user id field is required.") {
                Swal.fire({
                    icon: 'error',
                    title: 'Select User Kosong',
                    text: 'Hanya Bisa Kosong Jika Statusnya Rusak'
                })
                return
            }
            Swal.fire({
                icon: 'error',
                title: 'Error Dalam Sistem'
            })
        } finally {
            setDisabled(false)
        }
    }

    const fetchItems = async () => {
        try {
            const response = await api.get(`makeRequest/detail/${idArray[1]}`)
            const data = response.data.data
            const barangIds = data.barangs.map((barang) => `${barang.id}`)
            setBarang(data.barangs[barangIds.indexOf(idArray[0])])
            setCurrentPage(barangIds.indexOf(idArray[0]))
            setItems(data)
        } catch (error) {
            
        }
    }

    const handleInputChange = (field) => (e) => {
        setItemHistories({ ...itemHistories, [field]: e.target.value });
    };

    const handleSelectChange = (field) => (selectedOption) => {
        setItemHistories({ ...itemHistories, [field]: selectedOption });
    };

    return (
    <Layout title={'History Barang'}>
        {
            items &&    
                <DetailBarangCards
                item={barang}
                />
        }
        <Block>
            <MakeHistoryForms
            className={''}
            handleSubmit={handleSubmit}
            itemHistories={itemHistories}    
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
            items={items}
            disableSubmit={disabled}
            />
        </Block>
    </Layout>
    )
}

export default MRHistory