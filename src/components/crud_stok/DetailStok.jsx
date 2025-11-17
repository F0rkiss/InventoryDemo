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

function DetailStok() {
  const [item, setItem] = useState({}); // Initialize as null
  const isAsset = item.is_asset;
  const [mutasi, setMutasi] = useState([]);
  
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
      fetchMutasi()
    }
  }, [decryptedId])

  const fetchItems = async () => {
    try {
      setLoading(true);

      // --- Hanya fetch data stok utama ---
      const response = await api.get(`/inventStok-detail/${decryptedId}`);
      const mainItem = response.data.data;
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

  const fetchMutasi = async () => {
    try {
      const response = await api.get(`/inventStok-mutasi/${decryptedId}`);
      setMutasi(response.data.data.data || []);
    } catch (error) {
      console.error("Error fetching mutasi:", error);
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
          <Back goHome={() => navigate('/stok/list-stok')} />
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
                  
                  {/* Divider */}
                  <hr className="my-4"/>

                  <h3 className="font-semibold text-xl text-gray-400 -mb-2">Laporan Penerimaan Barang</h3>
                  
                  {/* Info Penerimaan Barang (LPB) */}
                  <div className="flex justify-between">
                    <p className="text-gray-500">Kode LPB</p>
                    <p className="font-medium">{item.kode_lpb || '-'}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-500">Penerima</p>
                    <p className="font-medium">{item.penerima_lpb || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white border rounded-md p-6 mt-6 min-h-[150px]">
              <h2 className="text-xl font-semibold text-gray-400 mb-3">Mutasi</h2>
              { mutasi.length === 0 ? (
                <p className="text-gray-400 italic">Belum ada mutasi.</p>
              ) : (
                <div className='overflow-x-auto'>
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3 rounded-l-md">Tanggal</th>
                        <th className="p-3">Stok Awal</th>
                        <th className="p-3">Perubahan</th>
                        <th className="p-3 rounded-r-md">Stok Akhir</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mutasi.map((m, index) => (
                        <tr key={m.id || index} className={`${index % 2 !== 0 ? 'bg-gray-50' : 'bg-white'} align-top`}>
                          <td className="p-3">{DateFormat(m.tanggal)}</td>
                          <td className="p-3">{m.stok_awal}</td>

                          <td className={`p-3 ${m.stok_awal <= m.stok_akhir ? 'text-green-600' : 'text-red-600'}`}>
                            {m.stok_awal <= m.stok_akhir ? (
                              <p>+{m.stok_change}</p>
                            ) : (
                              <p>-{m.stok_change}</p>
                            )}
                          </td>
                          <td className="p-3 rounded-r-md">{m.stok_akhir}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
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

export default DetailStok;