import React, { useEffect, useState } from 'react'
import { Block } from 'framework7-react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/api'
import Back from '../component/Back'
import Layout from '../component/Layout'
import Swal from 'sweetalert2'
import Loader from '../component/Loader'
import ModalPO from '../component/modal/ModalPurchaseOrder'
import { DecryptID } from '../../helper/EncryptHelper'
import Transition from '../component/Transition'
import SelectPaginate from '../component/SelectPaginate'
import PriceFormat from '../../helper/PriceFormatHelper'
import ImagePreviewModal from '../component/modal/ImagePreviewModal'
import DateFormat from '../../helper/DateFormatHelper' // Import DateFormat helper

function CreatePurchaseOrderPR() {
    // State for the creation form
    const [items, setItems] = useState({
        purchase_request: null,
        tanggal: '',
        kode_suplier: '',
        kode: '',
        alamat: '',
        keterangan: '',
        cara_pembayaran: null,
        tanggal_penyerahan: '',
        is_ppn: 0,
    }) 
    const [details, setDetails] = useState([]); // Details for the new PO being created

    // State for displaying the source PR details
    const [prInfo, setPrInfo] = useState(null)

    const { id } = useParams()
    const [editIndex, setEditIndex] = useState(null);
    const [contentVisible, setContentVisible] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [disabled, setDisabled] = useState(false)
    const apiUrl = import.meta.env.VITE_URL
    const navigate = useNavigate()
    const [originalItems, setOriginalItems] = useState(null);
    const [originalDetails, setOriginalDetails] = useState([]);
    const [decryptedId, setDecryptedId] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false)

    // Image preview state
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');

     useEffect(() => {
        const decryptedIds = DecryptID(id)
            setDecryptedId(decryptedIds)
            if (!decryptedIds) {
                navigate(-1)
        }
    }, [id])

    useEffect(() => {
        if (decryptedId) {
            fetchPrDetails() // Fetch details of the source PR
        }
    }, [decryptedId])
    
    // Fetch details of the source Purchase Request to display them
    const fetchPrDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`purchaseOrder-listPurchaseRequest/detail/${decryptedId}`);
            const data = response.data.data;
            setPrInfo(data); // Set data for the informational display
        } catch (error) {
            console.error("Error fetching PR Details: ", error)
            Swal.fire({ icon:'error', title:'Gagal Memuat Detail PR', text: 'Data Purchase Request tidak dapat ditemukan.' });
        } finally { 
            setTimeout(() => {
                setLoading(false);
                setContentVisible(true);
            }, 50)
         }
    };

    // Fungsi untuk validasi input
    const validate = () => {
        const newErrors = {};
        if (!items.tanggal) newErrors.tanggal = 'Tanggal wajib diisi.';
        if (!items.kode_suplier) newErrors.kode_suplier = 'Kode Supplier wajib diisi.';
        if (!items.alamat) newErrors.alamat = 'Alamat wajib diisi.';
        if (!items.tanggal_penyerahan) newErrors.tanggal_penyerahan = 'Tanggal Penyerahan wajib diisi.';
        if (!items.keterangan) newErrors.keterangan = 'Keterangan wajib diisi.';
        if (details.length === 0) newErrors.details = 'Tambahkan minimal satu detail barang.';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            Swal.fire({ icon:'warning', title:'Form Tidak Lengkap', text:'Harap isi semua field yang wajib diisi.' });
            return;
        }

        try {
            if (isSubmitting) return; 
            setIsSubmitting(true);
            setDisabled(true);

            const payload = {
                tanggal: items.tanggal,
                kode_suplier: items.kode_suplier,
                alamat: items.alamat,
                tanggal_penyerahan: items.tanggal_penyerahan,
                keterangan: items.keterangan,
                cara_pembayaran: items.cara_pembayaran?.id,
                is_ppn: items.is_ppn,
                invent_barangs_id: details.map(d => d.selectedBarang?.id ),
                qty: details.map(d => d.qty ),
                harga_sub_total: details.map(d => d.harga_sub_total)
            };
            
            const res = await api.post(`purchaseOrder-create/${decryptedId}`, payload);

            Swal.fire({
                title:'Purchase Order berhasil dibuat!',
                icon:'success', 
                timer: 2000,
                showConfirmButton: false
            });
            navigate('/purchase-order-pr/list-purchase-order-pr');
            
        } catch (err) {
            Swal.fire({ 
                icon:'error',
                title:'Gagal Membuat Purchase Order',
                text: err?.response?.data?.msg || 'Kesalahan pada sistem'
            });
            console.log('Update error:', err?.response?.data || err);
        } finally {
            setIsSubmitting(false);
            setDisabled(false);
        }
    };
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setItems(prevItems => ({ ...prevItems, [name]: checked ? 1 : 0 }));
        } else {
            // Handle other inputs
            setItems(prevItems => ({ ...prevItems, [name]: value }));
        }
        if (errors[name]) {
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[name];
                return newErrors;
            });
        }
    };
    
    const handleSelectChange = (name, value) => {
        setItems(prevItems => ({ ...prevItems, [name]: value }));
         if (errors[name]) {
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const resetValue = () => {
        if (originalItems && originalDetails) {
            setItems(originalItems);
            setDetails(originalDetails);
        } else {
            setItems({
                purchase_request: null,
                tanggal: '',
                kode_suplier: '',
                kode: '',
                alamat: '',
                keterangan: '',
                cara_pembayaran: null,
                tanggal_penyerahan: '',
                is_ppn: 0 
            });
            setDetails([]);
        }
        setErrors({});
    }

    const handleClosePreview = () => {
        setIsPreviewOpen(false);
        setSelectedImageUrl('');
    };

    const handleImageClick = (imageUrl) => {
        setSelectedImageUrl(imageUrl);
        setIsPreviewOpen(true);
    };

    return (
    <Layout title={'Create Purchase Order'}>
        <Block>
            <div className='xs:px-0 md:px-4'>
                <Back goHome={() => navigate('/purchase-order-pr/list-purchase-order-pr')} />
                
                { loading && <Loader Class="mt-44"/> }
                    <Transition contentVisible={contentVisible}>
                    {/* --- MOVED INFORMATION DISPLAY FROM DetailPurchaseOrderPR.jsx --- */}
                    {prInfo && (
                        <div className='mb-8'>
                            <div className="flex items-center justify-between my-4">
                                <p className='lg:text-3xl text-2xl font-semibold capitalize'>Detail Purchase Request</p>
                                <p className={`flex py-2 px-3 items-center lg:text-[14px] xs:text-xs text-center gap-1 rounded-md font-medium ${prInfo.is_completed ? 'text-green-700 bg-green-100 border border-green-500' : 'text-amber-700 bg-amber-100 border border-amber-500'}`}>
                                    {prInfo.is_completed ? <><i className='bx bxs-check-circle lg/md:text-sm xs:text-lg pe-1'></i>Selesai</> : <><i className='bx bxs-time lg/md:text-sm xs:text-lg pe-1'></i>Belum selesai</> }</p>
                            </div>
                            
                            <div className="flex flex-col lg:flex-row gap-4 mt-3">
                                <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                                    <p className="font-semibold text-gray-400 mb-2 text-xl">Main Information</p>
                                    <p className="text-xl font-bold capitalize">{prInfo.kode}</p>
                                    <p className="text-lg mb-4">{DateFormat(prInfo.tanggal)}</p>
                                    <div className="text-right space-y-3">
                                        <div className="flex  justify-between">
                                            <p className='text-gray-500'>Note</p><p className='font-medium'>{prInfo.note}</p>
                                        </div>
                                        <div className="flex justify-between">
                                            <p className='text-gray-500'>Tgl. Dibuat</p><p className='font-medium'>{DateFormat(prInfo.created_at)}</p>
                                        </div>
                                        <div className="flex justify-between">
                                            <p className='text-gray-500'>Tgl. Diubah</p><p className='font-medium'>{DateFormat(prInfo.updated_at)}</p>
                                        </div>
                                    </div>
                                </div>
                                {prInfo.make_request &&
                                <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                                    <div className='flex justify-between items-center mb-2 gap-2'>
                                        <p className="text-xl text-gray-400 font-semibold">Material Request</p>
                                    </div>
                                    <p className="font-bold text-lg">{prInfo.make_request?.kode}</p>
                                    <p className="">{prInfo.make_request?.note}</p>
                                    <p className="mb-4">{prInfo.make_request?.tanggal}</p>
                                    <div className='space-y-3 text-right'>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Employee Name</span>
                                            <span className='font-medium'>{prInfo.make_request?.user?.EmpName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Employee Code</span>
                                            <span className='font-medium'>{prInfo.make_request?.user?.EmpCode}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Employee Email</span>
                                            <span className='font-medium'>{prInfo.make_request?.user?.email}</span>
                                        </div>
                                        <p className={`flex place-self-end w-fit py-2 px-3 items-center justify-center text-sm gap-1 rounded-md font-medium ${
                                            prInfo.make_request.is_full_approval 
                                            ? 'text-green-700 bg-green-100 border border-green-500' 
                                            : 'text-amber-700 bg-amber-100 border border-amber-500'
                                        }`}>
                                            <i className={`bx ${prInfo.make_request.is_full_approval ? 'bxs-check-circle' : 'bxs-time'}`}></i>
                                            <span>
                                            {prInfo.make_request.is_full_approval ? 'Approval sudah selesai' : 'Approval belum selesai'}
                                            </span>
                                        </p>
                                    </div>
                                </div> }
                            </div>
                            
                            {prInfo.details &&
                                <div className="bg-white border rounded-md p-6 mt-6">
                                <div className='flex justify-between items-center mb-4'>
                                    <p className="text-xl text-gray-400 font-semibold mb-2">Details</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="bg-gray-100">
                                        <th className="px-3 py-2 rounded-l-md">No</th>
                                        <th className="px-3 py-1">Barang</th>
                                        <th className="px-3 py-1 ">Req. Quantity</th>
                                        <th className="px-3 py-1">Used</th>
                                        <th className="px-3 py-1 rounded-r-md">Sisa</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {prInfo.details?.map((item, i) => (
                                        <tr key={item.id} className={` ${item.id % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                            <td className="px-4 py-4 rounded-l-md">{i + 1}</td>
                                            <td className="px-4 py-4 rounded-r-md">
                                            <div className='flex items-center gap-3'>
                                                <img src={`${apiUrl}${item.barang_detail?.image}`} alt="item image" className="max-w-[10rem] object-cover rounded shadow cursor-pointer"
                                                onClick={() => handleImageClick(`${apiUrl}${item.barangs?.image}`)}
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.barang_detail?.name}</p>
                                                    <p className="text-xs text-gray-500">{item.barang_detail?.kode_barang}</p>
                                                </div>
                                            </div>
                                            </td>
                                            <td className="px-4 py-4">{item.requested_qty}</td>
                                            <td className="px-4 py-4">{item.used_qty}</td>
                                            <td className="px-4 py-4 rounded-r-md">{item.sisa}</td>
                                        </tr>
                                        ))}
                                    </tbody>
                                    </table>
                                </div>
                                </div>
                            }
                        </div>
                    )}
                    {/* --- END OF MOVED SECTION --- */}

                    {/* --- ORIGINAL CREATE FORM --- */}
                    <p className='lg:text-3xl text-2xl font-semibold capitalize my-4 pt-4 border-t'>Create Purchase Order</p>
                    <div className="p-8 bg-white shadow-sm rounded-lg border">
                        <form onSubmit={handleSubmit} className='space-y-5'>
                            <div className="mb-4">
                                <div className="flex justify-between items-center">
                                    <label className='font-semibold'>Tanggal</label>
                                    {errors.tanggal && <span className="text-red-500 text-sm">{errors.tanggal}</span>}
                                </div>
                                <div className={`bg-white p-2 rounded-md border mt-2 ${errors.tanggal ? 'border-red-500' : 'border-gray-300'}`}>
                                <input 
                                    // --- PERUBAHAN DI SINI ---
                                    type={items.tanggal ? 'date' : 'text'} // Tipe dinamis
                                    onFocus={(e) => e.target.type = 'date'} // Ubah ke 'date' saat di-klik
                                    onBlur={(e) => { // Ubah kembali ke 'text' jika kosong
                                        if (!e.target.value) {
                                            e.target.type = 'text';
                                        }
                                    }}
                                    // --- AKHIR PERUBAHAN ---
                                    name="tanggal" 
                                    value={items.tanggal} 
                                    onChange={handleChange}
                                    className="w-full p-2 placeholder:text-gray-400"
                                    placeholder='Pilih Tanggal' // Placeholder untuk 'text'
                                />
                                </div>
                            </div>
                            <div className='mb-4'>
                                <div className="flex justify-between items-center">
                                    <label className='font-semibold'>Kode Supplier</label>
                                    {errors.kode_suplier && <span className="text-red-500 text-sm">{errors.kode_suplier}</span>}
                                </div>
                                <div className={`bg-white p-2 rounded-md border mt-2 ${errors.kode_suplier ? 'border-red-500' : 'border-gray-300'}`}>
                                <input 
                                    type="text" 
                                    name="kode_suplier" 
                                    value={items.kode_suplier} 
                                    onChange={handleChange}
                                    className="w-full p-2 placeholder:text-gray-400"
                                    maxLength={80}
                                    placeholder='Kode Supplier'
                                />
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="flex justify-between items-center">
                                    <label className='font-semibold'>Alamat</label>
                                    {errors.alamat && <span className="text-red-500 text-sm">{errors.alamat}</span>}
                                </div>
                                <div className={`bg-white p-2 rounded-md border mt-2 ${errors.alamat ? 'border-red-500' : 'border-gray-300'}`}>
                                <textarea
                                    name="alamat" 
                                    value={items.alamat} 
                                    onChange={handleChange}
                                    className="w-full min-h-fit p-2 placeholder:text-gray-400"
                                    maxLength={225}
                                    placeholder='Alamat'
                                    rows="3"
                                />
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="flex justify-between items-center">
                                    <label className='font-semibold'>Tanggal Penyerahan</label>
                                    {errors.tanggal_penyerahan && <span className="text-red-500 text-sm">{errors.tanggal_penyerahan}</span>}
                                </div>
                                <div className={`bg-white p-2 rounded-md border mt-2 ${errors.tanggal_penyerahan ? 'border-red-500' : 'border-gray-300'}`}>
                                <input 
                                    // --- PERUBAHAN DI SINI ---
                                    type={items.tanggal_penyerahan ? 'date' : 'text'} // Tipe dinamis
                                    onFocus={(e) => e.target.type = 'date'} // Ubah ke 'date' saat di-klik
                                    onBlur={(e) => { // Ubah kembali ke 'text' jika kosong
                                        if (!e.target.value) {
                                            e.target.type = 'text';
                                        }
                                    }}
                                    // --- AKHIR PERUBAHAN ---
                                    name="tanggal_penyerahan" 
                                    value={items.tanggal_penyerahan} 
                                    onChange={handleChange}
                                    className="w-full p-2 placeholder:text-gray-400"
                                    placeholder='Pilih Tanggal Penyerahan' // Placeholder untuk 'text'
                                />
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="flex justify-between items-center">
                                    <label className='font-semibold'>Keterangan</label>
                                    {errors.keterangan && <span className="text-red-500 text-sm">{errors.keterangan}</span>}
                                </div>
                                <div className={`bg-white p-2 rounded-md border mt-2 ${errors.keterangan ? 'border-red-500' : 'border-gray-300'}`}>
                                <textarea
                                    name="keterangan" 
                                    value={items.keterangan} 
                                    onChange={handleChange}
                                    className="w-full min-h-fit p-2 placeholder:text-gray-400"
                                    maxLength={225}
                                    placeholder='Keterangan'
                                    rows="3"
                                />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="mb-4">
                                    <div className="flex justify-between items-center">
                                        <label className='font-semibold'>Metode Pembayaran</label>
                                        {errors.cara_pembayaran && <span className="text-red-500 text-sm">{errors.cara_pembayaran}</span>}
                                    </div>
                                    <SelectPaginate 
                                        source={'paymentType'}
                                        selectValue={items.cara_pembayaran}
                                        selectName="Metode pembayaran"
                                        itemLabel={['payment']}
                                        handleSelectChange={(value) => handleSelectChange('cara_pembayaran', value)}
                                        className="w-full pt-2 placeholder:text-gray-400"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className='font-semibold'>PPN</label>
                                    <div className="bg-white p-2 rounded-md mt-2 flex items-center h-fit"> 
                                        <label htmlFor="is_ppn_checkbox" className="flex items-center cursor-pointer w-full">
                                            <input 
                                                type="checkbox" 
                                                id="is_ppn_checkbox"
                                                name="is_ppn" 
                                                checked={items.is_ppn == 1} // Cek jika value = 1
                                                onChange={handleChange}
                                                className="w-6 h-6 text-blue-600 bg-gray-100 border-gray-100 rounded focus:ring-blue-500"
                                            />
                                            <span className="ml-3 text-gray-700">Dikenakan PPN</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
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
                                    className="
                                    border border-gray-300 rounded-xl p-3
                                    grid grid-cols-[80px,1fr] md:grid-cols-[160px,1fr,80px,160px,64px]
                                    items-center gap-x-4
                                    "
                                >
                                <div className="overflow-hidden rounded-lg bg-gray-50 w-full aspect-[4/3]">
                                {item.selectedBarang?.image ? (
                                    <img
                                    src={`${apiUrl}${item.selectedBarang?.image}`}
                                    alt={item.selectedBarang?.name ?? 'barang'}
                                    className="w-full h-full object-cover"
                                    onClick={() => handleImageClick(`${apiUrl}${item.selectedBarang?.image}`)}                                
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                    No Image
                                    </div>
                                )}
                                </div>

                                <div className="flex flex-col items-start h-full md:contents">
                                    <div className="hidden md:block" />
                                    <div className="md:contents">
                                        <div className="md:text-right">
                                            <span className="text-sm text-gray-400 ">Qty: </span>
                                            {item.qty}
                                        </div>

                                        <div className="mt-1 md:mt-0 md:text-right">
                                            <span className="text-sm text-gray-400">Subtotal: </span>
                                            {PriceFormat(item.harga_sub_total)}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-2 w-full justify-end md:w-auto md:mt-0 md:justify-self-end md:border-l-2 md:pl-3">
                                        <button
                                            type="button"
                                            onClick={e => {
                                            e.preventDefault();
                                            setEditIndex(id);
                                            setOpenModal(true);
                                            }}
                                        >
                                            <i className="bx bx-edit text-xl text-cyan-600"></i>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={e => {
                                            e.preventDefault();
                                            const newDetails = details.filter((_, i) => i !== id);
                                            setDetails(newDetails);
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
                                <div className="flex mt-4">
                                    <button
                                        type="button"
                                        className="w-full rounded-lg py-2 px-4 flex items-center font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-color duration-200"
                                        onClick={() => {
                                            setOpenModal(!openModal);
                                            setEditIndex(null);
                                        }}>
                                        <i className='bx bx-plus mr-2 font-semibold text-base'></i>
                                        <span>{ details.length === 0 ? 'Tambah detail' : 'Tambah detail lain'}</span>
                                    </button>
                                </div>
                            <div className="flex flex-col items-center justify-self-center mt-10 max-w-full w-[25rem] space-y-2 text-center">
                                <button 
                                    disabled={isSubmitting} 
                                    type='submit' 
                                    className='py-2 px-4 w-full rounded-lg font-medium bg-blue-500 hover:bg-blue-600 transition-color duration-200 text-white disabled:bg-blue-200'
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                                <button className='py-2 px-4 w-full rounded-lg font-medium border border-red-200 bg-red-50 hover:bg-red-100 transition-color duration-200 text-red-600' onClick={resetValue} type='button'>Reset</button>
                            </div>
                        </form>
                    </div>
                </Transition>
                {
                    openModal && <ModalPO
                    apiUrl={apiUrl}
                    open={openModal}
                    onClose={() => {
                        setOpenModal(false);
                        setEditIndex(null);
                    }}
                    onSave={data => {
                        if (editIndex !== null) {
                            setDetails(details.map((item, idx) => idx === editIndex ? data : item));
                        } else {
                            setDetails([...details, data]);
                        }
                        if(errors.details) {
                             setErrors(prev => ({...prev, details: undefined}))
                        }
                        setOpenModal(false);
                        setEditIndex(null);
                    }}
                    initialData={editIndex !== null ? details[editIndex] : null}
                    // --- TAMBAHKAN DUA PROPS INI ---
                    prItems={prInfo?.details || []}
                    existingItems={details}
                    // ---------------------------------
                    />
                }
            </div>
        </Block>
        <ImagePreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        imageUrl={selectedImageUrl}
        />
    </Layout>
    )
}

export default CreatePurchaseOrderPR;
