import React, { useEffect, useState, useRef } from 'react'
import { Page, Block } from 'framework7-react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/api'
import Back from '../component/Back'
import Layout from '../component/Layout'
import Swal from 'sweetalert2'
import ModalLPB from '../component/modal/ModalLPB'
import { DecryptID } from '../../helper/EncryptHelper'
import Transition from '../component/Transition'
import ImagePreviewModal from '../component/modal/ImagePreviewModal'
import CreateMultiUploadModal from '../component/modal/CreateMultiUploadModal'

function CreateLPB() {
    const [items, setItems] = useState({
        purchase_order: null,
        tanggal: '',
        penerima: '',
        note: '',
        image: null,
    }) 
    const { id } = useParams()
    const [details, setDetails] = useState([])
    const [editIndex, setEditIndex] = useState(null)
    const [contentVisible, setContentVisible] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [disabled, setDisabled] = useState(false)
    const apiUrl = import.meta.env.VITE_URL
    const navigate = useNavigate()
    const [originalItems, setOriginalItems] = useState(null)
    const [originalDetails, setOriginalDetails] = useState([])
    const [decryptedId, setDecryptedId] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState({})
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [selectedImageUrl, setSelectedImageUrl] = useState('')
    const [poMeta, setPoMeta] = useState({ totalSelectable: 0, totalDetails: 0 })
    const fileInputRef = useRef(null)
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

    useEffect(() => {
        const decryptedIds = DecryptID(id)
        setDecryptedId(decryptedIds)
        if (!decryptedIds) {
            navigate(-1)
        }
    }, [id])

    useEffect(() => {
        if (decryptedId) {
            fetchItem()
        }
    }, [decryptedId])

    // Fungsi validasi
        const validate = () => {
            const newErrors = {}
            if (!items.purchase_order) newErrors.purchase_order = 'Purchase Order wajib diisi.'
            if (!items.tanggal) newErrors.tanggal = 'Tanggal wajib diisi.'
            if (!items.penerima) newErrors.penerima = 'Penerima wajib diisi.'
            if (!items.note) newErrors.note = 'Keterangan wajib diisi.'
            if (details.length === 0) newErrors.details = 'Tambahkan minimal satu detail barang.'
        
            setErrors(newErrors)
            return Object.keys(newErrors).length === 0
        }
        

        const fetchItem = async () => {
            try {
            const response = await api.get(`laporanPenerimaanBarang-purchaseOrder/detail/${decryptedId}`)
            const data = response.data.data
            const fetchedItems = {
                purchase_order: data.kode || '',
                tanggal: '',
                penerima: '',
                note: '',
                image: [],
            }
            setItems(fetchedItems)
            setOriginalItems(fetchedItems)
            setOriginalDetails(data.details || [])
            } catch (error) {
            console.error('Fetch error:', error)
            } finally {
            setTimeout(() => setContentVisible(true), 50)
            }
        }
        

        const handleSubmit = async (e) => {
            e.preventDefault()
            if (!validate()) {
              Swal.fire({ icon: 'warning', title: 'Form Tidak Lengkap', text: 'Harap isi semua field yang wajib diisi.' })
              return
            }
            if (isSubmitting) return
          
            try {
              setIsSubmitting(true)
              setDisabled(true)
          
              const formData = new FormData()
              formData.append('tanggal', items.tanggal)
              formData.append('penerima', items.penerima)
              formData.append('note', items.note)
          
              items.image.forEach((file, index) => {
                formData.append(`bukti[${index}]`, file)
              })
          
              details.forEach((d, i) => {
                formData.append(`invent_barangs_id[${i}]`, d.barangs?.id || '')
                formData.append(`qty[${i}]`, d.qty || 0)
              })
          
              await api.post(`laporanPenerimaanBarang-create/${decryptedId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
              })
          
              Swal.fire({ title: 'Laporan Penerimaan Barang berhasil dibuat!', icon: 'success', timer: 2000, showConfirmButton: false })
              navigate('/lpb/list-create-lpb')
            } catch (err) {
              Swal.fire({ icon: 'error', title: 'Gagal Membuat Laporan', text: err?.response?.data?.msg || 'Kesalahan pada sistem' })
              console.error('Submit error:', err?.response?.data || err)
            } finally {
              setIsSubmitting(false)
              setDisabled(false)
            }
          }
          
        
        
        const handleChange = (e) => {
            const { name, value } = e.target
            if (name === 'purchase_order') return
            setItems(prevItems => ({ ...prevItems, [name]: value }))
            if (errors[name]) {
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors }
                delete newErrors[name]
                return newErrors
            })
            }
        }
        
        
        const resetValue = () => {
            Swal.fire({
              title: 'Reset data?',
              text: 'Semua perubahan akan dibatalkan.',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Ya, reset',
              cancelButtonText: 'Batal',
            }).then((result) => {
              if (result.isConfirmed) {
                if (originalItems && originalDetails) {
                  setItems({ ...originalItems, image: [] })
                  setDetails(originalDetails)
                } else {
                  setItems({ purchase_order: '', tanggal: '', penerima: '', note: '', image: [] })
                  setDetails([])
                }
                setErrors({})
              }
            })
          }
          

        const handleFileChange = (e) => {
            const files = Array.from(e.target.files || [])
            const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024)
            
                if (validFiles.length !== files.length) {
                Swal.fire({ icon: 'error', title: 'Beberapa file melebihi batas ukuran 5 MB' })
                }
            
                setItems(prev => ({ ...prev, bukti: validFiles }))
            }

            const handleUpload = (e) => {
                const newFiles = Array.from(e.target.files || [])
                const validFiles = newFiles.filter(file => file.size <= 5 * 1024 * 1024)
              
                if (validFiles.length !== newFiles.length) {
                  Swal.fire({ icon: 'error', title: 'Beberapa file melebihi batas ukuran 5 MB' })
                }
              
                setItems(prev => ({
                  ...prev,
                  image: [...prev.image, ...validFiles]
                }))
              }
              

        const handleImageClick = (imageUrl) => {
            setSelectedImageUrl(imageUrl)
            setIsPreviewOpen(true)
        }
        
        const handleClosePreview = () => {
            setIsPreviewOpen(false)
            setSelectedImageUrl('')
        }

        const handleDelete = (index) => {
            setItems(prev => ({
              ...prev,
              image: prev.image.filter((_, i) => i !== index)
            }))
          }

    return (
    <Layout title={'Create Purchase Order'}>
        <Block>
            <div className='px-4'>
                <Back goHome={() => navigate('/lpb/list-create-lpb')} />
                <p className='lg:text-3xl text-2xl font-semibold capitalize my-4'>Buat Laporan Penerimaan Barang</p>
                <Transition contentVisible={contentVisible}>
                    <div className="p-8 bg-white shadow-sm rounded-lg border">
                        <form onSubmit={handleSubmit} className='space-y-5'>
                            {/* Purchase Order */}
                            <div className="mb-5 space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className='font-semibold'>Purchase Order</label>
                                    {errors.purchase_order && <span className="text-red-500 text-sm">{errors.purchase_order}</span>}
                                </div>
                                <div className='bg-gray-200 p-2 rounded-md border border-gray-300'>
                                    <input 
                                        type="text" 
                                        name="purchase_order" 
                                        value={items.purchase_order || ''} 
                                        onChange={handleChange}
                                        className="w-full p-2 placeholder:text-gray-400"
                                        placeholder='Purchase Order'
                                        disabled
                                    />
                                </div>
                            </div>

                            {/* Penerima */}
                            <div className='mb-4'>
                                <div className="flex justify-between items-center">
                                    <label className='font-semibold'>Penerima</label>
                                    {errors.penerima && <span className="text-red-500 text-sm">{errors.penerima}</span>}
                                </div>
                                <div className={`bg-white p-2 rounded-md border mt-2 ${errors.penerima ? 'border-red-500' : 'border-gray-300'}`}>
                                    <input 
                                        type="text" 
                                        name="penerima" 
                                        value={items.penerima} 
                                        onChange={handleChange}
                                        className="w-full p-2 placeholder:text-gray-400"
                                        maxLength={80}
                                        placeholder='Sebutkan nama penerima'
                                    />
                                </div>
                            </div>

                            {/* Tanggal */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center">
                                    <label className='font-semibold'>Tanggal</label>
                                    {errors.tanggal && <span className="text-red-500 text-sm">{errors.tanggal}</span>}
                                </div>
                                <div className={`bg-white p-2 rounded-md border mt-2 ${errors.tanggal ? 'border-red-500' : 'border-gray-300'}`}>
                                    <input 
                                        type="date" 
                                        name="tanggal" 
                                        value={items.tanggal} 
                                        onChange={handleChange}
                                        className="w-full p-2 placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Note */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center">
                                    <label className='font-semibold'>Note</label>
                                    {errors.note && <span className="text-red-500 text-sm">{errors.note}</span>}
                                </div>
                                <div className={`bg-white p-2 rounded-md border mt-2 ${errors.note ? 'border-red-500' : 'border-gray-300'}`}>
                                    <textarea
                                        name="note" 
                                        value={items.note} 
                                        onChange={handleChange}
                                        className="w-full min-h-fit p-2 placeholder:text-gray-400"
                                        maxLength={225}
                                        placeholder='Note'
                                        rows="3"
                                    />
                                </div>
                            </div>

                            {/* Detail Items */}
                            <div className="mt-2 pt-3">
                                <div className="flex justify-between items-center">
                                    <p className='text-lg font-semibold'>Detail</p>
                                    {errors.details && <span className="text-red-500 text-sm">{errors.details}</span>}
                                </div>
                            </div>
                            <div className="space-y-3 my-3">
                                {details.map((item, id) => (
                                    <div
                                        key={id}
                                        className="border border-gray-300 rounded-xl p-3 grid grid-cols-[80px,1fr] md:grid-cols-[160px,1fr,80px,160px,64px] items-center gap-x-4"
                                    >
                                        <div className="overflow-hidden rounded-lg bg-gray-50 w-full aspect-[4/3]">
                                            {item.barangs?.image ? (
                                                <img
                                                    src={`${apiUrl}${item.barangs.image}`}
                                                    alt={item.barangs?.name ?? 'barang'}
                                                    className="w-full h-full object-cover"
                                                    onClick={() => handleImageClick(`${apiUrl}${item.barangs?.image}`)}                                
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                        

                                        <div className="flex flex-col items-start h-full md:contents">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-900 text-lg">
                                                    {item.barangs?.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {item.barangs?.kode_barang}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Gudang: {item.barangs?.kode_gudang}
                                                </p>
                                            </div>
                                            <div className="hidden md:block" />
                                            <div className="font-medium tabular-nums md:text-right">
                                                <span className="text-sm text-gray-400 ">Diterima: </span>
                                                {item.qty} {item.barangs?.satuan}
                                            </div>
                                            <div className="flex items-center gap-2 mt-2 w-full justify-end md:w-auto md:mt-0 md:justify-self-end md:border-l-2 md:pl-3">
                                                <button
                                                    type="button"
                                                    onClick={e => {
                                                        e.preventDefault()
                                                        setEditIndex(id)
                                                        setOpenModal(true)
                                                    }}
                                                >
                                                    <i className="bx bx-edit text-xl text-cyan-600"></i>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={e => {
                                                        e.preventDefault()
                                                        const newDetails = details.filter((_, i) => i !== id)
                                                        setDetails(newDetails)
                                                        if (newDetails.length > 0 && errors.details) {
                                                            setErrors(prev => ({...prev, details: undefined}))
                                                        }
                                                    }}
                                                >
                                                    <i className="bx bx-trash text-xl text-red-500"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Detail Button */}
                            <div className="flex mt-4">
                                <button
                                    type="button"
                                    className="w-full rounded-lg py-2 px-4 flex items-center font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={poMeta.totalSelectable > 0 && details.length >= poMeta.totalSelectable}
                                    onClick={() => {
                                        setOpenModal(!openModal)
                                        setEditIndex(null)
                                    }}>
                                    <i className='bx bx-plus mr-2 font-semibold text-base'></i>
                                    <span>{
                                        poMeta.totalSelectable > 0 && details.length >= poMeta.totalSelectable
                                            ? 'Semua Barang Sudah Ditambahkan'
                                            : (details.length === 0 ? 'Tambah detail penerimaan' : 'Edit detail penerimaan')
                                    }</span>
                                </button>
                            </div>

                            <div className="mb-5 space-y-3">
                                <label className="font-semibold">Bukti penerimaan</label>
                                {items.image?.length > 0 && (
                                    <div className="rounded-md border border-dashed border-gray-300 p-3">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full">
                                            {items.image.map((b, i) => {
                                                const src = b instanceof File ? URL.createObjectURL(b) : b
                                                return (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        className="relative rounded border overflow-hidden aspect-[4/3]"
                                                        onClick={() => handleImageClick(src)}
                                                    >
                                                        <img src={src} alt={`img-${i}`} className="w-full h-full object-cover" />
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                                <div className="flex">
                                    <button
                                        type="button"
                                        className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
                                        onClick={() => setIsUploadModalOpen(true)}
                                    >
                                        <i className="bx bx-image-add"></i>
                                        Kelola Gambar
                                    </button>
                                </div>
                            </div>
                            

                            {/* Submit + Reset */}
                            <div className="flex flex-col justify-center max-w-full w-[25rem] space-y-2 mx-auto">
                                <button 
                                    disabled={isSubmitting} 
                                    type='submit' 
                                    className='py-2 px-4 w-full rounded-lg font-medium bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300'
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                                <button 
                                    className='py-2 px-4 w-full rounded-lg font-medium border border-red-200 bg-red-50 hover:bg-red-100 text-red-600' 
                                    onClick={resetValue} 
                                    type='button'
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>
                </Transition>

                {/* Modal */}
                {openModal && (
                    <ModalLPB
                        apiUrl={apiUrl}
                        open={openModal}
                        purchaseOrderId={decryptedId}
                        existingItems={details}
                        initialData={editIndex !== null ? details[editIndex] : null}
                        onDetailsMetaChange={(meta) => setPoMeta(meta)}
                        onClose={() => {
                            setOpenModal(false)
                            setEditIndex(null)
                        }}
                        onSave={data => {
                            if (Array.isArray(data)) {
                                setDetails(data)
                            } else {
                                if (editIndex !== null) {
                                    setDetails(details.map((item, idx) => idx === editIndex ? data : item))
                                } else {
                                    setDetails([...details, data])
                                }
                            }
                            if(errors.details) {
                                setErrors(prev => ({...prev, details: undefined}))
                            }
                            setOpenModal(false)
                            setEditIndex(null)
                        }}
                    />
                )}
            </div>
        </Block>

        {/* Image Preview */}
        <ImagePreviewModal
            isOpen={isPreviewOpen}
            onClose={handleClosePreview}
            imageUrl={selectedImageUrl}
        />

        {/* Upload Modal */}
        <CreateMultiUploadModal
            open={isUploadModalOpen}
            initialFiles={items.image}
            onClose={() => setIsUploadModalOpen(false)}
            onSave={(files) => {
                setItems(prev => ({ ...prev, image: files }))
            }}
        />
    </Layout>
    )
}

export default CreateLPB

