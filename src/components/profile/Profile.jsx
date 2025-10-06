import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { Block } from 'framework7-react';
import Loader from '../component/Loader';
import Layout from '../component/Layout';
import Transition from '../component/Transition';
import userIcon from '../../assets/image/user asli victus putih.png';
import Back from '../component/Back';

function Profile() {
  const [items, setItems] = useState({});
  const user = items.user

  const [loading, setLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const token = localStorage.getItem('authToken');

  const fetchUser = async () => {
    try {
      const response = await api.get('/profileMe', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setContentVisible(true), 50);
    }
  };

  return (
    <Layout title={'Profile'}>
      <Block>
        {loading ? (
          <Loader Class="mt-72" />
        ) : (
        <div className='xs:px-0 md:px-4'>
            <Back goHome={() => navigate(-1)} />
            <p className='lg:text-3xl text-2xl font-semibold capitalize my-4'>Profile</p>
            <Transition contentVisible={contentVisible}>
                <div className='grid grid-cols-2 bg-white border border-gray-300 shadow-xl shadow-gray-200 rounded-2xl mt-6 p-6'>
                    <div className="col-start-1">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">
                            Personal Information
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-gray-500 text-sm">Employee Name</p>
                                <p className="text-gray-900 font-medium capitalize">
                                    {user.EmpName}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Date of Birth</p>
                                <p className="text-gray-900 font-medium capitalize">
                                    {user.DOB}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Role</p>
                                <p className="text-gray-900 font-medium capitalize">
                                    {items.role}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Employee Code</p>
                                <p className="text-gray-900 font-medium capitalize">
                                    {user.EmpCode}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Email</p>
                                <p className={`font-medium ${user.email_verified_at ? 'text-gray-900' : 'text-yellow-600'}`}>{user.email}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Phone</p>
                                <p className="text-gray-900 font-medium">{user.EmpPhone}</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-start-2">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">
                            Employee Information
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-gray-500 text-sm">Tingkat</p>
                                <p className="text-gray-900 font-medium capitalize">
                                    {user.level_name || '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Posisi</p>
                                <p className="text-gray-900 font-medium capitalize">
                                    {user.posisi_name || '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Posisi Atasan 1</p>
                                <p className="text-gray-900 font-medium capitalize">
                                    {user.posisi_upline_name || '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Posisi Atasan 2</p>
                                <p className="text-gray-900 font-medium capitalize">
                                    {user.posisi_upline2_name || '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Departmen</p>
                                <p className="text-gray-900 font-medium">{user.str_name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Divisi</p>
                                <p className="text-gray-900 font-medium capitalize">
                                    {user.str_upline_name || '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
        )}
      </Block>
    </Layout>
  );
}

export default Profile;
