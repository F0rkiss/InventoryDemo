import React, { useEffect, useState } from 'react';
import Back from '../component/Back';
import { Page, Block } from 'framework7-react';
import api from '../../api/api';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../component/Layout';
import { DecryptID } from '../../helper/EncryptHelper';
import Transition from '../component/Transition';
import ImagePreviewModal from '../component/modal/ImagePreviewModal';
import DateFormat from '../../helper/DateFormatHelper';

function AdminStokDetail() {
  const [item, setItem] = useState({}); // Initialize as null
  const isAsset = item.is_asset;

  // Mengambil data records (sekarang langsung berisi data history)
  // const types = item.type_data; // <-- DIHAPUS
  const records = item.records;
  
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const apiUrl = import.meta.env.VITE_URL;
  const [decryptedId, setDecryptedId] = useState('');


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

      // --- Hanya fetch data stok utama ---
      const response = await api.get(`/inventStok-detail/admin/${decryptedId}`);
      const mainItem = response.data.data;
      console.log(mainItem)
      setItem(mainItem);

      // --- Logika untuk fetch history dan mutasi telah dihapus ---

    } catch (error) {
      console.error("Error fetching stock details:", error);
      // Handle error appropriately, maybe navigate back or show a message
    } finally {
      setLoading(false);
      setTimeout(() => setContentVisible(true), 50);
    }
  };
    
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setSelectedImageUrl('');
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setIsPreviewOpen(true);
  };

  return (
    <Layout title={'Detail Stok Barang'}>
      <Block>
        <div className="xs:px-0 md:px-4">
          <Back goHome={() => navigate('/stok-asset/list-stok')} />
          <p className='lg:text-3xl text-2xl font-semibold capitalize my-4'>Detail Stok Barang</p>
          <Transition contentVisible={contentVisible}>
            <div className="w-full font-inter grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* KARTU 1: INFORMASI UTAMA BARANG & GAMBAR */}
              <div className="bg-white border rounded-lg p-6 flex flex-col">
                {/* --- Data Utama Barang --- */}
                <div>
                  <h2 className="font-bold capitalize text-2xl ">{item.nama_barang || 'Nama Barang'}</h2>
                  <p className="mb-4 text-base">
                    {/* Logika ini masih relevan untuk label Aset/Non Aset */}
                    {isAsset === 'ya' ? 'Aset' : isAsset === 'tidak' ? 'Non Aset' : 'Bangunan'}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Kode Barang</span>
                      <span className="font-medium">{item.kode_barang}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Satuan</span>
                      <span className="font-medium">{item.satuan}</span>
                    </div>
                  </div>
                </div>

                {/* --- Gambar Barang --- */}
                {item.image && (
                  <div className="mt-6">
                    <img
                      src={`${apiUrl}${item.image}`}
                      alt="item"
                      className="w-full max-w-md rounded-lg shadow-md mx-auto cursor-pointer hover:opacity-85 transition-opacity"
                      onClick={() => handleImageClick(`${apiUrl}${item.image}`)}
                    />
                  </div>
                )}
              </div>

              {/* KARTU 2: DETAIL STOK & INFO PENERIMAAN */}
              <div className="bg-white border rounded-lg p-6">
                <h2 className="font-semibold text-xl text-gray-400 mb-6">Detail Stok</h2>
                <div className="space-y-5 text-sm">

                  {/* Info Stok */}
                  <div className="flex justify-between">
                    <p className="text-gray-500">Quantity</p>
                    <p className="font-medium">{item?.qty}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-500">Tanggal Masuk</p>
                    <p className="font-medium">{DateFormat(item?.tanggal_barang_masuk)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-500">Catatan Stok</p>
                    <p className="font-medium text-right">{item?.note || '-'}</p>
                  </div>
                  
                </div>
              </div>
            </div>
            
            {/* Selalu tampilkan History jika records ada */}
            <div className="bg-white border rounded-md p-6 mt-6 min-h-[150px]">
              <h2 className="text-xl font-semibold text-gray-400 mb-3">Histories</h2>
              { !records || records.length === 0 ? (
                // Tampilan jika records kosong
                <p className="text-gray-400 italic">Belum ada histori penggunaan</p>
              ) : (
                // Tampilan jika records memiliki data
                <div className='overflow-x-auto'> 
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3 rounded-l-md">User ID.</th>
                        <th className="p-3">Note</th>
                        <th className="p-3">Lokasi</th>
                        <th className="p-3 rounded-r-md">Foto</th>
                        <th className="p-3 rounded-r-md">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((i, index) => (
                        <tr key={i.id} className={`${index % 2 !== 0 ? 'bg-gray-50' : 'bg-white'} align-top`}>
                          <td className="p-3 whitespace-pre-line rounded-l-md">
                            {i.user_id}
                          </td>
                          <td className="p-3 w-1/3 whitespace-pre-line">
                            {i.note || '-'}
                          </td>
                          <td className="p-3">{i.lokasi || '-'}</td>
                          <td className="p-3">
                            { i.image ?
                              (<img src={`${apiUrl}${i.image}`} alt="item" className="max-w-xs w-full rounded shadow" />)
                              :
                              (<p className="text-gray-400 italic">No Image</p>)
                            }
                          </td>
                          <td className="p-3 rounded-r-md">
                            {DateFormat(i.updated_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* --- Blok Mutasi Dihapus --- */}
            
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

export default AdminStokDetail;