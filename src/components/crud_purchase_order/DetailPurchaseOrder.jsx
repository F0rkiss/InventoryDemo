import React, { useEffect, useState } from 'react';
import Back from '../component/Back'
import { Page, Block } from 'framework7-react';
import api from '../../api/api';
import { replace, useNavigate, useParams } from 'react-router-dom';
import Layout from '../component/Layout';
import { DecryptID, encrypting } from '../../helper/EncryptHelper';
import Transition from '../component/Transition';
import DateFormat from '../../helper/DateFormatHelper'
import PriceFormat from '../../helper/PriceFormatHelper';
import { useAuth } from '../../auth/AuthContext';
import Swal from 'sweetalert2';
import ImagePreviewModal from '../component/modal/ImagePreviewModal';

function DetailPurchaseOrder() {
  const [item, setItem] = useState({})
  const detailPO = item.details || []
  const purchaseRequest = item.purchase_request;
  const detailPR = item.purchase_request?.details || [];
  const makeRequestPR = item.purchase_request?.make_request;
  const navigate = useNavigate();
  const { id } = useParams();
  const { role } = useAuth()
  const [decryptedId, setDecryptedId] = useState('')
  const [loading, setLoading] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  const apiUrl = import.meta.env.VITE_URL

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  
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

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setSelectedImageUrl('');
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setIsPreviewOpen(true);
  };

  const cancelOrder = async () => {
    try {
      const result = await Swal.fire({
        title: `Apakah Anda Yakin Ingin Menghapus Order Ini?`,
        icon: 'question',
        showDenyButton: true,
        confirmButtonText: 'Yes',
        denyButtonText: 'No',
        customClass: {
          actions: 'my-actions',
          confirmButton: 'order-2',
          denyButton: 'order-3',
        },
      });
      if (result.isConfirmed) {
        // console.log('Request cancelled:', id);
        const response = await api.delete(`/purchaseOrder-delete/${decryptedId}`);
        
        // Cek jika respons mengandung pesan error walau status 200
        if (response?.data?.status === 'error' || response?.data?.message?.toLowerCase().includes('tidak ditemukan')) {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus',
            text: response.data.message || 'Data tidak ditemukan'
          });
        } else {
          Swal.fire('Order Dihapus!', '', 'success');
          navigate('/purchase-order/list-purchase-order');
        }
      }
    } catch (error) {
      Swal.fire({
          icon:'error',
          title:'Tidak Dapat Menghapus Order',
          text:'Ada Kesalahan Dalam Sistem'
      })
    }
  }
  
  return (
    <Layout title={'Detail Purchase Order'}>
      <Block>
        <div className="px-4">
          {/* Main Info & Detail */}
            <Transition contentVisible={contentVisible}>
              <Back goHome={() => navigate('/purchase-order/list-purchase-order')} />
            <div className="flex items-center justify-between my-4">
              <p className='lg:text-3xl text-2xl font-semibold capitalize'>Detail Purchase Order</p>
              <p className={`flex py-2 px-3 items-center lg:text-[14px] xs:text-xs text-center gap-1 rounded-md font-medium ${item.is_completed ? 'text-green-700 bg-green-100 border border-green-500' : 'text-amber-700 bg-amber-100 border border-amber-500'}`}>
                {item.is_completed ? <><i className='bx bxs-check-circle lg/md:text-sm xs:text-lg pe-1'></i>Selesai</> : <><i className='bx bxs-time lg/md:text-sm xs:text-lg pe-1'></i>Belum selesai</> }</p>
            </div>
              <>
              <div className="flex flex-col lg:flex-row gap-4 mt-3">
                <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                  <p className="font-semibold text-gray-400 mb-2 text-xl">Main Information</p>
                  <p className="text-xl font-bold capitalize">{item.kode}</p>
                  <p className="text-lg mb-4">{PriceFormat(item.harga)}</p>
                  <div className="text-right space-y-3">
                    <div className="flex  justify-between">
                        <p className='text-gray-500'>Kode Supplier</p><p className='font-medium'>{item.kode_suplier}</p>
                    </div>
                    <div className="flex  justify-between">
                        <p className='text-gray-500'>Pembayaran</p><p className='font-medium'>{item.cara_pembayaran}</p>
                    </div>
                    <div className="flex space-x-10 justify-between">
                        <p className='text-gray-500'>Alamat</p><p className='font-medium'>{item.alamat}</p>
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
                              <td className="px-4 py-4 rounded-r-md">{PriceFormat(item.harga_sub_total)}</td>
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
                {
                  item.can_be_deleted &&
                  <div className='flex justify-end mt-5'>
                    <button onClick={() => cancelOrder()} className='bg-red-500 hover:bg-red-600 transition-color duration-200 max-w-xs py-2 rounded-lg text-white font-medium'>Delete Order</button>
                  </div>
                }
              </>
          </Transition>
        </div>
      </Block>
      <ImagePreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        imageUrl={selectedImageUrl}
      />
    </Layout>
  );

}

export default DetailPurchaseOrder;
