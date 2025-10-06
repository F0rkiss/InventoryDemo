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

function DetailMakeRequestAdmin() {
  const [item, setItem] = useState({})
  const mainMR = item.makeRequest?.MR || {};
  const detailMR = item.makeRequest?.detailsMR || []
  const approvalSteps = item.approvalStepHistories || []
  const purchaseRequest = item.purchaseRequest?.PR;
  const purchaseDetails = item.purchaseRequest?.detailsPR || [];
  const purchaseOrders = item.purchaseOrder;
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
      const url = `/inventMakeRequest-admin/detail/${decryptedId}`;
      const response = await api.get(url);
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

//   const cancelRequest = async () => {
//     try {
//       const result = await Swal.fire({
//         title: `Apakah Anda Yakin Ingin Membatalkan Request Ini?`,
//         icon: 'question',
//         showDenyButton: true,
//         confirmButtonText: 'Yes',
//         denyButtonText: 'No',
//         customClass: {
//           actions: 'my-actions',
//           confirmButton: 'order-2',
//           denyButton: 'order-3',
//         },
//       });
//       if (result.isConfirmed) {
//         // console.log('Request cancelled:', id);
//         const response = await api.delete(`/inventMakeRequest-delete/${decryptedId}`);
        
//         // Cek jika respons mengandung pesan error walau status 200
//         if (response?.data?.status === 'error' || response?.data?.message?.toLowerCase().includes('tidak ditemukan')) {
//           Swal.fire({
//             icon: 'error',
//             title: 'Gagal Membatalkan',
//             text: response.data.message || 'Data tidak ditemukan'
//           });
//         } else {
//           Swal.fire('Request Dibatalkan!', '', 'success');
//           navigate('/make-request-admin/list-make-request-admin');
//         }
//       }
//     } catch (error) {
//       Swal.fire({
//           icon:'error',
//           title:'Tidak Dapat Membatalkan Request',
//           text:'Ada Kesalahan Dalam Sistem'
//       })
//     }
//   }
  
  return (
    <Layout title={'Detail Make Request'}>
      <Block>
        <div className="xs:px-0 md:px-4">
          {/* Main Info & Detail */}
            <Transition contentVisible={contentVisible}>
            <Back goHome={() => navigate('/make-request-admin/list-make-request-admin')} />
            <div className="flex items-center justify-between my-4">
                {/* <div className='flex items-center justify-between my-4'> */}
                <p className='lg:text-3xl text-2xl font-semibold capitalize'>Detail Make Request</p>
                  {
                    role === 'admin' ? 
                    (
                      <p className='rounded-md bg-gray-300 p-2 text-gray-700'>{item.is_full_approval}</p>
                    ) : (
                      <p className={`${item.can_be_deleted ? 'text-amber-700 bg-amber-100 border border-amber-500 py-2 px-3' : 'text-green-700 bg-green-100 border border-green-500 py-2 px-3'} rounded-md font-medium`}>{item.is_full_approval}</p>
                    )
                  }
                {/* </div> */}
            </div>
              <>
              <div className="flex flex-col lg:flex-row gap-4 mt-3">
                <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                  <p className="font-semibold text-gray-400 mb-2 text-xl">Main Information</p>
                  <p className="text-xl font-bold capitalize">{mainMR.kode}</p>
                  <p className="text-lg mb-4">{DateFormat(mainMR.tanggal, false)}</p>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Employee Name</span>
                      <span className='font-medium'>{mainMR.EmpName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Employee Code</span>
                      <span className='font-medium'>{mainMR.EmpCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Employee Email</span>
                      <span className='font-medium'>{mainMR.email}</span>
                    </div>
                    <div className='space-y-2 pt-3 border-t'>
                      <div className="flex justify-between ">
                        <span className="text-gray-500">Type Request</span>
                        <span className='font-medium'>{mainMR.type_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Jenis</span>
                        <span className='font-medium'>{mainMR.type_jenis}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tanggal dibuat</span>
                        <span className="text-right font-medium">{DateFormat(mainMR.created_at, true)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tanggal diubah</span>
                        <span className="text-right font-medium">{DateFormat(mainMR.updated_at, true)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                  <p className="font-semibold text-gray-400 mb-4 text-xl">Detail</p>
                  { detailMR.length === 0 ? (
                    <p className="text-gray-400 italic">No detail data</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-3 py-2 rounded-l-md">No</th>
                            <th className="px-3 py-1">
                              {mainMR?.is_stok === 1 ? 'Barang' : 'Note Barang'}</th>
                            <th className="px-3 py-1 rounded-r-md">Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailMR.map((d, i) => (
                            <tr key={d.id} className={` ${(i + 1) % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                              <td className="px-4 py-4 rounded-l-md">{i + 1}</td>
                              {/* { d.note_barang &&  */}
                                <td className="px-4 py-4">
                                  {Number(mainMR?.is_stok) === 1 ? (
                                      <div className="flex items-center gap-3">
                                        {d?.image && (
                                          <img
                                            src={`${apiUrl}${d?.image}`}
                                            alt={d?.nameBarang || 'barang'}
                                            className="md:max-w-[10rem] xs:max-w-[6rem] object-cover rounded shadow cursor-pointer"
                                            onClick={() => handleImageClick(`${apiUrl}${d?.image}`)}
                                          />
                                        )}
                                        <div className="min-w-0">
                                          <div className="font-medium truncate">
                                            {d?.nameBarang || '-'}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            Kode: {d?.kodeBarang || '-'}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            Gudang: {d?.kodeGudang || '-'}
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      // fallback non-stok: tetap note_barang
                                      d?.note_barang || '-'
                                    )}
                              </td>
                              {/* }        */}
                              <td className="px-4 py-4 rounded-r-md">{d.qty}</td>
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
                role === 'admin' && purchaseRequest &&
                <div className="bg-white border rounded-md p-6 mt-6">
                  <p className="text-xl text-gray-400 font-semibold mb-2">Purchase Request</p>
                  { !purchaseRequest ?
                    (
                      <p className="text-gray-400 italic">No purchase request data</p>
                    ) : (
                      <>
                        <p className="font-bold text-lg">{purchaseRequest?.kode}</p>
                        <p className="">{purchaseRequest?.note}</p>
                        <p className="mb-4">{purchaseRequest?.tanggal}</p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-3 py-2 rounded-l-md">No</th>
                                <th className="px-3 py-2">Name</th>
                                <th className="px-3 py-1">Kode Barang</th>
                                <th className="px-3 py-1">Kode Gudang</th>
                                <th className="px-3 py-1 rounded-r-md">Image</th>
                                <th className="px-3 py-1">Jenis</th>
                              </tr>
                            </thead>
                            <tbody>
                              {purchaseDetails?.map((item, i) => (
                                <tr key={item.id} className={` ${item.id % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                  <td className="px-4 py-4 rounded-l-md">{i + 1}</td>
                                  <td className="px-4 py-4">{item.name}</td>
                                  <td className="px-4 py-4">{item.kode_barang}</td>
                                  <td className="px-4 py-4 rounded-r-md">{item.kode_gudang}</td>
                                  <td className="px-4 py-4 rounded-r-md">
                                    <img src={`${apiUrl}${item.image}`} alt="item image" className="max-w-xs w-full rounded shadow" />
                                  </td>
                                  <td className="px-4 py-4 rounded-r-md">{item.is_asset ? 'Asset' : 'Non-Asset'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        { role === 'admin' && purchaseOrders &&
                          <div className="mt-6">
                            <p className="text-xl text-gray-400 font-semibold mb-2">Purchase Order</p>
        
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm text-left">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="px-3 py-2 rounded-l-md">Kode Supplier</th>
                                    <th className="px-3 py-1">Kode</th>
                                    <th className="px-3 py-1">Alamat</th>
                                    <th className="px-3 py-1">Harga</th>
                                    <th className="px-3 py-1">Pembayaran</th>
                                    <th className="px-3 py-1">Keterangan</th>
                                    <th className="px-3 py-1">Tgl. PO</th>
                                    <th className="px-3 py-1 rounded-r-md">Tgl. Penyerahan</th>
                                  </tr>
                                </thead>
                                <tbody>
                                    <tr className={` ${item.id % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                      <td className="px-4 py-4">{purchaseOrders.kode_suplier}</td>
                                      <td className="px-4 py-4">{purchaseOrders.kode}</td>
                                      <td className="px-4 py-1">{purchaseOrders.alamat}</td>
                                      <td className="px-4 py-1 rounded-r-md">{purchaseOrders.harga}</td>
                                      <td className="px-4 py-1 rounded-r-md">{purchaseOrders.cara_pembayaran}</td>
                                      <td className="px-4 py-1 rounded-r-md">{purchaseOrders.keterangan}</td>
                                      <td className="px-4 py-1 rounded-r-md">{purchaseOrders.tanggal_po}</td>
                                      <td className="px-4 py-1 rounded-r-md">{purchaseOrders.tanggal_penyerahan}</td>
                                    </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        }
                      </>
                    )
                  }
                </div>
              }

              {/* Approval Histories */}
              { approvalSteps.length !== 0  &&
                  <div className="bg-white border rounded-md p-6 mt-6 min-h-[150px]">
                    <h2 className="text-xl font-semibold text-gray-400 mb-3">Approval Step Histories</h2>
                    {approvalSteps.length === 0 ? (
                      <p className="text-gray-400 italic">No approval history</p>
                    ) : (
                      <div className='overflow-x-auto'> 
                        <table className="w-full text-sm text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="p-3  rounded-l-md">Approver Info.</th>
                              <th className="p-3 ">Notes</th>
                              <th className="p-3">Approval Step Number</th>
                              <th className="p-3">Approval Step Note</th>
                              <th className="p-3 rounded-r-md">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {approvalSteps.map((step, index) => (
                              <tr key={step.id} className={` ${step.id % 2 === 0 ? 'bg-gray-50' : 'bg-white'} align-top`}>
                                <td className="p-3 whitespace-pre-line rounded-l-md">
                                  <div>{step.approver_name}</div>
                                  <div className="mt-1">{step.approver_code || '-'}</div>
                                  <div className="mt-1">{step.approver_email || '-'}</div>
                                </td>
                                <td className="p-3 w-1/3 whitespace-pre-line">
                                  <div className="mt-1">{step.note || '-'}</div>
                                </td>
                                <td className="p-3">{step.approval_step_number}</td>
                                <td className="p-3">{step.approval_step_note}</td>
                                <td className='p-3 rounded-r-md'>
                                  <div className={`font-semibold ${step.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>{step.status}</div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
              }
              {/* {
                item.can_be_deleted &&
                <div className='flex justify-end mt-5'>
                  <button onClick={() => cancelRequest()} className='bg-red-500 hover:bg-red-600 transition-color duration-200 max-w-xs py-2 rounded-md text-white font-medium'>Cancel Request</button>
                </div>
              } */}
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

export default DetailMakeRequestAdmin;
