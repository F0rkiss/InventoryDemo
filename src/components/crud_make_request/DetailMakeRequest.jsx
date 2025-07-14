import React, { useEffect, useState } from 'react';
import Back from '../component/Back'
import { Page, Block } from 'framework7-react';
import api from '../../api/api';
import { replace, useNavigate, useParams } from 'react-router-dom';
import Layout from '../component/Layout';
import { DecryptID, encrypting } from '../../helper/EncryptHelper';
import Transition from '../component/Transition';
import DateFormat from '../../helper/DateFormatHelper'
import { useAuth } from '../../auth/AuthContext';


function DetailMakeRequest() {
  const [item, setItem] = useState({});
  const details = item.details || []
  const navigate = useNavigate();
  const { id } = useParams();
  const { role } = useAuth()
  const [decryptedId, setDecryptedId] = useState('')
  const [loading, setLoading] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  
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
      let response;
      if (role === 'admin') {
        response = await api.get(`/inventMakeRequest-admin/detail/${decryptedId}`);
      } else {
        response = await api.get(`/inventMakeRequest-detail/${decryptedId}`);
      }
      const data = response.data.data;
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
              <div className='flex flex-col items-center lg:items-start lg:flex-row gap-6 px-4 justify-center'>
                <div className="bg-white py-8 px-8 mt-6 rounded-lg border border-gray-300 max-w-2xl">
                  <div className="flex flex-col items-center text-center mb-6">
                    <p className="text-xl font-bold capitalize">{item.user?.EmpName}</p>
                    <p className="text-gray-500 text-base">{item.user?.EmpCode}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="w-44 font-medium text-left">Type Request:</div>
                      <div className="flex-1 text-right">{item.type_request?.name || item.nameTypeRequest}</div>
                    </div>
                    <div className="flex">
                      <div className="w-44 font-medium text-left">Jenis:</div>
                      <div className="flex-1 text-right">{item.type_request?.jenis || item.jenisTypeRequest}</div>
                    </div>
                    {item.type_request?.description && (
                      <div className="flex items-start">
                        <div className="w-44 font-medium text-left pt-1">Description:</div>
                        <div className="flex-1 text-right whitespace-pre-line break-words">
                          {item.type_request?.description}
                        </div>
                      </div>
                    )}
                    <div className="flex">
                      <div className="w-44 font-medium text-left">Tanggal Dibuat:</div>
                      <div className="flex-1 text-right">{DateFormat(item.created_at)}</div>
                    </div>
                    <div className="flex">
                      <div className="w-44 font-medium text-left">Tanggal Dirubah:</div>
                      <div className="flex-1 text-right">{DateFormat(item.updated_at)}</div>
                    </div>
                  </div>
                </div>
                {details.length > 0 && (
                  <div className="bg-white py-8 px-8 mt-6 rounded-lg border border-gray-300 max-w-xl w-full">
                    <p className="font-bold text-lg mb-2 text-center">Detail Barang</p>
                    <table className="w-full text-center">
                      <thead>
                        <tr className='border-b'>
                          <th className=" px-3 py-1">No</th>
                          <th className=" px-3 py-1">Quantity</th>
                          <th className=" px-3 py-1">Note Barang</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details.map((detail, index) => (
                          <tr key={detail.id}>
                            <td className=" px-3 py-1">{index + 1}</td>
                            <td className=" px-3 py-1">{detail.qty}</td>
                            <td className=" px-3 py-1">{detail.note_barang}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Transition>
          {/* ) */}
      </Block>
    </Layout>
  );
}

export default DetailMakeRequest;
