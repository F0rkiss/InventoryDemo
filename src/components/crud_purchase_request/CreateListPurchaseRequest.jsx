import React, { useEffect, useRef, useState } from 'react'
import { Block } from 'framework7-react'
import api from '../../api/api'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../component/SearchBar'
import Loader from '../component/Loader'
import Transition from '../component/Transition'
import ScrollPagination from '../component/ScrollPagination'
import Layout from '../component/Layout'
import PurchaseRequestCards from '../component/cards/PurchaseRequestCards.jsx'
import DataEmpty from '../component/DataEmpty'
import { encrypting } from '../../helper/EncryptHelper'

function CreatePurchaseRequestList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [nextCursor, setNextCursor] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [contentVisible, setContentVisible] = useState(false)
  const typingTimeoutRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    // initial load and whenever searchTerm changes
    fetchItems()
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [searchTerm])

  const fetchItems = async () => {
    try {
      setContentVisible(false)
      setLoading(true)
      const params = {}
      if (searchTerm) params.search = searchTerm
      const response = await api.get('purchaseRequest-makeRequest', { params })
      const data = response.data.data
      setItems(data.data || [])
      setNextCursor(data.next_cursor || null)
      setLoading(false)
      setTimeout(() => setContentVisible(true), 50)
    } catch (error) {
      setLoading(false)
      setContentVisible(true)
    }
  }

  const fetchMoreItems = async () => {
    if (!nextCursor || loading) return
    try {
      setLoading(true)
      const params = { cursor: nextCursor }
      if (searchTerm) params.search = searchTerm
      const response = await api.get('purchaseRequest-makeRequest', { params })
      const data = response.data.data
      setItems(prevItems => {
        const existingIds = new Set(prevItems.map(i => i.id))
        const newItems = (data.data || []).filter(i => !existingIds.has(i.id))
        return [...prevItems, ...newItems]
      })
      setNextCursor(data.next_cursor || null)
      setLoading(false)
      setTimeout(() => setContentVisible(true), 50)
    } catch (error) {
      setLoading(false)
    }
  }

  const handleSearchChange = (query) => {
    setSearchQuery(query)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      // start a fresh search: reset cursor and items then set searchTerm to trigger fetchItems
      setNextCursor(null)
      setItems([])
      setSearchTerm(query)
    }, 750)
  }

  const goToDetail = async (itemid) => {
    const encryptingID = await encrypting(itemid)
    navigate(`/Purchase-request/update-Purchase-request/${encryptingID}`)
  }

  const goToCreate = async (id) => {
    const encryptingID = await encrypting(id)
    navigate(`/make-purchase-request/create-purchase-request/${encryptingID}`)
  }

  return (
    <Layout title={'Create List Purchase Request'}>
      <Block>
        <div className='ms-3 mb-4 flex items-center justify-between'>
          <p className='lg:text-3xl text-2xl font-semibold capitalize'>Create List Purchase Request</p>
          <SearchBar
            onChange={handleSearchChange}
            disable={loading}
            values={searchQuery}
          />
        </div>

        <Transition contentVisible={contentVisible}>
          <ScrollPagination
            rootSelector=".page-content"
            fetchMoreItems={fetchMoreItems}
            loading={loading}
            nextCursor={nextCursor}
          >
            <div className='gap-4'>
              {items.map((item) => (
                <PurchaseRequestCards
                  key={item.id}
                  item={item}
                  goToCreate={goToCreate}
                  goToDetail={goToDetail}
                />
              ))}
            </div>
          </ScrollPagination>

          {items.length === 0 && !loading && <DataEmpty />}
        </Transition>

        {loading && <Loader Class="mt-44" />}
      </Block>
    </Layout>
  )
}

export default CreatePurchaseRequestList
