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

function DetailStok() {
  const [item, setItem] = useState(null); // Initialize as null
  const [history, setHistory] = useState([]);
  const [mutasi, setMutasi] = useState({});
  
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const apiUrl = import.meta.env.VITE_URL;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const decryptedId = DecryptID(id);
        if (!decryptedId) {
          navigate(-1);
          return;
        }

        // --- STEP 1: Fetch the main stock item ---
        const itemResponse = await api.get(`/inventStok-detail/${decryptedId}`);
        const mainItem = itemResponse.data.data;
        setItem(mainItem);

        // --- STEP 2: Use data from Step 1 to fetch related history and mutasi ---
        if (mainItem && mainItem.barang) {
          const isAsset = mainItem.barang.is_asset;

          if (isAsset === 1) {
            // It's an ASSET, so fetch its HISTORY
            const historyResponse = await api.get(`/inventHistory/${mainItem.barang.id}`);
            setHistory(historyResponse.data.data.data);
          } else {
            // It's NON-ASSET, so fetch its MUTASI (stock movement)
            const mutasiResponse = await api.get(`/inventMutasi-detail/${decryptedId}`);
            setMutasi(mutasiResponse.data.data);
            console.log("Mutasi Response:", mutasi); // Debug log
          }
        }
      } catch (error) {
        console.error("Error fetching stock details:", error);
        // Handle error appropriately, maybe navigate back or show a message
      } finally {
        setLoading(false);
        setTimeout(() => setContentVisible(true), 50);
      }
    };

    fetchAllData();
  }, [id, navigate]); // Dependency array

  const lpb = item?.laporan_penerimaan_barang;
  const barang = item?.barang;
  const isAsset = barang?.is_asset;

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
            {/* MOBILE: img on top, all info below */}
            <div className="w-full font-inter grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* KARTU 1: INFORMASI UTAMA BARANG & GAMBAR */}
              <div className="bg-white border rounded-lg p-6 flex flex-col">
                {/* --- Data Utama Barang --- */}
                <div>
                  <h2 className="font-bold capitalize text-2xl ">{barang?.name || 'Nama Barang'}</h2>
                  <p className="mb-4 text-base">
                    {barang?.is_asset ? 'Aset' : 'Non - asset'}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Kode Barang</span>
                      <span className="font-medium">{barang?.kode_barang}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Kode Gudang</span>
                      <span className="font-medium">{barang?.kode_gudang}</span>
                    </div>
                  </div>
                </div>

                {/* --- Gambar Barang --- */}
                {barang?.image && (
                  <div className="mt-6">
                    <img
                      src={`${apiUrl}${barang.image}`}
                      alt="item"
                      className="w-full max-w-md rounded-lg shadow-md mx-auto cursor-pointer hover:opacity-85 transition-opacity"
                      onClick={() => handleImageClick(`${apiUrl}${barang.image}`)}
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
                    <p className="font-medium">{lpb?.kode || '-'}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-500">Penerima</p>
                    <p className="font-medium">{lpb?.penerima || '-'}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-500">Tanggal LPB</p>
                    <p className="font-medium">{DateFormat(lpb?.tanggal) || '-'}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-500">Catatan LPB</p>
                    <p className="font-medium text-right">{lpb?.note || '-'}</p>
                  </div>

                </div>
              </div>
            </div>
            { isAsset === 0 ? 
            (
              <div className="bg-white border rounded-md p-6 mt-6 min-h-[150px]">
                <h2 className="text-xl font-semibold text-gray-400 mb-3">Mutasi</h2>
                {!mutasi ? (
                  // Tampilan jika mutasi adalah array kosong
                  <p className="text-gray-400 italic">Belum ada mutasi.</p>
                ) : (
                  // Tampilan jika mutasi memiliki data
                  <div className="space-y-5 text-sm">

                  {/* Info Stok */}
                  <div className="flex justify-between">
                    <p className="text-gray-500">Stok Awal</p>
                    <p className="font-medium">{mutasi.stok_awal}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-500">Perubahan Stok</p>
                    <p className="font-medium">{mutasi.stok_change}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-500">Stok Akhir</p>
                    <p className="font-medium text-right">{mutasi.stok_akhir}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-500">Tanggal</p>
                    <p className="font-medium text-right">{DateFormat(mutasi.tanggal)}</p>
                  </div>
                  
                </div>
                )}
              </div>
            )
            :
            (
              <div className="bg-white border rounded-md p-6 mt-6 min-h-[150px]">
                <h2 className="text-xl font-semibold text-gray-400 mb-3">Histories</h2>
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
            ) 
            }
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
