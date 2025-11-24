import React, { useState, useEffect } from 'react'
import api from '../../api/api'
import { useNavigate, useParams } from 'react-router-dom'
import { Block } from 'framework7-react'
import Back from '../component/Back'
import Layout from '../component/Layout'
import { DecryptID } from '../../helper/EncryptHelper'
import Swal from 'sweetalert2'
import Transition from '../component/Transition'

function UpdateSupplier() {
  // 1. Tambahkan mobile_phone ke state awal
  const [items, setItems] = useState({
    nama_perusahaan: '',
    alamat: '',
    phone: '',
    mobile_phone: '', 
    pic: '',
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
      const response = await api.get(`suplier/${decryptedId}`)
      const data = response.data.data
      
      // 2. Mapping data dari backend (pastikan backend mengirim field mobile_phone)
      const fetched = {
        nama_perusahaan: data?.nama_perusahaan || '',
        alamat: data?.alamat || '',
        phone: data?.phone || '',
        mobile_phone: data?.mobile_phone || '', 
        pic: data?.PIC || '',
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

  // 3. Update logic pendeteksi perubahan data
  useEffect(() => {
    if (!originalItems) return
    const changed = items.nama_perusahaan !== originalItems.nama_perusahaan || 
                    items.alamat !== originalItems.alamat ||
                    items.phone !== originalItems.phone ||
                    items.mobile_phone !== originalItems.mobile_phone ||
                    items.pic !== originalItems.pic
    setIsUnchanged(!changed)
  }, [items, originalItems])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (disabled) return
      setDisabled(true)

      // 4. Validasi "Minimal Salah Satu Nomor Telepon"
      const isPhoneFilled = items.phone && items.phone.trim() !== '';
      const isMobileFilled = items.mobile_phone && items.mobile_phone.trim() !== '';

      if ( !items.nama_perusahaan || !items.alamat || (!isPhoneFilled && !isMobileFilled) ) {
        Swal.fire({
          icon: 'warning',
          title: 'Data belum lengkap',
          text: 'Nama Perusahaan, Alamat, dan minimal salah satu Nomor Telepon wajib diisi.',
        })
        setDisabled(false)
        return
      }

      await api.put(`suplier-update/${decryptedId}`, {
        nama_perusahaan: items.nama_perusahaan,
        alamat: items.alamat,
        phone: items.phone,
        mobile_phone: items.mobile_phone, // Kirim ke backend
        PIC: items.pic,
      })
      
      Swal.fire({
        title: 'Supplier berhasil diperbarui!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
      navigate('/supplier/list-supplier')
    } catch (error) {
      const responseData = err?.response?.data;
      let errorMessage = 'Ada Kesalahan Dalam Sistem'; // Pesan default

      if (responseData?.msg && typeof responseData.msg === 'object') {
        // 1. Ambil semua array error dari object msg (misal: telp, alamat, dll)
        const errorValues = Object.values(responseData.msg);
        
        // 2. Ratakan array (flat) dan gabungkan dengan baris baru jika ada banyak error
        const joinedErrors = errorValues.flat().join('\n');

        if (joinedErrors) {
          errorMessage = joinedErrors;
        }
      } 
      // Fallback jika backend mengirim error dalam format standar { message: "..." }
      else if (responseData?.message) {
        errorMessage = responseData.message;
      }

      Swal.fire({
        icon: 'error',
        title: 'Tidak Dapat Membuat Supplier',
        text: errorMessage,
        confirmButtonText: 'OK'
      });

      setError(responseData ?? err);
    } finally {
      setDisabled(false)
    }
  }

  const resetValue = () => {
    if (originalItems) setItems(originalItems)
    else setItems({ nama_perusahaan: '', alamat: '', phone: '', mobile_phone: '', pic: '' })
  }

  return (
    <Layout title={'Update Status'}>
      <Block>
        <div className="xs:px-0 md:px-4">
          <Back goHome={() => navigate('/supplier/list-supplier')} />
          <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Update Supplier</p>
          <Transition contentVisible={contentVisible}>
            <div className="p-8 bg-white shadow-sm rounded-lg border">
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Nama Perusahaan */}
                <div className="mb-5 space-y-2">
                  <label className="font-semibold">Nama Perusahaan <span className="text-red-500">*</span></label>
                  <div className="bg-white p-3 rounded-md border border-gray-300 mt-2">
                    <input
                      type="text"
                      name="name"
                      value={items.nama_perusahaan}
                      maxLength={50}
                      onChange={(e) => setItems({ ...items, nama_perusahaan: e.target.value })}
                      placeholder="Nama perusahaan supplier"
                      className="w-full p-2 placeholder:text-gray-400 placeholder:font-light capitalize"
                      required
                    />
                  </div>
                </div>

                {/* Alamat */}
                <div className="mb-4">
                  <label className="font-semibold">Alamat <span className="text-red-500">*</span></label>
                  <div className="bg-white p-3 rounded-md border border-gray-300 mt-2">
                    <input
                      type="text"
                      name="alamat"
                      value={items.alamat}
                      onChange={(e) => setItems({ ...items, alamat: e.target.value })}
                      className="w-full p-2 placeholder:text-gray-400 placeholder:font-light"
                      placeholder="Alamat perusahaan supplier"
                      required
                    />
                  </div>
                </div>

                 {/* 5. Layout Berdampingan (Flex) untuk Telepon & Mobile */}
                 <div className="flex flex-col md:flex-row gap-4 mb-4">
                  {/* Phone Kantor */}
                  <div className="flex-1">
                    <label className="font-semibold">Phone (Kantor)</label>
                    <div className="bg-white p-3 rounded-md border border-gray-300 mt-2">
                      <input
                        type="text"
                        name="phone"
                        value={items.phone}
                        onChange={(e) => setItems({ ...items, phone: e.target.value })}
                        className="w-full p-2 placeholder:text-gray-400  placeholder:font-light"
                        placeholder="Nomor telepon kantor"
                        // Hapus required HTML attribute
                      />
                    </div>
                  </div>

                  {/* Mobile Phone */}
                  <div className="flex-1">
                    <label className="font-semibold">Mobile Phone (HP)</label>
                    <div className="bg-white p-3 rounded-md border border-gray-300 mt-2">
                      <input
                        type="text"
                        name="mobile_phone"
                        value={items.mobile_phone}
                        onChange={(e) => setItems({ ...items, mobile_phone: e.target.value })}
                        className="w-full p-2 placeholder:text-gray-400 placeholder:font-light"
                        placeholder="Nomor handphone"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 -mt-3 italic">* Isi minimal salah satu nomor telepon di atas.</p>

                {/* PIC */}
                <div className="mb-4">
                  <label className="font-semibold">PIC</label>
                  <div className="bg-white p-3 rounded-md border border-gray-300 mt-2">
                    <input
                      type="text"
                      name="pic"
                      value={items.pic}
                      onChange={(e) => setItems({ ...items, pic: e.target.value })}
                      className="w-full p-2 placeholder:text-gray-400 placeholder:font-light"
                      placeholder="Penanggung perusahaan supplier"
                    />
                  </div>
                </div>
                {/* === Keterangan wajib diisi === */}
                <p className="ms-2 mt-4">
                    <span className="text-red-500">*</span> 
                    <span className="text-xs font-medium text-gray-700"> Wajib diisi</span>
                </p>
                <div className="flex flex-col items-center justify-self-center mt-10 max-w-full w-[25rem] space-y-2 text-center">
                  <button
                    disabled={disabled || isUnchanged}
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

export default UpdateSupplier