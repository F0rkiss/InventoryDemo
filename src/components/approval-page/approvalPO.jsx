import React, { useEffect, useState, useMemo } from 'react';
import { Block } from 'framework7-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import Layout from '../component/Layout';
import Back from '../component/Back';
import Transition from '../component/Transition';
import DateFormat from '../../helper/DateFormatHelper';
import { DecryptID } from '../../helper/EncryptHelper';
import { useAuth } from '../../auth/AuthContext';
import ImagePreviewModal from '../component/modal/ImagePreviewModal';
import Swal from 'sweetalert2';
import InfoRow from '../component/infoRow';
import ApprovalActions from '../component/ApprovalActions';
import PriceFormat from '../../helper/PriceFormatHelper';

function ApprovalPO() {
    const [item, setItem] = useState({})
    const detailPO = item.details || []
    const purchaseRequest = item.purchase_request;
    const suplier = item.suplier;
    const detailPR = item.purchase_request?.details || [];
    const makeRequestPR = item.purchase_request?.make_request;
    const navigate = useNavigate();
    const { id } = useParams();
    const { role } = useAuth()
    const [decryptedId, setDecryptedId] = useState('')
    const [loading, setLoading] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)
    const apiUrl = import.meta.env.VITE_URL
    const [actionLoading, setActionLoading] = useState(false);

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');
    const [message, setMessage] = useState('');

    // --- DIHAPUS ---
    // const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
    // const [selectedPdfUrl, setSelectedPdfUrl] = useState('');
    
    // const handleClosePdfPreview = () => {
    //   setIsPdfPreviewOpen(false);
    //   // Hapus blob URL dari memori saat modal ditutup
    //   if (selectedPdfUrl) {
    //     URL.revokeObjectURL(selectedPdfUrl);
    //   }
    //   setSelectedPdfUrl('');
    // };

    useEffect(() => {
        const decryptedId = DecryptID(id)
        setDecryptedId(decryptedId)
        if (!decryptedId) {
        navigate(-1)
        }
    }, [id]);
    
    useEffect(() => {
        if (decryptedId) {
        fetchItems()
        }
    }, [decryptedId])

    const fetchItems = async () => {
        try {
        setLoading(true);
        const response = await api.get(`purchaseOrder-detail/${decryptedId}`);
        const data = response.data.data;
        setItem(data);
        } catch (error) {
        
        } finally {
        setLoading(false); 
        setTimeout(() => setContentVisible(true), 50)
        }
    };

    const handleApprove = async (itemId, note = '') => {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin ingin menyetujui?',
            text: 'Tindakan ini akan menyetujui request.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Setujui',
            cancelButtonText: 'Batal',
        });
        if (!result.isConfirmed) return;

        setActionLoading(true);
        setMessage('');
        try {
            await api.post(`/purchaseOrder-approval/${itemId}`, {
                status: 'approved',
                note: note || '',
                tanggal: getToday(),
            });
            Swal.fire({ title: 'Berhasil di Approve!', icon: 'success', timer: 2000, showConfirmButton: false });
            setTimeout(() => navigate('/notifications'), 1200);
        } catch {
            Swal.fire({ title: 'Tidak berhasil di Approve!', icon: 'error', timer: 2000, showConfirmButton: false });
        } finally {
            setActionLoading(false);
        }
    };

    const handleDecline = async (itemId, note = '') => {
        setActionLoading(true);
        setMessage('');
        try {
            await api.post(`/purchaseOrder-approval/${itemId}`, {
                status: 'reject',
                note: note || '',
                tanggal: getToday(),
            });
            Swal.fire({ title: 'Berhasil di Reject!', icon: 'success', timer: 2000, showConfirmButton: false });
            setTimeout(() => navigate('/notifications'), 1200);
        } catch {
            Swal.fire({ title: 'Tidak berhasil di Tolak!', icon: 'error', timer: 2000, showConfirmButton: false });
        } finally {
            setActionLoading(false);
        }
    };


    const handleImageClick = (imageUrl) => {
        setSelectedImageUrl(imageUrl);
        setIsPreviewOpen(true);
    };

    const handleClosePreview = () => {
        setIsPreviewOpen(false);
        setSelectedImageUrl('');
    };

    const getToday = () => new Date().toISOString().split('T')[0];

    return (
        <Layout title="Detail Penerimaan Barang">
            <Block>
                <div className="px-4">
                    <Transition contentVisible={contentVisible}>
                        <Back goHome={() => navigate('/purchase-order/list-purchase-order')} />
                <div className="my-4">
                    <p className='lg:text-3xl text-2xl font-semibold capitalize'>Approval Purchase Order</p>
                    
                    {/* Wrapper untuk status dan tombol preview */}
                    <div className="flex items-center justify-between sm: gap-3 pt-4"> 
                    {/* Tombol Preview Baru */}
                    <p className={`flex py-2 px-3 items-center lg:text-[14px] xs:text-xs text-center gap-1 rounded-md font-medium ${item.is_completed ? 'text-green-700 bg-green-100 border border-green-500' : 'text-amber-700 bg-amber-100 border border-amber-500'}`}>
                    {item.is_completed ? <><i className='bx bxs-check-circle lg/md:text-sm xs:text-lg pe-1'></i>Selesai</> : <><i className='bx bxs-time lg/md:text-sm xs:text-lg pe-1'></i>Belum selesai</> }</p>

                    </div>
                    {/* --- Akhir Wrapper --- */}
                </div>
                <>
                <div className="flex flex-col lg:flex-row gap-4 mt-3">
                    <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                    <p className="font-semibold text-gray-400 mb-2 text-xl">Main Information</p>
                    <p className="text-xl font-bold capitalize">{item.kode}</p>
                    {/* CATATAN: Total harga ini (item.harga) diasumsikan dalam IDR (default).
                        Jika total harga ini seharusnya mencerminkan mata uang lain,
                        logikanya perlu diubah, karena PO ini bisa memiliki banyak mata uang.
                        Untuk saat ini, saya biarkan default ke IDR.
                    */}
                    {/* { item.is_ppn !== 0 ? (
                        <div className="flex gap-3 items-center mb-4">
                            <p className="text-lg font-semibold">
                            {PriceFormat(item.harga_after_ppn)}
                            </p>
                            <p className="text-md text-gray-500">
                            {PriceFormat(item.harga)}
                            </p>
                            <p className="text-amber-600 font-medium">PPN {item.nilai_ppn}%</p>
                        </div>
                        ) : 
                        (
                        <p className="text-lg font-medium mb-4">
                            {PriceFormat(item.harga)}
                        </p>
                        )
                    } */}
                    <div className="text-right space-y-3 pb-2">
                        <div className="flex justify-between">
                            {/* <p className='text-gray-500'>Supplier</p><p className='font-medium'>{item.suplier}</p> */}
                        </div>
                        <div className="flex justify-between">
                            <p className='text-gray-500'>Pembayaran</p><p className='font-medium'>{item.payment?.cara_pembayaran}</p>
                        </div>
                        <div className="flex space-x-5 justify-between">
                            <p className='text-gray-500'>Keterangan</p><p className='font-medium'>{item.keterangan}</p>
                        </div>
                        <div className="flex justify-between">
                            <p className='text-gray-500'>Tanggal</p><p className='font-medium'>{DateFormat(item.tanggal)}</p>
                        </div>
                        <div className="flex justify-between">
                            <p className='text-gray-500'>Tgl. Penyerahan</p><p className='font-medium'>{DateFormat(item.tanggal_penyerahan)}</p>
                        </div>
                    </div>
                    <div className="text-right space-y-3 border-t border-gray-300 pt-2">
                    <div className="flex justify-between">
                        <p className='text-gray-500'>Supplier</p><p className='font-medium'>{suplier?.nama_perusahaan}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className='text-gray-500'>Alamat</p><p className='font-medium'>{suplier?.alamat}</p>
                    </div>
                    <div className="flex space-x-10 justify-between">
                        <p className='text-gray-500'>Phone</p><p className='font-medium'>{suplier?.phone}</p>
                    </div>
                    <div className="flex space-x-5 justify-between">
                        <p className='text-gray-500'>PIC</p><p className='font-medium'>{suplier?.PIC || '-'}</p>
                    </div>
                    </div>
                </div>

                    <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                    <p className="font-semibold text-gray-400 mb-4 text-xl">Detail</p>
                    { detailPO.length === 0 ? (
                        <p className="text-gray-400 italic">No detail data</p>
                    ) : (
                        <div className='overflow-x-auto'>
                        <table className="w-full text-sm text-left">
                            <thead>
                            <tr className="bg-gray-100">
                                <th className="px-3 py-2 rounded-l-md">No</th>
                                <th className="px-3 py-1">Barang</th>
                                <th className="px-3 py-1">Quantity</th>
                                <th className="px-3 py-1 rounded-r-md">Harga</th>
                            </tr>
                            </thead>
                            <tbody>
                            {detailPO?.map((item, i) => (
                                <tr key={item.id} className={` ${item.id % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                <td className="px-4 py-4 rounded-l-md">{i + 1}</td>
                                <td className="px-4 py-4 rounded-r-md">
                                    <div className='flex items-center gap-3'>
                                    <img src={`${apiUrl}${item.barang_detail?.image}`} alt="item image" className="max-w-[10rem] object-cover rounded shadow cursor-pointer" 
                                        onClick={() => handleImageClick(`${apiUrl}${item.barang_detail?.image}`)}
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">{item.barang_detail?.name}</p>
                                        <p className="text-xs text-gray-500">{item.barang_detail?.kode_barang}</p>
                                    </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 rounded-r-md">{item.requested_qty}</td>
                                
                                {/* --- PERBAIKAN DI SINI --- */}
                                {/* Meneruskan kode mata uang (item.mata_uang?.kode) ke PriceFormat */}
                                <td className="px-4 py-4 rounded-r-md">{PriceFormat(item.harga_sub_total, item.mataUang?.kode)}</td>
                                {/* --- AKHIR PERBAIKAN --- */}

                                </tr>
                            ))}
                            </tbody>
                        </table>
                        </div>
                    )}
                    </div>
                </div>

                {/* Purchase Request Section */}
                {
                purchaseRequest &&
                    <div className="bg-white border rounded-md p-6 mt-6">
                    <div className='flex justify-between items-center mb-4'>
                        <p className="text-xl text-gray-400 font-semibold mb-2">Purchase Request</p>
                        <p className={`flex py-2 px-3 items-center lg:text-[14px] xs:text-xs text-center gap-1 rounded-md font-medium ${purchaseRequest.is_completed ? 'text-green-700 bg-green-100 border border-green-500' : 'text-amber-700 bg-amber-100 border border-amber-500'}`}>
                        {purchaseRequest.is_completed ? <><i className='bx bxs-check-circle lg/md:text-sm xs:text-lg pe-1'></i>Selesai</> : <><i className='bx bxs-time lg/md:text-sm xs:text-lg pe-1'></i>Belum selesai</> }</p>
                    </div>
                    { !purchaseRequest ?
                        (
                        <p className="text-gray-400 italic">No purchase request data</p>
                        ) : (
                        <>
                            <p className="font-bold text-lg">{purchaseRequest?.kode}</p>
                            <p className="">{purchaseRequest?.note}</p>
                            <p className="mb-4">{DateFormat(purchaseRequest?.tanggal)}</p>
                            <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-3 py-2 rounded-l-md">No</th>
                                    <th className="px-3 py-1">Barang</th>
                                    <th className="px-3 py-1 rounded-r-md">Quantity</th>
                                </tr>
                                </thead>
                                <tbody>
                                {detailPR?.map((item, i) => (
                                    <tr key={item.id} className={` ${item.id % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                    <td className="px-4 py-4 rounded-l-md">{i + 1}</td>
                                    <td className="px-4 py-4 rounded-r-md">
                                        <div className='flex items-center gap-3'>
                                        <img src={`${apiUrl}${item.barangs?.image}`} alt="item image" className="max-w-[10rem] object-cover rounded shadow cursor-pointer"
                                            onClick={() => handleImageClick(`${apiUrl}${item.barangs?.image}`)}
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900">{item.barangs?.name}</p>
                                            <p className="text-xs text-gray-500">{item.barangs?.kode_barang}</p>
                                        </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 rounded-r-md">{item.qty}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            </div>
                        </>
                        )
                    }
                    </div>
                }
                { makeRequestPR &&
                    <div className="bg-white border rounded-md p-6 mt-6">
                    <div className='flex justify-between items-center mb-4'>
                        <p className="text-xl text-gray-400 font-semibold mb-2">Make Request</p>
                        <p className={`flex py-2 px-3 items-center text-center text-sm gap-1 rounded-md font-medium ${
                            makeRequestPR.is_full_approval 
                            ? 'text-green-700 bg-green-100 border border-green-500' 
                            : 'text-amber-700 bg-amber-100 border border-amber-500'
                        }`}>
                        <i className={`bx ${makeRequestPR.is_full_approval ? 'bxs-check-circle' : 'bxs-time'}`}></i>
                        <span>
                            {makeRequestPR.is_full_approval ? 'Approval sudah selesai' : 'Approval belum selesai'}
                        </span>
                        </p>
                    </div>
                    <p className="font-bold text-lg">{makeRequestPR?.kode}</p>
                    <p className="">{makeRequestPR?.note}</p>
                    <p className="mb-4">{DateFormat(makeRequestPR?.tanggal)}</p>
                    <div className='space-y-2 text-right'>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Employee Name</span>
                            <span className='font-medium'>{makeRequestPR?.user?.EmpName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Employee Code</span>
                            <span className='font-medium'>{makeRequestPR?.user?.EmpCode}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Employee Email</span>
                            <span className='font-medium'>{makeRequestPR?.user?.email}</span>
                        </div>
                    </div>
                    </div> }
                    </>

                        <ApprovalActions
                            itemId={decryptedId}
                            onApprove={handleApprove}
                            onDecline={handleDecline}
                            approveText="Setujui Request"
                            declineText="Tolak Request"
                            showReasonInput
                            reasonRequired
                            className="max-w-2xl mx-auto mt-4"
                            disabled={actionLoading}
                        />
                    </Transition>
                </div>
            </Block>

            <ImagePreviewModal isOpen={isPreviewOpen} onClose={handleClosePreview} imageUrl={selectedImageUrl} />
        </Layout>
    );
}

export default ApprovalPO;
