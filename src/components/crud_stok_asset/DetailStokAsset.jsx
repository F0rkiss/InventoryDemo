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
// --- 1. IMPORT MODAL BARU ---
import ModalStokHistory from '../component/modal/ModalStokHistory'; // Sesuaikan path jika perlu

function AdminStokDetail() {
  const [item, setItem] = useState({});
  const isAsset = item.is_asset;
  const [histories, setHistories] = useState([]);
  
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const apiUrl = import.meta.env.VITE_URL;
  const [decryptedId, setDecryptedId] = useState('');

  // --- 2. TAMBAHKAN STATE UNTUK MODAL EDIT ---
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null); // Menyimpan data histori yang akan diedit


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
      fetchHistories()
    }
  }, [decryptedId])

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/inventStok-detail/admin/${decryptedId}`);
      const mainItem = response.data.data;
      setItem(mainItem);
    } catch (error) {
      console.error("Error fetching stock details:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setContentVisible(true), 50);
    }
  };

  const fetchHistories = async () => {
  try {
    const response = await api.get(`/inventStok-history/${decryptedId}`);
    setHistories(response.data.data.data || []);
  } catch (error) {
    console.error("Error fetching histories:", error);
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
  
  // --- 3. FUNGSI UNTUK REFRESH SETELAH MODAL TERSIMPAN/DIEDIT ---
  const handleHistoryActionSuccess = () => {
    setIsHistoryModalOpen(false);
    setSelectedHistory(null); 
    fetchHistories(); 
  };

  // --- 4. FUNGSI UNTUK MEMBUKA MODAL DALAM MODE CREATE ---
  const openCreateHistoryModal = () => {
    setSelectedHistory(null); 
    setIsHistoryModalOpen(true);
  };

  // --- 5. FUNGSI UNTUK MEMBUKA MODAL DALAM MODE EDIT ---
  const openEditHistoryModal = (history) => {
    setSelectedHistory(history); 
    setIsHistoryModalOpen(true);
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
            
            <div className="bg-white border rounded-md p-6 mt-6 min-h-[150px]">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold text-gray-400">Histories</h2>
                <button 
                  onClick={openCreateHistoryModal} // <-- Panggil fungsi baru untuk create
                  className="py-2 px-3 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 transition-color duration-200 text-white text-sm flex items-center w-fit gap-1"
                >
                  <i className='bx bx-plus font-semibold'></i>
                  Tambah Histori
                </button>
              </div>
              
              { histories.length === 0 ? (
                <p className="text-gray-400 italic">Belum ada histori penggunaan</p>
              ) : (
                <div className='overflow-x-auto'>
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3 rounded-l-md">Status</th>
                        <th className="p-3">User</th>
                        <th className="p-3">Note</th>
                        <th className="p-3">Lokasi</th>
                        <th className="p-3">Foto</th>
                        <th className="p-3">Tanggal</th>
                        <th className="p-3 rounded-r-md"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {histories.map((i, index) => (
                        <tr key={i.id} className={`${index % 2 !== 0 ? 'bg-gray-50' : 'bg-white'} align-top`}>
                          <td className="p-3 whitespace-pre-line">
                            <span className="font-medium">{i.status || 'N/A'}</span>
                          </td>
                          <td className="p-3 whitespace-pre-line">
                            { i.EmpName }
                          </td>
                          <td className="p-3 w-1/3 whitespace-pre-line">
                            {i.note || '-'}
                          </td>
                          <td className="p-3">{i.lokasi || '-'}</td>
                          <td className="p-3">
                            { i.image ?
                              (<img 
                                src={`${apiUrl}/${i.image}`} 
                                alt="history" 
                                className="min-w-32 max-w-36 h-32 object-cover rounded border cursor-pointer" 
                                onClick={() => handleImageClick(`${apiUrl}/${i.image}`)}
                              />)
                              :
                              (<p className="text-gray-400 italic">No Image</p>)
                            }
                          </td>
                          <td className="p-3 min-w-[18vh]">{DateFormat(i.updated_at)}</td>

                          <td className="p-3 rounded-r-md ">
                            <button
                              onClick={() => openEditHistoryModal(i)}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 md:px-1 px-2 rounded-md transition duration-200 text-lg"
                            >
                              <i className='bx bx-edit pt-1'></i>
                            </button>
                          </td>
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
      {decryptedId && (
        <ModalStokHistory
          open={isHistoryModalOpen}
          onClose={() => {
            setIsHistoryModalOpen(false);
            setSelectedHistory(null); // Pastikan reset saat ditutup secara manual
          }}
          stokId={decryptedId}
          historyData={selectedHistory} // Kirim data histori jika sedang mode edit
          onHistoryActionSuccess={handleHistoryActionSuccess}
        />
      )}
    </Layout>
  );
}

export default AdminStokDetail;