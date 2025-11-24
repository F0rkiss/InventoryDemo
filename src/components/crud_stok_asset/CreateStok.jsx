import React, { useState, useEffect } from 'react'
import api from '../../api/api'
import { useNavigate } from 'react-router-dom'
import Back from '../component/Back'
import { Block } from 'framework7-react'
import Layout from '../component/Layout'
import Swal from 'sweetalert2'
import Transition from '../component/Transition'
import SelectPaginate from '../component/SelectPaginateBarang' // Sesuaikan path jika perlu
import CustomCheckbox from '../component/CustomCheckBox'
import DatePicker from '../component/DatePicker'

function CreateStok() {
  const navigate = useNavigate()

  const API_IMG_URL = import.meta.env.VITE_URL;

  const [items, setItems] = useState({
    barang: null,
    qty: '',
    tanggal: '',
    note: '',
    is_access: false, // Default boolean false untuk checkbox
  })

  const [disabled, setDisabled] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setContentVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const goHome = () => navigate('/stok-asset/list-stok')

  const validate = () => {
    if (
      !items.barang ||
      !items.qty ||
      !items.tanggal ||
      !items.note 
      // !items.is_access dihapus dari validasi karena false (tidak dicentang) adalah nilai yang valid
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Data belum lengkap',
        text: 'Mohon lengkapi data barang, quantity, tanggal, dan note.',
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

      const barangId = items.barang.id || items.barang.value;

      await api.post('inventStok-create', {
        invent_barangs_id: barangId,
        qty: items.qty,
        tanggal_barang_masuk: items.tanggal,
        note: items.note,
        // Konversi boolean true/false ke format yang diinginkan API (biasanya 1/0 atau "1"/"0")
        is_access: items.is_access ? 1 : 0, 
      })

      Swal.fire({
        title: 'Barang baru berhasil dibuat!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
      navigate('/stok-asset/list-stok')
      resetValue()
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Tidak Dapat Membuat Stok Barang',
        text: 'Ada kesalahan dalam sistem',
      })
    } finally {
      setDisabled(false)
    }
  }

  const resetValue = () => {
    setItems({
      barang: null,
      qty: '',
      tanggal: '',
      note: '',
      is_access: false,
    })
  }

  return (
    <Layout title={'Create Stok'}>
      <Block>
        <div className="xs:px-0 md:px-4">
          <Back goHome={goHome} />
          <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Create Stok Barang</p>
          <Transition contentVisible={contentVisible}>
            <div className="p-8 bg-white shadow-sm rounded-lg border">
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* --- BARANG --- */}
                <div className="mb-5 space-y-2">
                  <label className="font-semibold">Barang</label>
                  <SelectPaginate
                    apiUrl={API_IMG_URL}
                    value={items.barang}
                    placeholder="Pilih barang untuk dijadikan stok"
                    onSelect={(selectedBarang) => setItems({ ...items, barang: selectedBarang })}
                  />
                  {!items.barang && disabled && (
                      <p className="text-red-500 text-xs mt-1">Barang wajib dipilih</p>
                  )}
                </div>

                {/* --- QUANTITY & TANGGAL (SEBELAHAN) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Quantity */}
                  <div className="space-y-2">
                    <label className="font-semibold">Quantity</label>
                    <div className="bg-white p-3 rounded-md border border-gray-300">
                      <input
                        type="number"
                        name="Quantity"
                        value={items.qty}
                        onChange={(e) => setItems({ ...items, qty: e.target.value })}
                        className="w-full focus:outline-none placeholder:text-gray-400"
                        placeholder="Jumlah"
                      />
                    </div>
                  </div>

                  {/* Tanggal */}
                  <div className="space-y-2">
                    <label className="font-semibold">Tanggal Barang Masuk</label>
                    <DatePicker
                    value={items.tanggal}
                    onChange={(val) => setItems({ ...items, tanggal: val })}
                    />
                  </div>
                </div>

                {/* --- NOTE (TEXTAREA DI BAWAH) --- */}
                <div className="space-y-2">
                  <label className="font-semibold">Note</label>
                  <div className="bg-white p-3 rounded-md border border-gray-300">
                    <textarea
                      rows="3"
                      name="note"
                      value={items.note}
                      onChange={(e) => setItems({ ...items, note: e.target.value })}
                      className="w-full focus:outline-none placeholder:text-gray-400 resize-none"
                      maxLength={255}
                      placeholder="Tambahkan catatan disini..."
                      required
                    />
                  </div>
                </div>
                
                {/* --- AKSES (CUSTOM CHECKBOX) --- */}
                <div className="mb-5 pt-2">
                    <CustomCheckbox 
                        label="Dapat Diakses (Public)"
                        checked={items.is_access}
                        onChange={(val) => setItems({ ...items, is_access: val })}
                    />
                    <p className="text-xs text-gray-400 mt-1 ml-9">
                        Centang jika stok ini boleh diakses oleh pengguna lain.
                    </p>
                </div>
                
                {/* --- BUTTONS --- */}
                <div className="flex flex-col items-center justify-self-center mt-10 max-w-full w-[25rem] space-y-2 text-center">
                  <button
                    disabled={disabled}
                    type="submit"
                    className="py-2 px-2 rounded-lg font-medium bg-blue-500/85 hover:bg-blue-500 transition-color duration-200 text-white disabled:bg-blue-200 w-full"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={resetValue}
                    className="py-2 px-2 rounded-lg font-medium border border-red-200 bg-red-50 hover:bg-red-100 transition-color duration-200 text-red-600 w-full"
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

export default CreateStok;