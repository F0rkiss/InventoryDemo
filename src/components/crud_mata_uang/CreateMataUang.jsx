import React, { useEffect, useState } from 'react'
import api from '../../api/api'
import { useNavigate } from 'react-router-dom'
import { Block } from 'framework7-react'
import Back from '../component/Back'
import Layout from '../component/Layout'
import Swal from 'sweetalert2'
import Transition from '../component/Transition'

function CreateMataUang() {
  const [items, setItems] = useState({
    kode: '',
    name: '',
    symbol: '',
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
  }, [items.kode, items.name, items.symbol])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (disabled) return
      setDisabled(true)

      // basic validations
      if (!items.kode || !items.name || !items.symbol ) {
        Swal.fire({
          icon: 'warning',
          title: 'Data belum lengkap',
          text: 'Semua data wajib diisi.',
        })
        setDisabled(false)
        return
      }

      await api.post('mataUang-create', {
        kode: items.kode,
        name: items.name,
        symbol: items.symbol,
      })

      Swal.fire({
        title: 'Mata uang berhasil dibuat!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })

      navigate('/mata-uang/list-mata-uang')
      resetValue()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Tidak Dapat Membuat Mata Uang',
        text: 'Ada Kesalahan Dalam Sistem',
      })
      setError(err?.response?.data ?? err)
    } finally {
      setDisabled(false)
    }
  }

  const resetValue = () => {
    setItems({ kode: '', name: '', symbol: '' })
  }

  return (
    <Layout title={'Create Mata Uang'}>
      <Block>
        <div className="px-4">
          <Back goHome={() => navigate('/mata-uang/list-mata-uang')} />
          <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Create Mata Uang</p>
          <Transition contentVisible={contentVisible}>
            <div className="p-8 bg-white shadow-sm rounded-lg border">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="mb-5 space-y-2">
                  <label className="font-semibold">Kode</label>
                  <div className="bg-white p-2 rounded-md border border-gray-300 mt-2">
                    <input
                      type="text"
                      name="kode"
                      value={items.kode}
                      maxLength={50}
                      onChange={(e) => setItems({ ...items, kode: e.target.value })}
                      placeholder="Kode mata uang"
                      className="w-full p-2 placeholder:text-gray-400 placeholder:font-light capitalize"
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="font-semibold">Mata Uang</label>
                  <div className="bg-white p-2 rounded-md border border-gray-300 mt-2">
                    <input
                      type="text"
                      name="name"
                      value={items.name}
                      onChange={(e) => setItems({ ...items, name: e.target.value })}
                      className="w-full p-2 placeholder:text-gray-400 placeholder:font-light"
                      placeholder="Nama mata uang"
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="font-semibold">Simbol</label>
                  <div className="bg-white p-2 rounded-md border border-gray-300 mt-2">
                    <input
                      type="text"
                      name="symbol"
                      value={items.symbol}
                      onChange={(e) => setItems({ ...items, symbol: e.target.value })}
                      className="w-full p-2 placeholder:text-gray-400  placeholder:font-light"
                      placeholder="Simbol mata uang"
                      required
                    />
                  </div>
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

export default CreateMataUang;
