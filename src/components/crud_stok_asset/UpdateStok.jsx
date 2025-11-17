import React, { useEffect, useState } from 'react'
import api from '../../api/api' // Adjusted path as per your original file
import { useNavigate, useParams } from 'react-router-dom'
import { Block } from 'framework7-react'
import { DecryptID } from '../../helper/EncryptHelper' // From your original file
import Transition from '../../components/component/Transition' // Adjusted path
import Back from '../../components/component/Back' // Adjusted path
import Layout from '../../components/component/Layout' // Adjusted path
import Swal from 'sweetalert2'
import SelectPaginateBarang from '../../components/component/SelectPaginateBarang' // From CreateStok reference
import CustomCheckbox from '../../components/component/CustomCheckBox' // From CreateStok reference

function UpdateStokAsset() {
  const navigate = useNavigate()
  const { id } = useParams()
  const API_IMG_URL = import.meta.env.VITE_URL

  const [items, setItems] = useState({
    barang: null,
    qty: '',
    tanggal: '',
    note: '',
    is_access: false,
  })

  const [disabled, setDisabled] = useState(false)
  const [decryptedId, setDecryptedId] = useState('')
  const [contentVisible, setContentVisible] = useState(false)
  const [originalItems, setOriginalItems] = useState(null)
  const [isUnchanged, setIsUnchanged] = useState(true)

  const goHome = () => navigate('/stok-asset/list-stok')

  // 1. Decrypt ID from URL
  useEffect(() => {
    const decryptedIds = DecryptID(id)
    setDecryptedId(decryptedIds)
    if (!decryptedIds) navigate(-1) // Go back if ID is invalid
  }, [id, navigate])

  // 2. Fetch existing data when decryptedId is set
  useEffect(() => {
    if (decryptedId) fetchItems()
  }, [decryptedId])

  const fetchItems = async () => {
    try {
      // Assumed API endpoint for stok detail, based on your other files
      const res = await api.get(`inventStok-detail/admin/${decryptedId}`)
      const data = res.data.data

      const constructedBarang = {
        id: data.invent_barangs_id,    // Use invent_barangs_id from screenshot
        name: data.nama_barang,        // Use nama_barang from screenshot
        image: data.image,             // Use image from screenshot
        kode_barang: data.kode_barang, // Pass this along
        satuan: data.satuan || null    // Pass satuan or null if it doesn't exist
      };

      // Map fetched data to state
      const fetched = {
        barang: constructedBarang,     // Pass the new object we just built
        qty: data.qty,
        tanggal: data.tanggal_barang_masuk,
        note: data.note,
        is_access: !!data.is_access,
      }

      setItems(fetched)
      setOriginalItems(fetched) // Save original data for comparison
      setIsUnchanged(true)
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal memuat data',
        text: 'Data stok tidak ditemukan. Silakan coba lagi.',
      })
      goHome() // Go back to list if fetch fails
    } finally {
      setTimeout(() => setContentVisible(true), 50)
    }
  }

  // 3. Check for changes to enable/disable Update button
  useEffect(() => {
    if (!originalItems) return
    
    // Check if the selected barang ID is different
    const barangIdChanged = (items.barang?.id ?? null) !== (originalItems.barang?.id ?? null)

    const changed =
      barangIdChanged ||
      String(items.qty) !== String(originalItems.qty) || // Use string for safe comparison
      items.tanggal !== originalItems.tanggal ||
      items.note !== originalItems.note ||
      items.is_access !== originalItems.is_access

    setIsUnchanged(!changed)
  }, [items, originalItems])

  // 4. Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (disabled || isUnchanged) return
      setDisabled(true)

      // Validation
      if (!items.barang || !items.qty || !items.tanggal || !items.note) {
        Swal.fire({
          icon: 'warning',
          title: 'Data belum lengkap',
          text: 'Mohon lengkapi data barang, quantity, tanggal, dan note.',
        })
        setDisabled(false)
        return
      }

      const barangId = items.barang.id || items.barang.value;

      // Use PUT request for update
      await api.put(`inventStok-update/${decryptedId}`, {
        invent_barangs_id: barangId,
        qty: items.qty,
        tanggal_barang_masuk: items.tanggal,
        note: items.note,
        is_access: items.is_access ? 1 : 0, // Convert boolean to 1/0
      })

      Swal.fire({
        title: 'Berhasil diubah!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
      goHome()
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'Tidak Dapat Mengubah Stok Barang',
        text: 'Ada kesalahan dalam sistem',
      })
    } finally {
      setDisabled(false)
    }
  }

  // 5. Reset changes back to original fetched data
  const resetValue = () => {
    if (originalItems) setItems(originalItems)
  }

  return (
    <Layout title={'Update Stok'}>
      <Block>
        <div className="xs:px-0 md:px-4">
          <Back goHome={goHome} />
          <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Update Stok Barang</p>

          <Transition contentVisible={contentVisible}>
            <div className="p-8 bg-white shadow-sm rounded-lg border">
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* --- BARANG --- */}
                <div className="mb-5 space-y-2">
                  <label className="font-semibold">Barang</label>
                  <SelectPaginateBarang
                    apiUrl={API_IMG_URL}
                    value={items.barang} // Pass the full object
                    placeholder="Pilih barang untuk dijadikan stok"
                    onSelect={(selectedBarang) => setItems({ ...items, barang: selectedBarang })}
                    disabled={true}
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
                    <div className="bg-white p-2 rounded-md border border-gray-300">
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
                    <div className="bg-white p-2 rounded-md border border-gray-300">
                      <input
                        type="date"
                        name="tanggal"
                        value={items.tanggal}
                        onChange={(e) => setItems({ ...items, tanggal: e.target.value })}
                        className="w-full focus:outline-none placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* --- NOTE (TEXTAREA DI BAWAH) --- */}
                <div className="space-y-2">
                  <label className="font-semibold">Note</label>
                  <div className="bg-white p-2 rounded-md border border-gray-300">
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
                    disabled={disabled || isUnchanged} // Disable if no changes
                    type="submit"
                    className="py-2 px-2 rounded-lg font-medium bg-blue-500/85 hover:bg-blue-500 transition-color duration-200 text-white disabled:bg-blue-200 w-full"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={resetValue}
                    className="py-2 px-2 rounded-lg font-medium border border-red-200 bg-red-50 hover:bg-red-100 transition-color duration-200 text-red-600 w-full"
                  >
                    Reset Changes
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

export default UpdateStokAsset