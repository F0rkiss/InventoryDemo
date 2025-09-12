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

function ListLPB() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [nextCursor, setNextCursor] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [contentVisible, setContentVisible] = useState(false)
  const [filterToggle, setFilterToggle] = useState(false)

  const typingTimeoutRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchItems()
  }, [searchTerm, filterToggle])

  const buildEndpoint = () => {
    if (searchTerm) {
      return `laporanPenerimaanBarang/${searchTerm}`
    } else if (filterToggle) {
      return `laporanPenerimaanBarang-toggle?is_completed=1`
    } else {
      return 'laporanPenerimaanBarang'
    }
  }

  const fetchItems = async () => {
    try {
      setLoading(true)
      const endpoint = buildEndpoint()
      const response = await api.get(endpoint)
      const data = response.data.data

      setItems(data.data)
      setNextCursor(data.next_cursor)
      setLoading(false)
      setTimeout(() => setContentVisible(true), 50)
    } catch (error) {
      setLoading(false)
    }
  }

  const fetchMoreItems = async () => {
    if (!nextCursor || loading) return
    try {
      setLoading(true)
      const endpoint = buildEndpoint()

      const response = await api.get(endpoint, {
        params: { cursor: nextCursor },
      })
      const data = response.data.data

      setItems((prevItems) => {
        const existingIds = new Set(prevItems.map((item) => item.id))
        const newItems = data.data.filter((item) => !existingIds.has(item.id))
        return [...prevItems, ...newItems]
      })

      setNextCursor(data.next_cursor)
      setLoading(false)
      setTimeout(() => setContentVisible(true), 50)
    } catch (error) {
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
    }, 750)
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
        <div className="ms-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="lg:text-3xl text-2xl font-semibold capitalize">
              List Laporan Penerimaan Barang
            </p>
            <button
              onClick={() => setFilterToggle(!filterToggle)}
              className={`px-3 py-2 w-fit border text-base font-medium rounded-full flex justify-center items-center gap-2 transition-colors duration-200 ${
                filterToggle
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <i className="bx bxs-sort-alt"></i>
              {/* <span>{filterToggle ? 'Selesai' : 'Semua'}</span> */}
            </button>
          </div>
          <SearchBar
            onChange={handleSearchChange}
            disable={loading}
            values={searchQuery}
          />
        </div>

        <Transition contentVisible={contentVisible}>
          <ScrollPagination
            fetchMoreItems={fetchMoreItems}
            loading={loading}
            nextCursor={nextCursor}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <LPBCards 
                key={item.id} 
                item={item} 
                isList={true} 
                canUpdate={goToUpdate}
                />
              ))}
            </div>
          </ScrollPagination>

          {items.length <= 0 && !loading && <DataEmpty />}
        </Transition>

        {loading && <Loader Class="mt-44" />}
      </Block>
    </Layout>
  )
}

export default ListLPB
