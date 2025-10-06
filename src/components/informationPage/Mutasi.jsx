import React, { useEffect, useRef, useState } from 'react'
import Layout from '../component/Layout'
import Transition from '../component/Transition'
import ScrollPagination from '../component/ScrollPagination'
import Loader from '../component/Loader'
import { Block } from 'framework7-react'
import { useNavigate } from 'react-router-dom'
import MutasiCards from '../component/cards/MutasiCards'
import DataEmpty from '../component/DataEmpty'
import api from '../../api/api'
import { encrypting } from '../../helper/EncryptHelper'
import Back from '../component/Back'

function Mutasi() {
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
            const response = await api.get('inventMutasi')

            // ✅ perbaikan struktur respons
            const data = Array.isArray(response.data?.data?.data)
                ? response.data.data.data
                : []

            const withReadStatus = data.map((item) => ({
                ...item,
                isRead: false,
            }))

            setItems(withReadStatus)
            setNextCursor(response.data?.data?.next_cursor || null)
        } catch (error) {
            console.error('Gagal fetch mutasi:', error)
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
            const response = await api.get('inventMutasi', {
                params: { cursor: nextCursor },
            })

            const data = Array.isArray(response.data?.data?.data)
                ? response.data.data.data
                : []

            const newItems = data.map((item) => ({
                ...item,
                isRead: false,
            }))

            setItems((prevItems) => {
                const existingIds = new Set(prevItems.map((i) => i.id))
                const uniqueNew = newItems.filter((i) => !existingIds.has(i.id))
                return [...prevItems, ...uniqueNew]
            })

            setNextCursor(response.data?.data?.next_cursor || null)
        } catch (error) {
            console.error('Gagal fetch mutasi tambahan:', error)
        } finally {
            setLoading(false)
        }
    }

    const goToPage = (item) => {
        const encryptedId = encrypting(item.id)
        navigate(`/inventMutasi/${encryptedId}`)
    }

    return (
        <Layout title={'Mutasi'}>
            <Block>
                <Back goHome={() => navigate('/dashboard')} />
                <p className='text-2xl lg:text-3xl font-semibold capitalize ms-3 my-4'>Daftar Mutasi</p>

                <Transition contentVisible={contentVisible}>
                    <ScrollPagination fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
                        {items.map((item) => (
                            <MutasiCards
                                key={item.id}
                                item={item}
                                goToPage={goToPage}
                            />
                        ))}
                    </ScrollPagination>

                    {!loading && items.length === 0 && <DataEmpty />}
                </Transition>

                {loading && <Loader Class={'mt-40'} />}
            </Block>
        </Layout>
    )
}

export default Mutasi
