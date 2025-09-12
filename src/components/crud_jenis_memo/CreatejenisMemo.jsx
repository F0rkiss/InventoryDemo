import React, { useEffect, useState } from 'react'
import api from '../../api/api'
import { useNavigate } from 'react-router-dom'
import { Block } from 'framework7-react'
import Back from '../component/Back'
import Layout from '../component/Layout'
import Swal from 'sweetalert2'
import Select from 'react-select'
import Transition from '../component/Transition'
import { isDynamic } from '../../helper/FindOptions'

function CreateJenisMemo() {
  const [items, setItems] = useState({
    name: '',
    description: '',
    is_dynamic: null, // { value, label }
  })

  const [disabled, setDisabled] = useState(false)
  const [error, setError] = useState(null)
  const [contentVisible, setContentVisible] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => setContentVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  // clear backend error once user edits any field
  useEffect(() => {
    if (error) setError(null)
  }, [items])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (disabled) return
      setDisabled(true)

      // basic validations
      if (!items.name || !items.description || !items.is_dynamic) {
        Swal.fire({
          icon: 'warning',
          title: 'Data belum lengkap',
          text: 'Nama, Deskripsi, dan Tipe (Dinamis/Statis) wajib diisi.',
        })
        setDisabled(false)
        return
      }

      await api.post('jenisMemo-create', {
        name: items.name,
        description: items.description,
        is_dynamic: items.is_dynamic.value,
      })

      Swal.fire({
        title: 'Jenis Memo berhasil dibuat!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })

      navigate('/jenismemo/list-jenismemo')
      resetValue()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Tidak Dapat Membuat Jenis Memo',
        text: 'Ada Kesalahan Dalam Sistem',
      })
      setError(err?.response?.data ?? err)
    } finally {
      setDisabled(false)
    }
  }

  const resetValue = () => {
    setItems({
      name: '',
      description: '',
      is_dynamic: null,
    })
  }

  return (
    <Layout title={'Create Jenis Memo'}>
      <Block>
        <div className="px-4">
          <Back goHome={() => navigate('/jenismemo/list-jenismemo')} />
          <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Create Jenis Memo</p>

          <Transition contentVisible={contentVisible}>
            <div className="p-8 bg-white shadow-sm rounded-lg border">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="mb-5 space-y-2">
                  <label className="font-semibold">Nama Jenis Memo</label>
                  <div className="bg-white p-2 rounded-md border border-gray-300 mt-2">
                    <input
                      type="text"
                      name="name"
                      value={items.name}
                      maxLength={50}
                      onChange={(e) => setItems({ ...items, name: e.target.value })}
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

                <div className="mb-4 space-y-2">
                  <label className="font-semibold">Dinamis atau Statis</label>
                  <Select
                    onChange={(is_dynamic) => setItems({ ...items, is_dynamic })}
                    value={items.is_dynamic}
                    options={isDynamic}
                    classNamePrefix="react-select"
                    required
                  />
                </div>

                <div className="flex flex-col items-center justify-self-center mt-10 max-w-full w-[25rem] space-y-2 text-center">
                  <button
                    disabled={disabled}
                    type="submit"
                    className="py-2 px-2 rounded-lg font-medium bg-blue-500/85 hover:bg-blue-500 transition-color duration-200 text-white disabled:bg-blue-200"
                  >
                    Create
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

export default CreateJenisMemo
