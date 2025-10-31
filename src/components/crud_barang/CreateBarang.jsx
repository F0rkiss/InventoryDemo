import React, { useState, useEffect, useRef } from 'react'
import api from '../../api/api'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'
import Back from '../component/Back'
import { Block } from 'framework7-react'
import { isAsset } from '../../helper/FindOptions'
import Layout from '../component/Layout'
import SelectPaginate from '../component/SelectPaginate'
import Swal from 'sweetalert2'
import Transition from '../component/Transition'

function CreateBarang() {
  const navigate = useNavigate()

  const [items, setItems] = useState({
    name: '',
    kode_gudang: '',
    satuan: '',
    image: null,
    jenis_barang: null,
    categories: null,
    sumber_barang: null,
    tingkat_kebutuhan: null,
    is_asset: null,
  })

  const [disabled, setDisabled] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setContentVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const goHome = () => navigate('/barang/list-barang')

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      setItems({ ...items, image: null })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setItems({ ...items, image: null })
      if (fileInputRef.current) fileInputRef.current.value = ''
      Swal.fire({ icon: 'error', title: 'File Melebihi Batas Ukuran 5 MB' })
      return
    }
    setItems({ ...items, image: file })
  }

  const validate = () => {
    if (
      !items.name ||
      !items.kode_gudang ||
      !items.satuan ||
      !items.is_asset ||
      !items.jenis_barang ||
      !items.categories ||
      !items.sumber_barang ||
      !items.tingkat_kebutuhan
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Data belum lengkap',
        text: 'Semua field wajib diisi.',
      })
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (disabled) return
      setDisabled(true)
      if (!validate()) {
        setDisabled(false)
        return
      }

      const fd = new FormData()
      fd.append('invent_jenis_barangs_id', items.jenis_barang?.value)
      fd.append('invent_sumber_barangs_id', items.sumber_barang?.value)
      fd.append('invent_tingkat_kebutuhans_id', items.tingkat_kebutuhan?.value)
      fd.append('invent_categories_id', items.categories?.value)
      fd.append('name', items.name)
      fd.append('is_asset', items.is_asset?.value)
      fd.append('satuan', items.satuan)
      fd.append('kode_gudang', items.kode_gudang)
      if (items.image) fd.append('image', items.image)

      await api.post('/inventBarang-create', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      Swal.fire({
        title: 'Barang baru berhasil dibuat!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
      navigate('/barang/list-barang')
      resetValue()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Tidak Dapat Membuat Barang',
        text: 'Ada kesalahan dalam sistem',
      })
    } finally {
      setDisabled(false)
    }
  }

  const resetValue = () => {
    setItems({
      name: '',
      kode_gudang: '',
      satuan: '',
      image: null,
      jenis_barang: null,
      categories: null,
      sumber_barang: null,
      tingkat_kebutuhan: null,
      is_asset: null,
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <Layout title={'Create Barang'}>
      <Block>
        <div className="px-4">
          <Back goHome={goHome} />
          <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Create Barang</p>

          <Transition contentVisible={contentVisible}>
            <div className="p-8 bg-white shadow-sm rounded-lg border">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="mb-5 space-y-2">
                  <label className="font-semibold">Name</label>
                  <div className="bg-white p-2 rounded-md border border-gray-300 mt-2">
                    <input
                      type="text"
                      name="name"
                      value={items.name}
                      onChange={(e) => setItems({ ...items, name: e.target.value })}
                      className="w-full p-2 placeholder:text-gray-400 "
                      maxLength={80}
                      placeholder="Nama Barang"
                      required
                    />
                  </div>
                </div>

                {/* Kode & Gudang side-by-side on md+ */}
                <div className="md:grid md:grid-cols-2 md:gap-x-4">
                  <div className="space-y-2">
                    <label className="font-semibold">Kode Gudang</label>
                    <div className="bg-white p-2 rounded-md border border-gray-300 mt-2">
                      <input
                        type="text"
                        name="kode_gudang"
                        value={items.kode_gudang}
                        onChange={(e) => setItems({ ...items, kode_gudang: e.target.value })}
                        className="w-full p-2 placeholder:text-gray-400 "
                        maxLength={80}
                        placeholder="Kode Gudang"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Satuan & Asset side-by-side on md+ */}
                <div className="md:grid md:grid-cols-2 md:gap-x-4">
                  <div className="mb-5 space-y-2">
                    <label className="font-semibold">Satuan</label>
                    <div className="bg-white p-2 rounded-md border border-gray-300 mt-2">
                      <input
                        type="text"
                        name="satuan"
                        value={items.satuan}
                        onChange={(e) => setItems({ ...items, satuan: e.target.value })}
                        className="w-full p-2 placeholder:text-gray-400 "
                        maxLength={80}
                        placeholder="Satuan"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-5 space-y-2">
                    <label className="font-semibold">Aset</label>
                    <Select
                      options={isAsset}
                      value={items.is_asset}
                      placeholder="Aset"
                      onChange={(is_asset) => setItems({ ...items, is_asset })}
                      required
                    />
                  </div>
                </div>

                <div className="mb-5 space-y-2">
                  <label className="font-semibold">Jenis Barang</label>
                  <SelectPaginate
                    source={'inventJenisBarang'}
                    selectValue={items.jenis_barang}
                    selectName={'Jenis Barang'}
                    itemLabel={['name']}
                    handleSelectChange={(jenis_barang) => setItems({ ...items, jenis_barang })}
                    required
                  />
                </div>

                <div className="mb-5 space-y-2">
                  <label className="font-semibold">Categories</label>
                  <SelectPaginate
                    source={'inventCategories'}
                    selectValue={items.categories}
                    selectName={'Category'}
                    itemLabel={['name']}
                    handleSelectChange={(categories) => setItems({ ...items, categories })}
                    required
                  />
                </div>

                <div className="mb-5 space-y-2">
                  <label className="font-semibold">Sumber Barang</label>
                  <SelectPaginate
                    source={'inventSumberBarang'}
                    selectValue={items.sumber_barang}
                    selectName={'Sumber Barang'}
                    itemLabel={['name']}
                    handleSelectChange={(sumber_barang) => setItems({ ...items, sumber_barang })}
                    required
                  />
                </div>

                <div className="mb-5 space-y-2">
                  <label className="font-semibold">Tingkat Kebutuhan</label>
                  <SelectPaginate
                    source={'tingkatKebutuhanBarang'}
                    selectValue={items.tingkat_kebutuhan}
                    selectName={'Tingkat Kebutuhan'}
                    itemLabel={['name']}
                    handleSelectChange={(tingkat_kebutuhan) =>
                      setItems({ ...items, tingkat_kebutuhan })
                    }
                    required
                  />
                </div>

                <div className="mb-5 space-y-2">
                  <label className="font-semibold">Image</label>
                  <div className="bg-white p-2 rounded-md border border-gray-300">
                    <input
                      type="file"
                      id="img"
                      name="img"
                      accept="image/jpeg, image/png"
                      onChange={handleFileChange}
                      ref={fileInputRef}
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

export default CreateBarang
