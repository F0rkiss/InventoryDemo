import React, { useEffect, useRef, useState } from 'react'
import Layout from '../component/Layout'
import Transition from '../component/Transition'
import ScrollPagination from '../component/ScrollPagination'
import Loader from '../component/Loader'
import { Block } from 'framework7-react'
import { useNavigate } from 'react-router-dom'
import NotifCards from '../component/cards/NotifCards'
import DataEmpty from '../component/DataEmpty'
import api from '../../api/api'
import { encrypting } from '../../helper/EncryptHelper'
import Back from '../component/Back'

function Notifications() {
    const [items, setItems] = useState([])
    const [nextCursor, setNextCursor] = useState(null)
    const [loading, setLoading] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)
    const navigate = useNavigate()
    const hasFetched = useRef(false)

    useEffect(() => {
        if (!hasFetched.current) {
            fetchItems()
            hasFetched.current = true
        }
    }, [])

    const fetchItems = async () => {
        try {
            setLoading(true)
            const response = await api.get('notification')
            const data = response.data?.data || []

            const withReadStatus = data.map((item) => ({
                ...item,
                isRead: false,
            }))

            // ✅ sort newest first
            withReadStatus.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

            setItems(withReadStatus)
            setNextCursor(response.data?.next_cursor || null)
        } catch (error) {
            console.error('Gagal fetch notifikasi:', error)
            setItems([])
            setNextCursor(null)
        } finally {
            setLoading(false)
            setTimeout(() => setContentVisible(true), 50)
        }
    }

    const fetchMoreItems = async () => {
        if (loading || !nextCursor) return
        try {
            setLoading(true)
            const response = await api.get('notification', {
                params: { cursor: nextCursor },
            })
            const data = response.data?.data || []

            const newItems = data.map((item) => ({
                ...item,
                isRead: false,
            }))

            setItems((prevItems) => {
                const existingIds = new Set(prevItems.map((item) => item.id))
                const uniqueNew = newItems.filter((item) => !existingIds.has(item.id))
                const combined = [...prevItems, ...uniqueNew]

                // ✅ keep newest first
                return combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            })

            setNextCursor(response.data?.next_cursor || null)
        } catch (error) {
            console.error('Gagal fetch notifikasi tambahan:', error)
        } finally {
            setLoading(false)
            setTimeout(() => setContentVisible(true), 50)
        }
    }

    const goToPage = (notif) => {
        const encryptedId = encrypting(notif.id);
        if (notif.jenis_request === 'MR') {
            navigate(`/approvalStepHistory-makeRequest/detail/${encryptedId}`);
        } else if (notif.jenis_request === 'PR'){
            navigate(`/approvalStepHistory-purchaseRequest/detail/${encryptedId}`);
        } else if (notif.jenis_request === 'PO'){
            navigate(`/approvalStepHistory-purchaseOrder/detail/${encryptedId}`);
        } else if (notif.jenis_request === 'LPB'){
            navigate(`/approvalStepHistory-lpb/detail/${encryptedId}`);
        }
    }

    return (
        <Layout title={'Notifikasi'}>
            <Block>
                <Back goHome={() => navigate('/dashboard')} />
                <p className='text-2xl lg:text-3xl font-semibold capitalize ms-3 my-4'>
                    Daftar Notifikasi
                </p>
                <Transition contentVisible={contentVisible}>
                    <ScrollPagination
                        fetchMoreItems={fetchMoreItems}
                        loading={loading}
                        nextCursor={nextCursor}
                    >
                        {items.map((item, index) => (
                            <NotifCards
                                key={`${item.id}-${index}`}   // ✅ ensures uniqueness
                                item={item}
                                goToPage={goToPage}
                            />
                        ))}
                    </ScrollPagination>

                    {items.length <= 0 && !loading && <DataEmpty />}
                </Transition>
                {loading && <Loader Class={'mt-40'} />}
            </Block>
        </Layout>
    )
}

export default Notifications
