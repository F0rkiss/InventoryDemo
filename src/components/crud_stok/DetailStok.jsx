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
  const [item, setItem] = useState({});
  const lpb = item.laporan_penerimaan_barang
  const barang = item.barang

  const navigate = useNavigate();
  const { id } = useParams();
  const [decryptedId, setDecryptedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
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
      setLoading(true);
      const response = await api.get(`/inventStok-detail/${decryptedId}`);
      const data = response.data.data;
      setItem(data);
    } catch (error) {
      //
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
                    <p className="font-medium">{item.qty}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-500">Tanggal Masuk</p>
                    <p className="font-medium">{DateFormat(item.tanggal_barang_masuk)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-500">Catatan Stok</p>
                    <p className="font-medium text-right">{item.note || '-'}</p>
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
