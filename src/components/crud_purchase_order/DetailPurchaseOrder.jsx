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
// --- DIHAPUS ---
// import PdfPreviewModal from '../component/modal/PdfPreviewModal'; 
import { isMobile, isMobileSafari } from '../../helper/DeviceHelper';

function DetailPurchaseOrder() {
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

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

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

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setSelectedImageUrl('');
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setIsPreviewOpen(true);
  };

  const handlePreview = async () => {
    if (isPreviewLoading) return;
    setIsPreviewLoading(true);
    try {
      const response = await api.get(`/pdf/preview_po/${decryptedId}`, {
          responseType: 'blob',
      });

      if (response.data.type === 'application/pdf') {
          const file = new Blob([response.data], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          
          // --- LOGIKA BARU UNTUK iOS ---
          if (isMobileSafari()) {
            // Untuk iOS Safari, buka di tab yang sama.
            // Ini adalah satu-satunya cara yang andal untuk blob URL.
            window.location.href = fileURL;
            // Kita tidak bisa revoke URL di sini karena navigasi baru saja dimulai
          } else {
            // Logika lama untuk browser lain (Chrome, Firefox, PC)
            const newWindow = window.open(fileURL, '_blank');

            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                Swal.fire({
                    icon: 'info',
                    title: 'Preview Gagal Dibuka',
                    text: 'Browser Anda mungkin memblokir tab baru. Memulai unduhan PDF...',
                    timer: 2500,
                    showConfirmButton: false
                });

                const link = document.createElement('a');
                link.href = fileURL;
                const fileName = item.kode ? `${item.kode}.pdf` : 'preview-po.pdf';
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                
                document.body.removeChild(link);
                URL.revokeObjectURL(fileURL);

            } else {
                setTimeout(() => {
                    URL.revokeObjectURL(fileURL);
                }, 1000 * 60); 
            }
          }
          // --- AKHIR LOGIKA BARU ---

      } else {
          const errText = await response.data.text();
          let errJson = {};
          try {
            errJson = JSON.parse(errText);
          } catch(e) {
            errJson = { message: 'Format respons tidak valid.' }
          }
          Swal.fire({
              icon: 'error',
              title: 'Gagal Membuat Preview',
              text: errJson.message || 'Format respons tidak valid.'
          });
      }
    } catch (error) {
      console.error("Error generating preview: ", error);
        Swal.fire({
            icon: 'error',
            title: 'Gagal Membuat Preview',
            text: error.message || 'Terjadi kesalahan pada server.'
        });
    } finally {
        setIsPreviewLoading(false);
    }
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
        <div className="xs:px-0 md:px-4">
          {/* Main Info & Detail */}
            <Transition contentVisible={contentVisible}>
            <Back goHome={() => navigate('/purchase-order/list-purchase-order')} />
            <div className="my-4">
                <p className='lg:text-3xl text-2xl font-semibold capitalize'>Detail Purchase Order</p>
                
                {/* Wrapper untuk status dan tombol preview */}
                <div className="flex items-center justify-between sm: gap-3 pt-4"> 
                  {/* Tombol Preview Baru */}
                  <button
                      type="button"
                      onClick={handlePreview}
                      disabled={isPreviewLoading}
                      className="flex items-center gap-2 py-2 px-3 w-fit rounded-md border border-slate-300 font-medium text-sm bg-white text-gray-700 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                      title="Preview PDF"
                  >
                      {/* Menggunakan icon boxicons */}
                      <i className={`bx ${isPreviewLoading ? 'bx-loader-alt bx-spin' : 'bx-file'}`}></i>
                      <span className="sm:inline">
                          {isPreviewLoading ? 'Loading...' : 'Preview'}
                      </span>
                  </button>
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
                {
                  item.can_be_deleted &&
                  <div className='flex lg:justify-end justify-center mt-5'>
                    <button onClick={() => cancelOrder()} className='bg-red-500 hover:bg-red-600 transition-color duration-200 max-w-xs py-2 rounded-lg text-white font-medium'>Delete Purchase Order</button>
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