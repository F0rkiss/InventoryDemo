import React, { useEffect, useState } from 'react';
import Back from '../component/Back'
import { Page, Block } from 'framework7-react';
import api from '../../api/api';
import { replace, useNavigate, useParams } from 'react-router-dom';
import Layout from '../component/Layout';
import { DecryptID, encrypting } from '../../helper/EncryptHelper';
import Transition from '../component/Transition';
import DateFormat from '../../helper/DateFormatHelper'
import { useAuth } from '../../auth/AuthContext';
import Swal from 'sweetalert2';
import ImagePreviewModal from '../component/modal/ImagePreviewModal';

function DetailPurchaseOrderPR() {
  const [item, setItem] = useState({})
  const details = item.details || []
  const makeRequest = item.make_request;
  const navigate = useNavigate();
  const { id } = useParams();
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
      const response = await api.get(`purchaseOrder-listPurchaseRequest/detail/${decryptedId}`);
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
              <Back goHome={() => navigate('/purchase-order-pr/list-purchase-order-pr')} />
            <div className="flex items-center justify-between my-4">
              <p className='lg:text-3xl text-2xl font-semibold capitalize'>Detail Purchase Order PR</p>
              <p className={`flex py-2 px-3 items-center lg:text-[14px] xs:text-xs text-center gap-1 rounded-md font-medium ${item.is_completed ? 'text-green-700 bg-green-100 border border-green-500' : 'text-amber-700 bg-amber-100 border border-amber-500'}`}>
                {item.is_completed ? <><i className='bx bxs-check-circle lg/md:text-sm xs:text-lg pe-1'></i>Selesai</> : <><i className='bx bxs-time lg/md:text-sm xs:text-lg pe-1'></i>Belum selesai</> }</p>
            </div>
              <>
              <div className="flex flex-col lg:flex-row gap-4 mt-3">
                <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                  <p className="font-semibold text-gray-400 mb-2 text-xl">Main Information</p>
                  <p className="text-xl font-bold capitalize">{item.kode}</p>
                  <p className="text-lg mb-4">{DateFormat(item.tanggal)}</p>
                  <div className="text-right space-y-3">
                    <div className="flex  justify-between">
                        <p className='text-gray-500'>Note</p><p className='font-medium'>{item.note}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className='text-gray-500'>Tgl. Dibuat</p><p className='font-medium'>{DateFormat(item.created_at)}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className='text-gray-500'>Tgl. Diubah</p><p className='font-medium'>{DateFormat(item.updated_at)}</p>
                    </div>
                </div>
              </div>
              { makeRequest &&
                <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                  <div className='flex justify-between items-center mb-4'>
                    <p className="text-xl text-gray-400 font-semibold mb-2">Make Request</p>
                    <p className={`flex py-2 px-3 items-center text-center text-sm gap-1 rounded-md font-medium ${
                        makeRequest.is_full_approval 
                          ? 'text-green-700 bg-green-100 border border-green-500' 
                          : 'text-amber-700 bg-amber-100 border border-amber-500'
                    }`}>
                      <i className={`bx ${makeRequest.is_full_approval ? 'bxs-check-circle' : 'bxs-time'}`}></i>
                      <span>
                        {makeRequest.is_full_approval ? 'Approval sudah selesai' : 'Approval belum selesai'}
                      </span>
                    </p>
                  </div>
                  <p className="font-bold text-lg">{makeRequest?.kode}</p>
                  <p className="">{makeRequest?.note}</p>
                  <p className="mb-4">{makeRequest?.tanggal}</p>
                  <div className='space-y-3 text-right'>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Employee Name</span>
                      <span className='font-medium'>{makeRequest?.user?.EmpName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Employee Code</span>
                      <span className='font-medium'>{makeRequest?.user?.EmpCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Employee Email</span>
                      <span className='font-medium'>{makeRequest?.user?.email}</span>
                    </div>
                  </div>
                </div> }
              </div>

              {/* Purchase Request Section */}
              {
               details &&
                <div className="bg-white border rounded-md p-6 mt-6">
                  <div className='flex justify-between items-center mb-4'>
                    <p className="text-xl text-gray-400 font-semibold mb-2">Purchase Request</p>
                  </div>
                  { !details ?
                    (
                      <p className="text-gray-400 italic">No details data</p>
                    ) : (
                      <>
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
                              {details?.map((item, i) => (
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

export default DetailPurchaseOrderPR;
