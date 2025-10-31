import React, { useEffect, useState } from 'react';
import Back from '../component/Back'
import { Page, Block } from 'framework7-react';
import api from '../../api/api';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../component/Layout';
import { DecryptID } from '../../helper/EncryptHelper';
import Transition from '../component/Transition';
import ImagePreviewModal from '../component/modal/ImagePreviewModal';
import DateFormat from '../../helper/DateFormatHelper';
import { use } from 'react';

function DetailItem() {
  const [item, setItem] = useState({});
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const [decryptedId, setDecryptedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const isAsset = item.is_asset;
  const apiUrl = import.meta.env.VITE_URL;

  useEffect(() => {
    const decryptedId = DecryptID(id);
    setDecryptedId(decryptedId);
    if (!decryptedId) {
      navigate(-1);
    }
  }, [id]);

  useEffect(() => {
    if (decryptedId) {
      fetchItems();
    }
  }, [decryptedId]);

  const fetchItems = async () => {
    try {
      // Promise.all runs both requests in parallel
      const [itemResponse, historyResponse] = await Promise.all([
        api.get(`/inventBarang-detail/${decryptedId}`),
        api.get(`/inventHistory/${decryptedId}`)
      ]);
      setItem(itemResponse.data.data);
      setHistory(historyResponse.data.data.data);
    } catch (error) {
    } finally {
      setLoading(false); // Set loading to false once, after everything is done
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
    <Layout title={'Detail Barang'}>
      <Block>
        <div className="px-4">
          <Back goHome={() => navigate('/barang/list-barang')} />
          <p className='lg:text-3xl text-2xl font-semibold capitalize my-4'>Detail Barang</p>
          <Transition contentVisible={contentVisible}>
            <div className="w-full font-inter grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* KARTU 1: INFORMASI UTAMA & GAMBAR */}
              <div className="bg-white border rounded-lg p-6 flex flex-col">
                {/* --- Data Utama --- */}
                <div>
                  <h2 className="font-bold capitalize text-2xl ">{item.name}</h2>
                  <p className="mb-4 text-base">
                    {isAsset === 'ya' ? 'Aset' : isAsset === 'tidak' ? 'Non Aset' : 'Bangunan'}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Kode Barang</span>
                      <span className="font-medium">{item.kode_barang}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Kode Gudang</span>
                      <span className="font-medium">{item.kode_gudang}</span>
                    </div>
                  </div>
                </div>

                {/* --- Gambar --- */}
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


              {/* KARTU 2: DETAIL BARANG */}
              <div className="bg-white border rounded-lg p-6">
                <h2 className="font-semibold text-xl text-gray-400 mb-6">Detail</h2>
                <div className="space-y-5 text-sm">

                  {/* Satuan */}
                  <div className="flex justify-between items-center">
                    <p className="text-gray-500">Satuan</p>
                    <p className="font-medium">{item.satuan}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-gray-500">Tingkat Kebutuhan</p>
                    <p className="font-medium">{item.tingkat_kebutuhan?.name || '-'}</p>
                  </div>
                  {/* Kategori */}
                  <div className="flex justify-between">
                    <p className="text-gray-500">Kategori</p>
                    <div className="text-right">
                      <p className="font-medium">{item.category_barang?.name || '-'}</p>
                      <p className="text-gray-500 mt-1">{item.category_barang?.description || '-'}</p>
                    </div>
                  </div>

                  {/* Sumber Barang */}
                  <div className="flex justify-between">
                    <p className="text-gray-500">Sumber Barang</p>
                    <div className="text-right">
                      <p className="font-medium">{item.sumber_barang?.name || '-'}</p>
                      <p className="text-gray-500 mt-1">{item.sumber_barang?.description || '-'}</p>
                    </div>
                  </div>

                  {/* Jenis Barang */}
                  <div className="flex justify-between">
                    <p className="text-gray-500">Jenis Barang</p>
                    <div className="text-right">
                      <p className="font-medium">{item.jenis_barang?.name || '-'}</p>
                      <p className="text-gray-500 mt-1">{item.jenis_barang?.description || '-'}</p>
                    </div>
                  </div>

                  {/* Tingkat Kebutuhan */}

                </div>
              </div>
            </div>
            { isAsset !== 0 && Array.isArray(history) && (
              <div className="bg-white border rounded-md p-6 mt-6 min-h-[150px]">
                <h2 className="text-xl font-semibold text-gray-400 mb-3">History</h2>
                {history.length === 0 ? (
                  // Tampilan jika history adalah array kosong
                  <p className="text-gray-400 italic">No usage history</p>
                ) : (
                  // Tampilan jika history memiliki data
                  <div className='overflow-x-auto'> 
                    <table className="w-full text-sm text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 rounded-l-md">User Info.</th>
                          <th className="p-3">Notes</th>
                          <th className="p-3">Tgl. Stok</th>
                          <th className="p-3 rounded-r-md">Status</th>
                          <th className="p-3 rounded-r-md">Qty. Stok</th>
                          <th className="p-3 rounded-r-md">Lokasi</th>
                          <th className="p-3 rounded-r-md">Image</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((i, index) => (
                          // BUG FIX: Mengganti 'step.id' dengan 'index' untuk zebra-striping
                          <tr key={i.id} className={`${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} align-top`}>
                            <td className="p-3 whitespace-pre-line rounded-l-md">
                              <div>{i.namaPemilik}</div>
                              <div className="mt-1">{i.codePemilik || '-'}</div>
                              <div className="mt-1">{i.emailPemilik || '-'}</div>
                            </td>
                            <td className="p-3 w-1/3 whitespace-pre-line">
                              <div className="mt-1">{i.note || '-'}</div>
                            </td>
                            <td className="p-3">{DateFormat(i.tanggalStok)}</td>
                            <td className="p-3">{i.statusName}</td>
                            <td className="p-3">{i.qtyStok}</td>
                            <td className="p-3">{i.lokasi || '-'}</td>
                            <td className="p-3">
                              { i.image ?
                                (<img src={`${apiUrl}${i.image}`} alt="item image" className="max-w-xs w-full rounded shadow" />)
                                :
                                (<p className="text-gray-400 italic">No Image</p>)
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
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

export default DetailItem;
