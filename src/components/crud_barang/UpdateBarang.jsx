import React, { useState, useEffect, useRef } from 'react'
import api from '../../api/api'
import Back from '../component/Back'
import { useNavigate, useParams } from 'react-router-dom'
import Select from 'react-select'
import { Block } from 'framework7-react'
import SelectPaginate from '../component/SelectPaginate'
import { isAsset, findIsAssetOption } from '../../helper/FindOptions'
import Swal from 'sweetalert2'
import Layout from '../component/Layout'
import { DecryptID } from '../../helper/EncryptHelper'
import Transition from '../component/Transition'

function UpdateBarang() {
    const navigate = useNavigate()
    const [contentVisible, setContentVisible] = useState(false)
    const [decryptedId, setDecryptedId] = useState('')
    const [disabled, setDisabled] = useState(false)
    const [original, setOriginal] = useState(null)
    const [isUnchanged, setIsUnchanged] = useState(true)
    const [item, setItem] = useState({
        name: '',
        kode_gudang: '',
        satuan: '',
        image: null, // can be string (existing) or File (new)
        jenis_barang: null,
        categories: null,
        sumber_barang: null,
        tingkat_kebutuhan: null,
        is_asset: null,
    })
    const fileInputRef = useRef(null)
    const { id } = useParams()
    const apiUrl = import.meta.env.VITE_URL

    useEffect(() => {
        const dec = DecryptID(id)
        setDecryptedId(dec)
        if (!dec) navigate(-1)
    }, [id])

    useEffect(() => {
        if (decryptedId) fetchItem()
    }, [decryptedId])

    const fetchItem = async () => {
        try {
        const res = await api.get(`/inventBarang-detail/${decryptedId}`)
        const data = res.data.data
        const fetched = {
            name: data.name || '',
            kode_gudang: data.kode_gudang || '',
            satuan: data.satuan || '',
            image: data.image || null,
            jenis_barang: data.jenis_barang
            ? { value: data.jenis_barang.id, label: data.jenis_barang.name }
            : null,
            categories: data.category_barang
            ? { value: data.category_barang.id, label: data.category_barang.name }
            : null,
            sumber_barang: data.sumber_barang
            ? { value: data.sumber_barang.id, label: data.sumber_barang.name }
            : null,
            tingkat_kebutuhan: data.tingkat_kebutuhan
            ? { value: data.tingkat_kebutuhan.id, label: data.tingkat_kebutuhan.name }
            : null,
            is_asset: findIsAssetOption(data.is_asset),
        }
        setItem(fetched)
        setOriginal(fetched)
        setIsUnchanged(true)
        if (fileInputRef.current) fileInputRef.current.value = ''
        } catch (err) {
        Swal.fire({ icon: 'error', title: 'Gagal memuat data', text: 'Silakan coba lagi.' })
        } finally {
        setTimeout(() => setContentVisible(true), 50)
        }
    }

    // Enable Update only when something changed
    useEffect(() => {
        if (!original) return
        const changed =
        item.name !== original.name ||
        item.kode_gudang !== original.kode_gudang ||
        item.satuan !== original.satuan ||
        // image changed if File selected
        (item.image instanceof File ? true : item.image !== original.image) ||
        (item.jenis_barang?.value ?? null) !== (original.jenis_barang?.value ?? null) ||
        (item.categories?.value ?? null) !== (original.categories?.value ?? null) ||
        (item.sumber_barang?.value ?? null) !== (original.sumber_barang?.value ?? null) ||
        (item.tingkat_kebutuhan?.value ?? null) !== (original.tingkat_kebutuhan?.value ?? null) ||
        (item.is_asset?.value ?? null) !== (original.is_asset?.value ?? null)

        setIsUnchanged(!changed)
    }, [item, original])

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) {
        setItem({ ...item, image: null })
        return
        }
        if (file.size > 5 * 1024 * 1024) {
        setItem({ ...item, image: null })
        if (fileInputRef.current) fileInputRef.current.value = ''
        Swal.fire({ icon: 'error', title: 'File Melebihi Batas Ukuran 5 MB' })
        return
        }
        setItem({ ...item, image: file })
    }

    const validate = () => {
        if (
        !item.name ||
        !item.satuan ||
        !item.is_asset ||
        !item.jenis_barang ||
        !item.categories ||
        !item.sumber_barang ||
        !item.tingkat_kebutuhan
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
        fd.append('_method', 'PUT')
        fd.append('invent_jenis_barangs_id', item.jenis_barang?.value)
        fd.append('invent_sumber_barangs_id', item.sumber_barang?.value)
        fd.append('invent_tingkat_kebutuhans_id', item.tingkat_kebutuhan?.value)
        fd.append('invent_categories_id', item.categories?.value)
        fd.append('name', item.name)
        fd.append('is_asset', item.is_asset?.value)
        fd.append('satuan', item.satuan)
        if (item.kode_gudang) fd.append('kode_gudang', item.kode_gudang)
        if (item.image instanceof File) fd.append('image', item.image)

        await api.post(`/inventBarang-update/${decryptedId}`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })

        Swal.fire({
            title: 'Berhasil diubah!',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
        })
        navigate('/barang/list-barang')
        } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Tidak Dapat Mengupdate Barang',
            text: 'Ada Kesalahan Dalam Sistem',
        })
        } finally {
        setDisabled(false)
        }
    }

    const resetValue = () => {
        if (!original) return
        setItem(original)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <Layout title={'Update Barang'}>
        <Block>
            <div className="px-4">
            <Back goHome={() => navigate('/barang/list-barang')} />
            <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Update Barang</p>

            <Transition contentVisible={contentVisible}>
                <div className="p-8 bg-white shadow-sm rounded-lg border">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="mb-5 space-y-2">
                    <label className="font-semibold">Nama</label>
                    <div className="bg-white p-3 rounded-md border border-gray-300 mt-2">
                        <input
                        type="text"
                        name="name"
                        value={item.name}
                        onChange={(e) => setItem({ ...item, name: e.target.value })}
                        className="w-full p-3 placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                        maxLength={80}
                        placeholder="Masukkan nama barang"
                        required
                        />
                    </div>
                    </div>

                    {/* Kode & Gudang side-by-side on md+ */}
                    <div className="mb-5 space-y-2">
                        <label className="font-semibold">Kode Gudang (Opsional)</label>
                        <div className="bg-white p-3 rounded-md border border-gray-300 mt-2">
                        <input
                            type="text"
                            name="kode_gudang"
                            value={item.kode_gudang}
                            onChange={(e) => setItem({ ...item, kode_gudang: e.target.value })}
                            className="w-full p-2 placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                            maxLength={80}
                            placeholder="Masukkan kode gudang"
                            required
                        />
                        </div>
                    </div>

                    {/* Satuan & Asset side-by-side on md+ */}
                    <div className="mb-5 space-y-2">
                        <label className="font-semibold">Satuan</label>
                        <div className="bg-white p-3 rounded-md border border-gray-300 mt-2">
                        <input
                            type="text"
                            name="satuan"
                            value={item.satuan}
                            onChange={(e) => setItem({ ...item, satuan: e.target.value })}
                            className="w-full p-2 placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                            maxLength={80}
                            placeholder="Satuan"
                            required
                        />
                        </div>
                    </div>
                    <div className="space-y-2 xs:mt-3 md:mt-0">
                        <div className="grid">
                            <label className="font-semibold">Aset</label>
                            <label className="font-regular text-xs text-gray-500">
                                Pilih "Yes" jika barang tergolong aset, "No" barang bukan termasuk aset, "Other" jika barang tidak masuk di keduanya.
                            </label>
                        </div>
                        <Select
                        options={isAsset}
                        value={item.is_asset}
                        placeholder="Aset"
                        onChange={(is_asset) => setItem({ ...item, is_asset })}
                        required
                        />
                    </div>

                    <div className="mb-5 space-y-2">
                    <label className="font-semibold">Jenis Barang</label>
                    <SelectPaginate
                        source={'inventJenisBarang'}
                        selectValue={item.jenis_barang}
                        selectName={'Jenis Barang'}
                        itemLabel={['name']}
                        handleSelectChange={(jenis_barang) => setItem({ ...item, jenis_barang })}
                        required
                    />
                    </div>

                    <div className="mb-5 space-y-2">
                    <label className="font-semibold">Categories</label>
                    <SelectPaginate
                        source={'inventCategories'}
                        selectValue={item.categories}
                        selectName={'Category'}
                        itemLabel={['name']}
                        handleSelectChange={(categories) => setItem({ ...item, categories })}
                        required
                    />
                    </div>

                    <div className="mb-5 space-y-2">
                    <label className="font-semibold">Sumber Barang</label>
                    <SelectPaginate
                        source={'inventSumberBarang'}
                        selectValue={item.sumber_barang}
                        selectName={'Sumber Barang'}
                        itemLabel={['name']}
                        handleSelectChange={(sumber_barang) => setItem({ ...item, sumber_barang })}
                        required
                    />
                    </div>

                    <div className="mb-5 space-y-2">
                    <label className="font-semibold">Tingkat Kebutuhan</label>
                    <SelectPaginate
                        source={'tingkatKebutuhanBarang'}
                        selectValue={item.tingkat_kebutuhan}
                        selectName={'Tingkat Kebutuhan'}
                        itemLabel={['name']}
                        handleSelectChange={(tingkat_kebutuhan) =>
                        setItem({ ...item, tingkat_kebutuhan })
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

                    {/* Simple preview: show current image or selected file */}
                    <div className="mt-2">
                        {item.image instanceof File ? (
                        <img
                            src={URL.createObjectURL(item.image)}
                            alt="preview"
                            className="w-40 h-28 object-cover rounded border"
                        />
                        ) : item.image ? (
                        <img
                            src={`${apiUrl}${item.image}`}
                            alt="current"
                            className="w-40 h-28 object-cover rounded border"
                        />
                        ) : null}
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

export default UpdateBarang
