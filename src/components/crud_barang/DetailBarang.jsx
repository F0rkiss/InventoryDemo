import React, { useEffect, useState } from 'react';
import Back from '../component/Back'
import { Page, Block } from 'framework7-react';
import api from '../../api/api';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../component/Layout';
import { DecryptID } from '../../helper/EncryptHelper';
import Transition from '../component/Transition';

function DetailItem() {
  const [item, setItem] = useState({});
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
      setLoading(true);
      const response = await api.get(`/inventBarang-detail/${decryptedId}`);
      const data = response.data.data;
      setItem(data);
    } catch (error) {
      //
    } finally {
      setLoading(false);
      setTimeout(() => setContentVisible(true), 50);
    }
  };

  return (
    <Layout title={'Detail Barang'}>
      <Block>
        <div className="px-4">
          <Back goHome={() => navigate('/barang/list-barang')} />
          <Transition contentVisible={contentVisible}>
            {/* MOBILE: img on top, all info below */}
            <div className="bg-white border font-inter py-6 mt-3 rounded-lg w-full">
              <div className="flex flex-col gap-8">
                {/* IMAGE: Top on mobile, bottom on desktop/tablet */}
                <div className="block md:hidden mx-auto">
                  {item.image && (
                    <img
                      src={`${apiUrl}${item.image}`}
                      alt="item"
                      className="w-full max-w-xs rounded shadow mx-auto"
                    />
                  )}
                </div>

                {/* MAIN CONTENT GRID */}
                <div className="
                  grid grid-cols-1
                  md:grid-cols-3 md:gap-6
                  mx-4 md:mx-8
                ">
                  {/* Kolom 1: Data Utama */}
                  <div className="mb-8 md:mb-0 border-b md:border-b-0 md:border-r md:pr-8">
                    <div className="mb-1">
                      {isAsset ? 'Aset' : 'Non - asset'}
                    </div>
                    <div className="font-bold capitalize text-2xl leading-tight mb-4">{item.name}</div>
                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Kode Barang</span>
                        <span className="font-semibold">{item.kode_barang}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className=" text-gray-500">Kode Gudang</span>
                        <span className="font-semibold">{item.kode_gudang}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className=" text-gray-500">Satuan</span>
                        <span className="font-semibold">{item.satuan}</span>
                      </div>
                    </div>
                  </div>

                  {/* Kolom 2: Kategori & Tingkat Kebutuhan */}
                  <div className="mb-8 md:mb-0 md:pe-8">
                    <div className="mb-5">
                      <div className='flex justify-between items-center'>
                        <p className="text-gray-500">Kategori</p>
                        <p className="font-semibold">{item.category_barang?.name || '-'}</p>
                      </div>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center ps-1'>
                          <div className='border-gray-500 border-l border-b w-2 h-2'></div>
                          <p className="text-gray-500 text-right mt-1 ps-1">
                            Deskripsi
                          </p>
                        </div>
                        <p className="text-right mt-1">
                          {item.category_barang?.description || '-'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className='flex justify-between items-center'>
                        <p className="text-gray-500">Tingkat Kebutuhan</p>
                        <p className="font-semibold">{item.tingkat_kebutuhan?.name || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Kolom 3: Sumber Barang & Jenis Barang */}
                  <div className="md:pl-8">
                    <div className="mb-5">
                      <div className='flex justify-between items-center'>
                        <p className="text-gray-500">Sumber Barang</p>
                        <p className="font-semibold">{item.sumber_barang?.name || '-'}</p>
                      </div>
                      <div className='flex justify-between items-center'>
                        <div className='flex items-center ps-1'>
                          <div className='border-gray-500 border-l border-b w-2 h-2'></div>
                          <p className="text-gray-500 text-right mt-1 ps-1">
                            Deskripsi
                          </p>
                        </div>
                        <p className="mt-1 text-right">
                          {item.sumber_barang?.description || '-'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className='flex justify-between items-center'>
                        <p className="text-gray-500">Jenis Barang</p>
                        <p className="font-semibold">{item.jenis_barang?.name || '-'}</p>
                      </div>
                      <div className='flex justify-between items-center'>
                        <div className='flex items-center ps-1'>
                          <div className='border-gray-500 border-l border-b w-2 h-2'></div>
                          <p className="text-gray-500 text-right mt-1 ps-1">
                            Deskripsi
                          </p>
                        </div>
                        <p className="mt-1 text-right">
                          {item.jenis_barang?.description || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* IMAGE: Bottom on desktop/tablet */}
                <div className="hidden md:block mt-6">
                  {item.image && (
                    <img
                      src={`${apiUrl}${item.image}`}
                      alt="item"
                      className="w-full max-w-md rounded shadow mx-auto"
                    />
                  )}
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Block>
    </Layout>
  );
}

export default DetailItem;
