import React, { useEffect, useState } from 'react';
import Back from '../component/Back'
import { Page, Block } from 'framework7-react';
import api from '../../api/api';
import { replace, useNavigate, useParams } from 'react-router-dom';
import Loader from '../component/Loader';
import Layout from '../component/Layout';
import { useAuth } from '../../auth/AuthContext';
import { DecryptID, encrypting } from '../../helper/EncryptHelper';
import Swal from 'sweetalert2';
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
  
  // State Untuk Mengecek Apakah Barang Ini Punya Dia
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

  // const handleInputChange = (field) => (e) => {
  //   setItemHistories({ ...itemHistories, [field]: e.target.value });
  // };

  // const handleSelectChange = (field) => (selectedOption) => {
  //     setItemHistories({ ...itemHistories, [field]: selectedOption });
  // };

  return (
    <Layout title={'Detail Barang'}>
      <Block>
        <Back goHome={() => navigate('/barang/list-barang')}/>
          {/* {
            loading ?
            (
              <Loader Class={'mt-20'} />
            ) : ( */}
            <Transition contentVisible={contentVisible}>
              <div className="bg-white font-inter py-5 mt-3 rounded-md w-full shadow-sm">
                <div className="flex flex-col mx-6"> 
                  { isAsset ? 
                    <p className='font-semibold'>Aset</p>
                    :
                    <p className='font-semibold'>Non Aset</p>
                  }
                  <h1 className="font-bold capitalize text-xl text-ellipsis whitespace-nowrap overflow-hidden text-center">
                    {item.name}
                  </h1>
                  <div className="flex justify-between">
                    Kode Barang: <p>{item.kode_barang}</p>
                  </div>
                  <div className="flex justify-between">
                    Kode Gudang: <p>{item.kode_gudang}</p>
                  </div>
                  <div className="flex justify-between">
                    Satuan: <p>{item.satuan}</p>
                  </div>
                  <div className="flex justify-between">
                    Sumber barang: <p>{item.sumber_barang?.name}</p>
                  </div>
                  <div className="flex justify-between">
                    Jenis barang: <p>{item.jenis_barang?.name}</p>
                  </div>
                  <div className="flex justify-between">
                    Kategori: <p>{item.category_barang?.name}</p>
                  </div>
                  <div className="flex justify-between">
                    Tingkat kebutuhan: <p>{item.tingkat_kebutuhan?.name}</p>
                  </div>
                  <div className="w-full place-items-center self-center sm:self-auto">
                    { item.image &&
                      <img src={`${apiUrl}${item.image}`} alt="item image" className='max-w-lg'/>
                    }
                  </div>
                </div>
              </div>
            </Transition>
          {/* ) */}
        {/* } */}
      </Block>
    </Layout>
  );
}

export default DetailItem;
