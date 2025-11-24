import React, { useEffect, useRef, useState } from 'react'
import { Block } from 'framework7-react'
import api from '../../api/api'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../component/SearchBar'
import Loader from '../component/Loader'
import Transition from '../component/Transition'
import ScrollPagination from '../component/ScrollPagination'
import Layout from '../component/Layout'
import DataEmpty from '../component/DataEmpty'
import PurchaseRequestCards from '../component/cards/PurchaseRequestCards'
import { encrypting } from '../../helper/EncryptHelper'
import Swal from 'sweetalert2'
import FilterStatusToggle from '../component/FilterStatusToggle';

function PurchaseRequestList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [nextCursor, setNextCursor] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [contentVisible, setContentVisible] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')

  const navigate = useNavigate()
  const debounceRef = useRef(null)

  const onFilterChange = (next) => setFilterStatus(next)

  useEffect(() => {
    setItems([])
    setNextCursor(null)
    setContentVisible(false)
    fetchItems()
  }, [searchTerm, filterStatus])

  const fetchItems = async () => {
    try {
      setLoading(true)

      let endpoint = 'purchaseRequest'
      const params = {}

      // Prioritize search term over filters
      if (searchTerm) {
        params.search = searchTerm
      } else {
        // Only apply filters when there's no search term
        if (filterStatus === 'completed') {
          endpoint = 'purchaseRequest-toggle'
          params.is_completed = 1
        } else if (filterStatus === 'not_completed') {
          endpoint = 'purchaseRequest-toggle'
          params.is_completed = 0
        }
      }

      const response = await api.get(endpoint, { params })
      const data = response.data.data

      setItems(Array.isArray(data.data) ? data.data : [])
      setNextCursor(data.next_cursor)
      setTimeout(() => setContentVisible(true), 50)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMoreItems = async () => {
    if (!nextCursor || loading) return
    try {
      setLoading(true)

      let endpoint = 'purchaseRequest'
      const params = { cursor: nextCursor }

      // Prioritize search term over filters
      if (searchTerm) {
        params.search = searchTerm
      } else {
        // Only apply filters when there's no search term
        if (filterStatus === 'completed') {
          endpoint = 'purchaseRequest-toggle'
          params.is_completed = 1
        } else if (filterStatus === 'not_completed') {
          endpoint = 'purchaseRequest-toggle'
          params.is_completed = 0
        }
      }

      const response = await api.get(endpoint, { params })
      const data = response.data.data

      setItems((prevItems) => {
        const existingIds = new Set(prevItems.map((item) => item.id))
        const newItems = (data.data || []).filter(
          (item) => !existingIds.has(item.id)
        )
        return [...prevItems, ...newItems]
      })

      setNextCursor(data.next_cursor)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (query) => {
    setSearchQuery(query)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearchTerm(query.trim())
    }, 1200)
  }

  useEffect(() => {
    return () => debounceRef.current && clearTimeout(debounceRef.current)
  }, [])

  const goToDetail = async (itemid) => {
    const encryptingID = await encrypting(itemid)
    navigate(`/purchase-request/detail-purchase-request/${encryptingID}`)
  }

  const goToUpdate = async (id) => {
    const encryptingID = await encrypting(id)
    navigate(`/purchase-request/update-purchase-request/${encryptingID}`)
  }

  return (
    <Layout title={'List Purchase Request'}>
  <Block>
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
      <p className="lg:text-3xl text-2xl font-semibold capitalize">
        Purchase Request List
      </p>
      <div className="flex items-center gap-2">
        <SearchBar
          onChange={handleSearchChange}
          disable={loading}
          values={searchQuery}
        />
        <FilterStatusToggle
          value={filterStatus}
          onChange={onFilterChange}
        />
      </div>
    </div>

    <Transition contentVisible={contentVisible}>
      <div className="space-y-4">
        <ScrollPagination
          rootSelector=".page-content"
          fetchMoreItems={fetchMoreItems}
          loading={loading}
          nextCursor={nextCursor}
        >
          {items.map((item) => (
            <PurchaseRequestCards
              key={item.id}
              item={item}
              goToUpdate={goToUpdate}
              goToDetail={goToDetail}
              isList={true}
            />
          ))}
        </ScrollPagination>
      </div>
    </Transition>

    {items.length === 0 && !loading && contentVisible && <DataEmpty />}
    {loading && <Loader Class="mt-44" />}
  </Block>
</Layout>

  )
}

export default PurchaseRequestList
