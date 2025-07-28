import React, { useEffect, useRef, useState } from 'react'
import Layout from './Layout'
import Transition from '../component/Transition'
import ScrollPagination from '../component/ScrollPagination'
import Loader from '../component/Loader'
import { Block } from 'framework7-react'
import { useNavigate } from 'react-router-dom'
import NotifCards from '../component/cards/NotifCards'
import DataEmpty from '../component/DataEmpty'
import api from '../../api/api'
import { encrypting } from '../../helper/EncryptHelper'
import Back from './Back'

function Notifications() {
    const [items, setItems] = useState([])
    const [nextCursor, setNextCursor] = useState(null)
    const [loading, setLoading] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)
    const navigate = useNavigate()
    const hasFetched = useRef(false) // ✅ Tambahan

    useEffect(() => {
        if (!hasFetched.current) {      // ✅ Tambahan
            fetchItems()
            hasFetched.current = true   // ✅ Tambahan
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

            setItems(withReadStatus)
            setNextCursor(data.next_cursor || null)
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
                return [...prevItems, ...uniqueNew]
            })

            setNextCursor(data.next_cursor || null)
        } catch (error) {
            console.error('Gagal fetch notifikasi tambahan:', error)
        } finally {
            setLoading(false)
            setTimeout(() => setContentVisible(true), 50)
        }
    }

    const goToPage = async (id) => {
        const encryptingID = await encrypting(id)
        navigate(`/approvalStepHistory-makeRequest/detail/${encryptingID}`)
    }

    return (
        <Layout title={'Notifikasi'}>
            <Block>
                <Back goHome={() => navigate('/dashboard')} />
                <p className='text-xl font-bold capitalize ms-3 mb-3'>Daftar Notifikasi</p>
                <Transition contentVisible={contentVisible}>
                    <ScrollPagination fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
                        {
                            items.map((item) => (
                                <NotifCards
                                    key={item.id}
                                    item={item}
                                    goToPage={goToPage}
                                />
                            ))
                        }
                    </ScrollPagination>
                    {
                        items.length <= 0 && !loading && <DataEmpty />
                    }
                </Transition>
                {loading && <Loader Class={'mt-40'} />}
            </Block>
        </Layout>
    )
}

export default Notifications
