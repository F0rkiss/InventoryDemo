import React, { useEffect, useRef, useState, useMemo } from 'react'
import { Block } from 'framework7-react'
import api from '../../api/api.jsx'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../component/SearchBar.jsx'
import Loader from '../component/Loader.jsx'
import Transition from '../component/Transition.jsx'
import Layout from '../component/Layout.jsx'
import FlyingButton from '../component/FlyingButton.jsx'
import ApprovalStepCard from '../component/cards/ApprovalStepMemoCards.jsx'
import DataEmpty from '../component/DataEmpty.jsx'
import { encrypting } from '../../helper/EncryptHelper.js'
import Swal from 'sweetalert2'
import useMenuAccess from '../../hooks/useMenuAccess.js'

function ApprovalStepMemoStatisList() {
  const [typeRequests, setTypeRequests] = useState([])   // all types from API
  const [activeType, setActiveType] = useState(null)     // selected tab
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  const typingTimeoutRef = useRef(null)
  const navigate = useNavigate()
  const { canUpdate, canDelete, canCreate } = useMenuAccess('ApprovalStepMemo')

  // Fetch all type requests once
  useEffect(() => {
    const fetchTypeRequests = async () => {
      try {
        setLoading(true)
        const response = await api.get('approvalStepMemo-filter')
        const data = response.data.data
        setTypeRequests(data)
        if (data.length > 0) {
          setActiveType(data[0].id)
        }
        setLoading(false)
        setTimeout(() => setContentVisible(true), 50)
      } catch (error) {
        setLoading(false)
        console.error('Failed to fetch type requests', error)
      }
    }
    fetchTypeRequests()
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [])

  const handleSearchChange = (query) => {
    setSearchQuery(query)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      const term = query.trim().toLowerCase()
      setSearchTerm(term)
    }, 400)
  }

  // Ensure activeType stays valid if its parent is removed
  useEffect(() => {
    if (activeType == null) return
    const stillExists = typeRequests.some(t => t.id === activeType)
    if (!stillExists && typeRequests.length > 0) {
      setActiveType(typeRequests[0].id)
    }
  }, [typeRequests, activeType])

  const goToUpdate = async (id) => {
    const encryptingID = await encrypting(id)
    navigate(`/approval-step-memo/update-approval-step-memo/${encryptingID}`)
  }

  const deleteItems = async (id) => {
    try {
      const result = await Swal.fire({
        title: `Apakah Anda Yakin Menghapus Approval Step Ini?`,
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
        await api.delete(`approvalStepMemo-delete/${id}`)
        // remove from active tab only
        setTypeRequests(prev =>
          prev.map(t =>
            t.id === activeType
              ? { ...t, approval_steps: t.approval_steps.filter(s => s.id !== id) }
              : t
          )
        )
        Swal.fire('Terhapus!', '', 'success')
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Tidak Dapat Menghapus Approval',
        text: 'Ada Kesalahan Dalam Sistem'
      })
    }
  }

  // Get approval steps for active tab
  const activeSteps = useMemo(() => {
    const steps = typeRequests.find(t => t.id === activeType)?.approval_steps || []
    return [...steps].sort((a, b) => {
      if (a.approval_step === b.approval_step) return a.id - b.id
      return a.approval_step - b.approval_step
    })
  }, [typeRequests, activeType])

  // Local search: note, user name, approval step number
  const filteredItems = useMemo(() => {
    if (!searchTerm) return activeSteps
    return activeSteps.filter(item => {
      const note = item.note?.toLowerCase() || ''
      const userName = item.user?.EmpName?.toLowerCase() || ''
      const stepNum = String(item.approval_step)
      return (
        note.includes(searchTerm) ||
        userName.includes(searchTerm) ||
        stepNum.startsWith(searchTerm)
      )
    })
  }, [activeSteps, searchTerm]) 
  
  return (
    <Layout title={'List Approval Step'}>
      <Block>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2'>
          <p className='lg:text-3xl text-2xl font-semibold capitalize'>Approval Step Memo List</p>
          <SearchBar onChange={handleSearchChange} disable={loading} values={searchQuery} />
        </div>

        <Transition contentVisible={contentVisible}>
          {/* Dynamic Tabs */}
          <div className="border-b mb-4 flex gap-4 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:h-2
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-track]:bg-gray-100
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-gray-400
            [&::-webkit-scrollbar-thumb]:h-1">
            {typeRequests.map((type) => (
              <button
                key={type.id}
                type="button"
                aria-pressed={activeType === type.id}
                aria-label={`Tab ${type.name}`}
                onClick={() => setActiveType(type.id)}
                className={`px-4 py-2 font-medium transition-colors duration-200 ${
                  activeType === type.id
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filteredItems.map((item) => (
              <ApprovalStepCard
                key={item.id}
                item={item}
                deleteItems={deleteItems}
                goToUpdate={goToUpdate}
                canDelete={canDelete}
                canUpdate={canUpdate}
                from={'memo'}
              />
            ))}
          </div>

          {filteredItems.length <= 0 && !loading && <DataEmpty />}
        </Transition>

        {loading && <Loader Class='mt-44' />}
        {canCreate && <FlyingButton goTo={'/approval-step-memo/create-approval-step-memo'} />}
      </Block>
    </Layout>
  )
}

export default ApprovalStepMemoStatisList