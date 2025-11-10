import React, { useState, useEffect } from 'react'
import api from '../../api/api'
import { useNavigate, useParams } from 'react-router-dom'
import { Block } from 'framework7-react'
import Back from '../component/Back'
import Layout from '../component/Layout'
import { DecryptID } from '../../helper/EncryptHelper'
import Swal from 'sweetalert2'
import Transition from '../component/Transition'

function UpdateTingkatKebutuhan() {
  const [items, setItems] = useState({
    name: '',
    description: '',
  })
  const [decryptedId, setDecryptedId] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [error, setError] = useState(null)
  const [originalItems, setOriginalItems] = useState(null)
  const [isUnchanged, setIsUnchanged] = useState(true)
  const [contentVisible, setContentVisible] = useState(false)

  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const decryptedIds = DecryptID(id)
    setDecryptedId(decryptedIds)
    if (!decryptedIds) navigate(-1)
  }, [id])

  useEffect(() => {
    if (decryptedId) fetchItems()
  }, [decryptedId])

  const fetchItems = async () => {
    try {
      const response = await api.get(`inventStatus-detail/${decryptedId}`)
      const data = response.data.data
      const fetched = {
        name: data?.name || '',
        description: data?.description || '',
      }
      setItems(fetched)
      setOriginalItems(fetched)
      setIsUnchanged(true)
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal memuat data',
        text: 'Silakan coba lagi.',
      })
    } finally {
        setTimeout(() => setContentVisible(true), 50)
    }
  }

  // Disable Update until there is a change
  useEffect(() => {
    if (!originalItems) return
    const changed = items.name !== originalItems.name || items.description !== originalItems.description
    setIsUnchanged(!changed)
  }, [items, originalItems])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (disabled) return
      setDisabled(true)

      if (!items.name || !items.description) {
        Swal.fire({
          icon: 'warning',
          title: 'Data belum lengkap',
          text: 'Nama dan Deskripsi wajib diisi.',
        })
        setDisabled(false)
        return
      }

      await api.put(`inventStatus-update/${decryptedId}`, {
        name: items.name,
        description: items.description,
      })

      Swal.fire({
        title: 'Status berhasil diperbarui!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
      navigate('/status/list-status')
    } catch (error) {
      setError(error?.response?.data ?? error)
      Swal.fire({
        icon: 'error',
        title: 'Gagal mengubah Status',
        text: 'Ada kesalahan dalam sistem.',
      })
    } finally {
      setDisabled(false)
    }
  }

  const resetValue = () => {
    if (originalItems) setItems(originalItems)
    else setItems({ name: '', description: '' })
  }

  return (
    <Layout title={'Update Status'}>
      <Block>
        <div className="px-4">
          <Back goHome={() => navigate('/status/list-status')} />
          <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Update Status</p>
          <Transition contentVisible={contentVisible}>
            <div className="p-8 bg-white shadow-sm rounded-lg border">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="mb-5 space-y-2">
                  <label className="font-semibold">Nama Status</label>
                  <div className="bg-white p-2 rounded-md border border-gray-300 mt-2">
                    <input
                      type="text"
                      name="name"
                      value={items.name}
                      onChange={(e) => setItems({ ...items, name: e.target.value })}
                      maxLength={50}
                      placeholder="Nama"
                      className="w-full p-2 placeholder:text-gray-400 placeholder:font-inter placeholder:font-light capitalize"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="font-semibold">Deskripsi</label>
                  <div className="bg-white p-2 rounded-md border border-gray-300 mt-2">
                    <input
                      type="text"
                      name="description"
                      value={items.description}
                      onChange={(e) => setItems({ ...items, description: e.target.value })}
                      className="w-full p-2 placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                      placeholder="Deskripsi"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-self-center mt-10 max-w-full w-[25rem] space-y-2 text-center">
                  <button
                    disabled={disabled || isUnchanged}
                    type="submit"
                    className="py-2 px-2 rounded-lg font-medium bg-blue-500/85 hover:bg-blue-500 transition-color duration-200 text-white disabled:bg-blue-200"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={resetValue}
                    className="py-2 px-2 rounded-lg font-medium border border-red-200 bg-red-50 hover:bg-red-100 transition-color duration-200 text-red-600"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </Transition>
        </div>
      </Block>
    </Layout>
  )
}

export default UpdateTingkatKebutuhan
