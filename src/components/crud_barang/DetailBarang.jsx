import React, { useEffect, useState } from 'react';
import Back from '../component/Back'
import { Page, Block } from 'framework7-react';
import api from '../../api/api';
import { replace, useNavigate, useParams } from 'react-router-dom';
import Layout from '../component/Layout';
import { DecryptID, encrypting } from '../../helper/EncryptHelper';
import Transition from '../component/Transition';

function DetailItem() {
  const [item, setItem] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();
  const [decryptedId, setDecryptedId] = useState('')
  const [loading, setLoading] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  const isAsset = item.is_asset
  const apiUrl = import.meta.env.VITE_URL
  
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
      const response = await api.get(`/inventBarang-detail/${decryptedId}`);
      const data = response.data.data;
      console.log(data)
      setItem(data);      
    } catch (error) {

    } finally {
      setLoading(false); 
      setTimeout(() => setContentVisible(true), 50)
    }
  };

  return (
    <Layout title={'Detail Barang'}>
      <Block>
        <div className='px-4'>
          <Back goHome={() => navigate('/barang/list-barang')}/>
            <Transition contentVisible={contentVisible}>
              <div className="bg-white font-inter py-5 mt-3 rounded-md w-full shadow-sm">
                <div className="mx-6 space-y-4">
                  <p className="font-semibold">{isAsset ? 'Aset' : 'Non Aset'}</p>
                  <h1 className="font-bold capitalize text-xl">{item.name}</h1>
                  <div className="grid grid-cols-2 gap-y-2 border-t pt-4 text-sm">
                    <div className="font-medium text-gray-700">Kode Barang</div>
                    <div className="text-gray-800 text-right">{item.kode_barang}</div>

                    <div className="font-medium text-gray-700">Kode Gudang</div>
                    <div className="text-gray-800">{item.kode_gudang}</div>

                    <div className="font-medium text-gray-700">Satuan</div>
                    <div className="text-gray-800">{item.satuan}</div>

                    <div className="font-medium text-gray-700">Sumber Barang</div>
                    <div className="text-gray-800">{item.sumber_barang?.name || '-'}</div>

                    <div className="font-medium text-gray-700">Jenis Barang</div>
                    <div className="text-gray-800">{item.jenis_barang?.name || '-'}</div>

                    <div className="font-medium text-gray-700">Kategori</div>
                    <div className="text-gray-800">{item.category_barang?.name || '-'}</div>

                    <div className="font-medium text-gray-700">Tingkat Kebutuhan</div>
                    <div className="text-gray-800">{item.tingkat_kebutuhan?.name || '-'}</div>
                  </div>

                  {item.image && (
                    <div className="flex justify-center mt-6">
                      <img src={`${apiUrl}${item.image}`} alt="item image" className="max-w-lg w-full rounded shadow" />
                    </div>
                  )}
                </div>
              </div>
            </Transition>
        </div>
      </Block>
    </Layout>
  );
}

export default DetailItem;
