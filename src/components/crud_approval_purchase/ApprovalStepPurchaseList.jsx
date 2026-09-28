import React, { useEffect, useRef, useState } from 'react'
import { Block } from 'framework7-react'
import api from '../../api/api'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../component/SearchBar'
import Loader from '../component/Loader'
import Transition from '../component/Transition'
import ScrollPagination from '../component/ScrollPagination'
import Layout from '../component/Layout'
import ApprovalStepMemoCard from '../component/cards/ApprovalStepMemoCards.jsx'
import DataEmpty from '../component/DataEmpty'
import { encrypting } from '../../helper/EncryptHelper'
import Swal from 'sweetalert2'
import useMenuAccess from '../../hooks/useMenuAccess'
import FlyingButton from '../component/FlyingButton'
import Tabs from '../component/Tabs.jsx'

function ApprovalStepPurchaseList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [nextCursor, setNextCursor] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [contentVisible, setContentVisible] = useState(false)
  const [activeType, setActiveType] = useState(null)
  const [availableTypes, setAvailableTypes] = useState([])
  const typingTimeoutRef = useRef(null)
  const navigate = useNavigate()
  const { canUpdate, canDelete } = useMenuAccess('ApprovalStepPurchase')


  // Extract unique types from items - flexible to handle separators or plain types
  const extractUniqueTypes = (itemsData) => {
    const typesSet = new Set()
    
    itemsData.forEach(item => {
      if (item.type) {
        // Check if type contains separator (comma, semicolon, pipe, etc.)
        const separators = [',', ';', '|', '/']
        let hasSeparator = false
        
        for (const sep of separators) {
          if (item.type.includes(sep)) {
            // Split by separator and add each type
            item.type.split(sep).forEach(t => {
              const trimmed = t.trim()
              if (trimmed) typesSet.add(trimmed)
            })
            hasSeparator = true
            break
          }
        }
        
        // If no separator found, add the whole type as is
        if (!hasSeparator) {
          typesSet.add(item.type.trim())
        }
      }
    })
    
    return Array.from(typesSet).sort()
  }

  useEffect(() => {
    setContentVisible(false);
    fetchItems();
  }, [searchTerm])

  const fetchItems = async () => {
    setLoading(true)
    setItems([])
    setNextCursor(null)
    try {
      const response = await api.get(searchTerm ? `approvalStepPurchase/${searchTerm}` : 'approvalStepPurchase')
      const data = response.data.data
      const itemsData = data.data || []
      setItems(itemsData)
      setNextCursor(data.next_cursor)
      
      // Extract unique types from items - handles both separator and non-separator cases
      const types = extractUniqueTypes(itemsData)
      setAvailableTypes(types)
      
      // Set initial active type if not already set
      if (!activeType && types.length > 0) {
        setActiveType(types[0])
      }
    } catch (error) {
      setItems([])
      setAvailableTypes([])
    } finally {
      setLoading(false)
      setTimeout(() => setContentVisible(true), 50)
    }
  }

  const fetchMoreItems = async () => {
    if (!nextCursor || loading) return
    try {
      setLoading(true)
      const response = await api.get(searchTerm ? `approvalStepPurchase/${searchTerm}` : 'approvalStepPurchase', {
        params: { cursor: nextCursor },
      })
      const data = response.data.data
      setItems(prevItems => {
        const existingIds = new Set(prevItems.map(item => item.id))
        const newItems = data.data.filter(item => !existingIds.has(item.id))
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

  // const goToDetail = async (id) => {
  //   const encryptingID = await encrypting(id)
  //   navigate(`/approval-step-purchase/detail-approval-purchase/${encryptingID}`)
  // }

  const goToUpdate = async (id) => {
    const encryptingID = await encrypting(id)
    navigate(`/approval-step-purchase/update-approval-step/${encryptingID}`)
  }

  const deleteItems = async (id) => {
    try {
      const result = await Swal.fire({
        title: `Apakah Anda Yakin Menghapus Approval Step Purchase Ini?`,
        icon: 'question',
        showDenyButton: true,
        confirmButtonText: 'Yes',
        denyButtonText: 'No',
        customClass: {
          actions: 'my-actions',
          confirmButton: 'order-2',
          denyButton: 'order-3',
        },
      })

      if (result.isConfirmed) {
        await api.delete(`approvalStepPurchase-delete/${id}`)
        setItems(items.filter((item) => item.id !== id))
        Swal.fire('Terhapus!', '', 'success')
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Tidak Dapat Menghapus User',
        text: 'Ada Kesalahan Dalam Sistem',
      })
    }
  }

  return (
    <Layout title={'List Approval Step Purchase'}>
      <Block>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2'>
          <p className='lg:text-3xl text-2xl font-semibold capitalize'>Approval Step Purchase List</p>
          <SearchBar onChange={handleSearchChange} disable={loading} values={searchQuery} />
        </div>

        {availableTypes.length > 0 && (
          <Tabs items={availableTypes} active={activeType} onChange={setActiveType}/>
        )}
        <Transition contentVisible={contentVisible}>
          <ScrollPagination fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {items
                .filter(item => {
                  if (!activeType) return true
                  // Check if item.type matches activeType (handles both separated and non-separated)
                  const separators = [',', ';', '|', '/']
                  for (const sep of separators) {
                    if (item.type?.includes(sep)) {
                      return item.type.split(sep).map(t => t.trim()).includes(activeType)
                    }
                  }
                  return item.type?.trim() === activeType
                })
                .map((item) => (
                <ApprovalStepMemoCard
                key={item.id}
                item={item}
                // goToDetail={goToDetail}
                goToUpdate={goToUpdate}
                deleteItems={deleteItems}
                canUpdate={canUpdate}
                canDelete={canDelete}
              />
              ))}
            </div>
          </ScrollPagination>
        </Transition>
          {
            items.length <= 0 && 
            contentVisible &&
            !loading && 
            <DataEmpty />
          }
        {loading && <Loader Class='mt-44' />}
      </Block>
      <FlyingButton goTo={'/approval-step-purchase/create-approval-step'} />
    </Layout>
  )
}

export default ApprovalStepPurchaseList;
