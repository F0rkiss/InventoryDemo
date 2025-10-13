import React, { useEffect, useRef, useState } from 'react'
import { Block } from 'framework7-react'
import { useNavigate } from 'react-router-dom'
import Layout from '../component/Layout'
import Transition from '../component/Transition'
import ScrollPagination from '../component/ScrollPagination'
import Loader from '../component/Loader'
import LogCards from '../component/cards/LogCards'
import DataEmpty from '../component/DataEmpty'
import SearchBar from '../component/SearchBar'
import api from '../../api/api'

function Log() {
    const [items, setItems] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [nextCursor, setNextCursor] = useState(null)
    const [loading, setLoading] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)

    const navigate = useNavigate()
    const hasFetched = useRef(false)
    const typingTimeoutRef = useRef(null)

    // --- INITIAL LOAD ---
    useEffect(() => {
        if (!hasFetched.current) {
            fetchItems()
            hasFetched.current = true
        }
    }, [])

    // --- FETCH ITEMS ---
    const fetchItems = async (query = '') => {
        try {
            setLoading(true)
            const endpoint = query ? `log/${query}` : 'log'
            const { data } = await api.get(endpoint)

            const logs = Array.isArray(data?.data?.data) ? data.data.data : []
            const withReadStatus = logs.map((item) => ({ ...item, isRead: false }))

            setItems(withReadStatus)
            setNextCursor(data?.data?.next_cursor || null)
        } catch (error) {
            console.error('Gagal fetch Log:', error)
            setItems([])
            setNextCursor(null)
        } finally {
            setLoading(false)
            setTimeout(() => setContentVisible(true), 50)
        }
    }

    // --- FETCH MORE ITEMS ---
    const fetchMoreItems = async () => {
        if (loading || !nextCursor) return
        try {
            setLoading(true)
            const endpoint = searchTerm ? `log/${searchTerm}` : 'log'
            const { data } = await api.get(endpoint, { params: { cursor: nextCursor } })

            const newLogs = Array.isArray(data?.data?.data) ? data.data.data : []
            const uniqueLogs = newLogs.filter(
                (log) => !items.some((i) => i.id === log.id)
            )

            setItems((prev) => [
                ...prev,
                ...uniqueLogs.map((item) => ({ ...item, isRead: false })),
            ])
            setNextCursor(data?.data?.next_cursor || null)
        } catch (error) {
            console.error('Gagal fetch log tambahan:', error)
        } finally {
            setLoading(false)
        }
    }

    // --- SEARCH HANDLER (like modal style) ---
    const handleSearchChange = (term) => {
        setSearchTerm(term)

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

        typingTimeoutRef.current = setTimeout(() => {
            if (term.trim()) fetchItems(term)
            else fetchItems()
        }, 400)
    }

    return (
        <Layout title="Log">
            <Block>
                <div className="ms-3 mb-4 flex items-center justify-between">
                    <p className="lg:text-3xl text-2xl font-semibold capitalize">
                        Log List
                    </p>
                    <SearchBar
                        onChange={handleSearchChange}
                        disable={loading}
                        values={searchTerm}
                    />
                </div>

                <Transition contentVisible={contentVisible}>
                    <ScrollPagination
                        fetchMoreItems={fetchMoreItems}
                        loading={loading}
                        nextCursor={nextCursor}
                    >
                        {items.map((item) => (
                            <LogCards key={item.id} item={item} />
                        ))}
                    </ScrollPagination>

                    {!loading && items.length === 0 && <DataEmpty />}
                </Transition>

                {loading && <Loader Class="mt-40" />}
            </Block>
        </Layout>
    )
}

export default Log
