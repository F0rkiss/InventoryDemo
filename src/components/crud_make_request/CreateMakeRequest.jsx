import React, { useEffect, useState } from 'react'
import { Page, Block } from 'framework7-react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/api'
import Back from '../component/Back'
import Layout from '../component/Layout'
import Swal from 'sweetalert2'
import SelectPaginate from '../component/SelectPaginate'
import Transition from '../component/Transition'

function CreateMakeRequest() {
  const navigate = useNavigate()

  const [items, setItems] = useState({
    type_request: null,
    tanggal: '',
  })
  const [details, setDetails] = useState([])

  const [editIndex, setEditIndex] = useState(null)
  const [initialDetails, setInitialDetails] = useState({
    note_barang: '',
    qty: '',
  })

  const [openModal, setOpenModal] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)

  useEffect(() => {
    // small entrance animation like UpdatePurchaseOrder
    const t = setTimeout(() => setContentVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (disabled) return
      setDisabled(true)

      if (!items.type_request || !items.tanggal) {
        Swal.fire({
          icon: 'warning',
          title: 'Data belum lengkap',
          text: 'Silakan lengkapi type request dan tanggal!',
        })
        setDisabled(false)
        return
      }

      if (details.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Detail kosong',
          text: 'Tambahkan minimal satu detail barang.',
        })
        setDisabled(false)
        return
      }

      await api.post('inventMakeRequest-create', {
        invent_type_request_id: items.type_request?.value,
        tanggal: items.tanggal,
        note_barang: details.map((d) => d.note_barang),
        qty: details.map((d) => d.qty),
      })

      Swal.fire({
        title: 'Make request berhasil dibuat!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
      navigate('/make-request/list-make-request')
      resetValue()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Tidak dapat membuat make request',
        text: 'Ada Kesalahan Dalam Sistem',
      })
      resetValue()
    } finally {
      setDisabled(false)
    }
  }

  const resetValue = () => {
    setItems({ type_request: null, tanggal: '' })
    setDetails([])
  }

  return (
    <Layout title={'Create Make Request'}>
      <Block>
        <div className="px-4">
          <Back goHome={() => navigate('/make-request/list-make-request')} />
          <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Create Make Request</p>

          <Transition contentVisible={contentVisible}>
            <div className="p-8 bg-white shadow-sm rounded-lg border">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="mb-5 space-y-2">
                  <label className="font-semibold">Type Request</label>
                  <SelectPaginate
                    source={'inventTypeRequest'}
                    selectValue={items.type_request}
                    selectName={'Type request'}
                    itemLabel={['name']}
                    handleSelectChange={(type_request) => setItems({ ...items, type_request })}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="font-semibold">Tanggal</label>
                  <div className="bg-white p-2 rounded-md border border-gray-300 mt-2">
                    <input
                      type="date"
                      name="tanggal"
                      value={items.tanggal}
                      onChange={(e) => setItems({ ...items, tanggal: e.target.value })}
                      className="w-full p-2 placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                      placeholder="Tanggal"
                      required
                    />
                  </div>
                </div>

                <div className="mt-2 pt-3">
                  <p className="text-lg font-semibold">Detail</p>
                </div>
                <div className="space-y-3 my-3">
                  {
                    details.map((item, id) => (
                      <div
                        key={id}
                        className="border border-gray-300 rounded-lg p-3 flex justify-between items-center"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="font-medium">{item.note_barang}</span>
                          <span className="font-medium sm:px-3">Qty: {item.qty}</span>
                        </div>

                        <div className="flex space-x-2 border-l-2 pl-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              setInitialDetails(details[id])
                              setEditIndex(id)
                              setOpenModal(true)
                            }}
                          >
                            <i className="bx bx-edit text-xl text-cyan-600"></i>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              setDetails(details.filter((_, i) => i !== id))
                            }}
                          >
                            <i className="bx bx-trash text-xl text-red-500"></i>
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="flex mt-4">
                  <button
                    type="button"
                    className="w-full rounded-lg py-2 px-4 flex items-center font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-color duration-200"
                    onClick={() => {
                      setOpenModal(true)
                      setEditIndex(null)
                      setInitialDetails({ note_barang: '', qty: '' })
                    }}
                  >
                    <i className="bx bx-plus mr-2 font-semibold text-base"></i>
                    <span>{details.length === 0 ? 'Tambah detail' : 'Tambah detail lain'}</span>
                  </button>
                </div>

                <div className="flex flex-col items-center justify-self-center mt-10 max-w-full w-[25rem] space-y-2 text-center">
                  <button
                    disabled={disabled}
                    type="submit"
                    className="py-2 px-2 rounded-lg font-medium bg-blue-500/85 hover:bg-blue-500 transition-color duration-200 text-white disabled:bg-blue-200"
                  >
                    Submit
                  </button>
                  <button
                    className="py-2 px-2 rounded-lg font-medium border border-red-200 bg-red-50 hover:bg-red-100 transition-color duration-200 text-red-600"
                    onClick={resetValue}
                    type="button"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {openModal && (
              <ModalMR
                open={openModal}
                initialData={initialDetails}
                onClose={() => {
                  setOpenModal(false)
                  setEditIndex(null)
                }}
                onSave={(data) => {
                  if (editIndex !== null) {
                    setDetails(details.map((it, idx) => (idx === editIndex ? data : it)))
                  } else {
                    setDetails([...details, data])
                  }
                  setOpenModal(false)
                  setEditIndex(null)
                }}
              />
            )}
          </Transition>
        </div>
      </Block>
    </Layout>
  )
}

export default CreateMakeRequest
