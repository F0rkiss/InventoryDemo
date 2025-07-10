import React, { useEffect, useState } from 'react';
import Back from '../component/Back'
import { Page, Block } from 'framework7-react';
import api from '../../api/api';
import { replace, useNavigate, useParams } from 'react-router-dom';
import Layout from '../component/Layout';
import { DecryptID, encrypting } from '../../helper/EncryptHelper';
import Transition from '../component/Transition';
import DateFormat from '../../helper/DateFormatHelper'


function DetailMakeRequest() {
  const [item, setItem] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();
  const [decryptedId, setDecryptedId] = useState('')
  const [loading, setLoading] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  
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
      const response = await api.get(`/inventMakeRequest-detail/${decryptedId}`);
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
    <Layout title={'Detail Make Request'}>
      <Block>
        <Back goHome={() => navigate('/make-request/list-make-request')}/>
            <Transition contentVisible={contentVisible}>
              <div className="bg-white font-inter py-5 mt-3 rounded-md w-full border border-2 border-gray-300/30">
                <div className="m-4 px-2">
                    <div className='flex flex-col justify-self-center text-center'>
                        <p className='text-2xl font-bold capitalize'>{item.user?.EmpName}</p>
                        <p className='text-gray-500 text-md'>{item.user?.EmpCode}</p>
                    </div>
                    <div className='text-lg gap-2'>
                        <div className="flex justify-between">
                            Type Request: <p>{item.type_request?.name || item.nameTypeRequest}</p>
                        </div>
                        <div className="flex justify-between">
                            Jenis: <p>{item.type_request?.jenis || item.jenisTypeRequest}</p>
                        </div>
                            {
                                item.type_request?.description && 

                                <div className="flex justify-between">
                                    Description: <p>{item.type_request?.description}</p>
                                </div>
                            } 
                        <div className="flex justify-between">
                            Note: <p>{item.note || '-'}</p>
                        </div>
                        <div className="flex justify-between">
                            Tanggal Dibuat: <p>{DateFormat(item.created_at)}</p>
                        </div>
                        <div className="flex justify-between">
                            Tanggal Dirubah: <p>{DateFormat(item.updated_at)}</p>
                        </div>
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

export default DetailMakeRequest;
