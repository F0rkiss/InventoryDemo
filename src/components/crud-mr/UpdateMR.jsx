    import React, { useEffect, useState } from 'react'
    import { useParams , useNavigate, Navigate } from 'react-router-dom'
    import api from '../../api/api'
    import Layout from '../component/Layout'
    import { Block } from 'framework7-react'
    import Select, { components } from 'react-select'
    import Back from '../component/Back'
    import SelectPaginate from '../component/SelectPaginate'
    import UpdateMultiUpload from '../component/UpdateMultiUpload'
    import Swal from 'sweetalert2'
    import useAuth from '../../hooks/useAuth'
    import { DecryptID } from '../../helper/EncryptHelper'


    function UpdateAdmin() {

        const [items, setItems] = useState({
            jenis_permintaan : null,
            description : '',
            keperluan : '',
            bukti : [],
            barang : [],
        })
        // state roles untuk mengambil role berdasarkan detail MR 
        const [roles, setRoles] = useState('')
        const {role} = useAuth()
        const navigate = useNavigate()
        const [decryptId, setDecryptId] = useState('')
        const {id} = useParams()
        const [loading, setLoading] = useState(true)
        // state originalBarang untuk mengambil barang yang berdasarkan detail MR
        const [originalBarang, setOriginalBarang] = useState([])
        const [disabled, setDisabled] = useState(false)
        const [loadingIndex, setLoadingIndex] = useState(null);
        const [isUploaded, setIsUploaded] = useState([]);

        const baseURL = import.meta.env.VITE_URL

        const options = [
            {value : 'barang_baru', label : 'Barang Baru' },
            {value : 'perbaikan/upgrade', label : 'Perbaikan / Upgrade'}
        ]

        useEffect(() => {
            const decryptIds = DecryptID(id)
            setDecryptId(decryptIds)
            if (!decryptIds) {
                navigate(-1)
            }
        }, [id])

        useEffect(() => {
            const initialUploadStatus = items.bukti?.map(file => typeof file === 'string');
            setIsUploaded(initialUploadStatus);
        }, [items.bukti]);
        
        useEffect(() => {
            if (decryptId) {
                fetchItems()
            }
        }, [decryptId])
        
        useEffect(() => {
            if (role == 'admin' && (!loading && roles !== 'admin')) {
                navigate(`/make-request/update-make-request/${id}`, { replace: true });
            }
        }, [loading, roles, navigate, id])

        const fetchItems = async () => {
            try {
                const response = await api.get(role == 'admin' ? `makeRequest/detail/${decryptId}` : `makeRequest/show/${decryptId}`)
                const data = response.data.data
                const imageURL = data.bukti?.map((bukti) => `${baseURL}${bukti}`)
                setItems({
                    jenis_permintaan : {value : data.jenis_permintaan, label : data.jenis_permintaan.replace('_', ' ')},
                    description : data.description,
                    keperluan : data.keperluan,
                    barang : data.barangs.map((barang) => ({value : barang.id ,label : `${barang.asset_kode} - ${barang.unit_device}`})),
                    bukti : data.bukti == null ? null : imageURL
                })  
                if (data.status !== 'pending') {
                    navigate(-1 )
                }
                setOriginalBarang(data.barangs.map((barang) => barang.id))
                setRoles(data.user.role)
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error Dalam Sistem'
                })
            } finally {
                setLoading(false)
            }
        }

        const handleSubmit = async (e) => {
            e.preventDefault()
            try {
                if (disabled) {
                    return
                }
                setDisabled(true)
                const stringFiles = items.bukti?.filter(file => typeof(file) === 'string' || file instanceof String); 
                if (items.jenis_permintaan.value == "perbaikan/upgrade" && stringFiles.length < 1) {
                    await Swal.fire({
                        icon: 'error',
                        title: 'ERROR',
                        text: 'Bukti Wajib Diupload Jika Jenis Permintaan Perbaikan / Upgrade',
                        confirmButtonColor: '#EF4444    ',
                    })
                    return
                }    
                const formdata = new FormData
                formdata.append('jenis_permintaan', items.jenis_permintaan?.value)
                formdata.append('description', items.description)
                formdata.append('keperluan', items.keperluan)
                if (items.jenis_permintaan.value != 'barang_baru'){
                    items.barang.forEach((barangs) => {
                        formdata.append('barang_ids[]', barangs.value)
                    })
                }
                formdata.append('_method', 'PUT')
                await api.post(role === 'admin' ? `makeRequest/admin/update/${decryptId}` : `makeRequest/update/user/${decryptId}`, formdata ,{
                    headers : {
                        'Content-Type' : 'multipart/form-data'
                    }
                })
                navigate(-1)
                } catch (error) {
                    Swal.fire({
                        icon:'error',
                        title:'Tidak Dapat Mengupdate MR',
                        text:'Ada Kesalahan Dalam Sistem'
                    })
                } finally {
                    setDisabled(false)
                }
        }

        
        const handleFileSelection = (e) => {
            const files = e.target.files;
            const fileArray = Array.from(files);

            // Simpan file dan preview ke state
            setItems((prevItems) => ({
            ...prevItems,
            bukti: (prevItems.bukti || []).concat(fileArray),
            }));
        };

        const handleUpload = async (index) => {
            try {
                setLoadingIndex(index);
                const formdata = new FormData();
                formdata.append('bukti', items.bukti[index]);

                const response = await api.post(`makeRequest/uploadBukti/${decryptId}`, formdata, {
                    headers: {
                    'Content-Type': 'multipart/form-data',
                    },
                });
                const gambar = response.data.img;
                setIsUploaded((prev) => prev.map((status, i) => (i === index ? true : status)));
                setItems((prevItems) => ({
                    ...prevItems,
                    bukti: prevItems.bukti.map((item, i) => (i === index ? `${baseURL}${gambar}` : item)),
                }));
            } catch (error) {
                if (error.response.data.statusCode == 422) {
                    Swal.fire({
                    icon: 'error',
                    title: 'Tidak Boleh Lebih Dari 5MB Total Semua Foto Bukti'
                    })
                    setItems((prevItems) => ({...prevItems, bukti : prevItems.bukti.slice(0, -1)}))
                }
            } finally {
            setLoadingIndex(null);
            }
        };

        const handleDelete = async (index) => {
            try {
                const result = await Swal.fire({
                    title: 'Apakah Anda Yakin Untuk Menghapus Gambar Ini',
                    icon: 'info',
                    showDenyButton: true,
                    confirmButtonText: 'Ya',
                    denyButtonText: 'Tidak',
                    customClass: {
                    actions: 'my-actions',
                    confirmButton: 'order-2',
                    denyButton: 'order-3',
                    },
                });
            if (result.isConfirmed) {
                const paths = items.bukti[index].split('bukti/').pop(); // assuming the slice path is correct
                await api.delete(`makeRequest/${decryptId}/delete-bukti/${paths}`);
                await Swal.fire('Terhapus', ' ', 'success');
                setItems((prevItems) => ({
                ...prevItems,
                bukti: prevItems.bukti.filter((_, i) => i !== index),
                }));
            }
            } catch (error) {
                Swal.fire({
                    icon:'error',
                    title:'Tidak Dapat Menghapus Gambar',
                    text:'Ada Kesalahan Dalam Sistem'
                })
            }
        };


        

    return (
        <Layout title={'Update MR Admin'}>
            <Block>
                <Back goHome={() => navigate(-1)}/>
                <div className="bg-white shadow-sm rounded-md p-3 mt-3">
                    <form onSubmit={handleSubmit}>
                        <div className="jenis-permintaan mb-3">
                            <label htmlFor="jenis">Jenis Permintaan</label>
                            <Select
                            id='jenis'
                            options={options}
                            onChange={jenis_permintaan => setItems({...items, jenis_permintaan})}
                            value={items.jenis_permintaan}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="keperluan">Keperluan</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border  font-light font-inter'>
                                <input 
                                type="text"
                                id='keperluan'  
                                name='keperluan'
                                value={items.keperluan}
                                onChange={e => setItems({ ...items, keperluan: e.target.value })}
                                className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"                            
                                placeholder='Keperluan'
                                required
                                />
                          </div>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="deskripsi">Deskripsi</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border  font-light font-inter'>
                                    <input 
                                    type="text"
                                    id='deskripsi'  
                                    name='deskripsi'
                                    value={items.description}
                                    onChange={e => setItems({ ...items, description: e.target.value })}
                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"                            
                                    placeholder='Deskripsi'
                                    required
                                    />
                            </div>
                        </div>
                        {
                        items.jenis_permintaan?.value !== 'barang_baru' && (
                        <>
                            <div className="mb-3">
                                <label htmlFor='barang'>Barang</label>
                                <SelectPaginate
                                required={true}
                                source={role == 'admin' ? `selectBarangForUpdateAdmin/${decryptId}` : `selectBarangForUpdateUser/${decryptId}`}
                                itemLabel={['asset_kode','unit_device']}
                                selectName={'Barang'}
                                handleSelectChange={barang => setItems({...items, barang})}
                                selectValue={items.barang}
                                isMulti={true}
                                id='barang'
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor='barang'>Bukti</label>
                                <UpdateMultiUpload
                                    items={items}
                                    handleDelete={handleDelete}
                                    handleUpload={handleUpload}
                                    handleFileSelection={handleFileSelection}
                                    loadingIndex={loadingIndex}
                                    required={items.jenis_permintaan == 'perbaikan/upgrade'}
                                />
                            </div>
                        </>
                        )}
                        <div className="tombol mt-6">
                            <button disabled={disabled} type='submit' className='bg-teal-400 text-white py-3 rounded-md'>Submit</button>
                        </div>
                    </form>
                </div>
            </Block>
        </Layout>
    )
    }

    export default UpdateAdmin