import React, { useEffect, useRef, useState } from 'react'
import { Block } from 'framework7-react'
import api from '../../api/api'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../component/SearchBar'
import Loader from '../component/Loader'
import Transition from '../component/Transition'
import ScrollPagination from '../component/ScrollPagination'
import Layout from '../component/Layout'
import LPBCards from '../component/cards/LPBCards.jsx'
import DataEmpty from '../component/DataEmpty'
import { encrypting } from '../../helper/EncryptHelper'
import FilterStatusToggle from '../component/FilterStatusToggle'

function ListLPB() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [nextCursor, setNextCursor] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [contentVisible, setContentVisible] = useState(false)

  const [filterStatus, setFilterStatus] = useState('all')
  const onFilterChange = (next) => setFilterStatus(next)

  const typingTimeoutRef = useRef(null)
  const navigate = useNavigate()
  const boolToInt = (val) => (val ? 1 : 0)

  useEffect(() => {
  fetchItems()
}, [searchTerm, filterStatus]) // samain nama biar konsisten, bukan filterToggle

const fetchItems = async () => {
  try {
    setLoading(true)

    let endpoint = 'laporanPenerimaanBarang'
    const params = { cursor: nextCursor }

    // Prioritize search term over filters
    if (searchTerm) {
      params.search = searchTerm
    } else {
      // Only apply filters when there's no search term
      if (filterStatus === 'completed') {
        endpoint = 'laporanPenerimaanBarang-toggle'
        params.is_full_approval = 1
      } else if (filterStatus === 'not_completed') {
        endpoint = 'laporanPenerimaanBarang-toggle'
        params.is_full_approval = 0
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

    let endpoint = 'laporanPenerimaanBarang'
    const params = { cursor: nextCursor }

    // Prioritize search term over filters
    if (searchTerm) {
      params.search = searchTerm
    } else {
      // Only apply filters when there's no search term
      if (filterStatus === 'completed') {
        endpoint = 'laporanPenerimaanBarang-toggle'
        params.is_full_approval = 1
      } else if (filterStatus === 'not_completed') {
        endpoint = 'laporanPenerimaanBarang-toggle'
        params.is_full_approval = 0
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
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      setSearchTerm(query)
    }, 1200)
  }

  const goToDetail = async (itemid) => {
    const encryptingID = await encrypting(itemid)
    navigate(`/lpb/detail-lpb/${encryptingID}`)
  }

  const goToUpdate = async (id) => {
    const encryptingID = await encrypting(id)
    navigate(`/lpb/update-lpb/${encryptingID}`)
  }

  return (
    <Layout title={'List Purchase Request'}>
      <Block>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
          <p className="lg:text-3xl text-2xl font-semibold capitalize">
            Daftar Laporan Penerimaan Barang
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
          {items.length > 0 ? (
            <ScrollPagination
              fetchMoreItems={fetchMoreItems}
              loading={loading}
              nextCursor={nextCursor}
            >
              <div className=" gap-4">
                {items.map((item) => (
                  <LPBCards 
                  key={item.id} 
                  item={item} 
                  isList={true} 
                  goToUpdate={goToUpdate}
                  goToDetail={goToDetail}
                  />
                ))}
              </div>
            </ScrollPagination>
          ) : (
            !loading && <DataEmpty />
          )}
        </Transition>

        {loading && <Loader Class="mt-44" />}
      </Block>
    </Layout>
  )
}

export default ListLPB
