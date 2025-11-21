import React, {useState, useEffect} from 'react'
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { Page, Block } from 'framework7-react';
import { useParams } from 'react-router-dom';
import Back from '../component/Back';
import Layout from '../component/Layout';
import { DecryptID } from '../../helper/EncryptHelper';
import Swal from 'sweetalert2';
// [1] IMPORT KOMPONEN TAMBAHAN
import Loader from '../component/Loader';
import Transition from '../component/Transition';

function UpdateRole() {
    const [items, setItems] = useState({
        name : '',
    })
    const [decryptedId, setDecryptedId] = useState('')
    const [error, setError] = useState(0)
    const [disabled, setDisabled] = useState(false)
    
    // [2] STATE UNTUK LOADING
    const [loading, setLoading] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)
    
    const {id} = useParams()
    const navigate = useNavigate();

    useEffect(() => {
        const decryptedIds = DecryptID(id)
        setDecryptedId(decryptedIds)
        if (!decryptedIds) {
            navigate(-1)
        }
    }, [id, navigate])

    useEffect(() => {
        if (decryptedId) {
            fetchItems()
        }
    }, [decryptedId])

    const fetchItems = async () => {
        try {
            setLoading(true) // [3] MULAI LOADING
            const response = await api.get(`role-detail/${decryptedId}`);
            const data = response.data.data;
            setItems({
                name: data?.name || '',
            });
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Gagal Memuat Data',
                text:'Role tidak ditemukan.'
            })
            navigate('/role/list-role');
        } finally {
            // [4] SELESAI LOADING
            setTimeout(() => {
                setLoading(false);
                setContentVisible(true);
            }, 50)
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();        
        try {
            if (disabled) return;
    
            setDisabled(true);
            await api.put(`role-update/${decryptedId}`, {
                name : items.name,
            });
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Role berhasil diperbarui.',
                timer: 2000,
                showConfirmButton: false
            });
            navigate('/role/list-role');
        } catch (error) {
            console.error('Submit Error:', error);
            
            Swal.fire({
                icon:'error',
                title:'Gagal Memperbarui Role',
                text: error?.response?.data?.message || 'Ada Kesalahan Dalam Sistem'
            })
            const statusCode = error?.response?.data?.statusCode || 500;
            setError(statusCode);
        } finally {
            setDisabled(false);
        }
    }
    
  return (
        <div> 
            <Layout title={'Update Role'}>
                <Block>
                    <div className="xs:px-0 md:px-4">
                        <Back goHome={() => navigate('/role/list-role')} />
                        <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Update Role</p>
                        
                        {/* [5] TAMPILKAN LOADER */}
                        { loading && <Loader Class="mt-44"/> }

                        {/* [6] WRAP DENGAN TRANSITION */}
                        <Transition contentVisible={contentVisible}>
                            <div className='bg-white rounded-lg shadow-xl shadow-gray-200 border p-8'>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-5">
                                        <label className="font-semibold">New Role</label>
                                        <div className='bg-white mt-2 p-3 rounded-md border-solid border-gray-300 border'>
                                            <input 
                                                type="text" 
                                                name="name" 
                                                value={items.name} 
                                                onChange={e => setItems({ ...items, name: e.target.value })}
                                                maxLength={50}
                                                placeholder='Masukkan nama role'
                                                className="w-full p-3 border rounded placeholder:text-gray-400 placeholder:font"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center justify-center mt-10 mx-auto max-w-full w-[25rem] space-y-2 text-center">
                                        <button disabled={disabled} type='submit' className='w-full py-2 px-2 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 transition-colors duration-200 text-white disabled:bg-blue-300'>
                                            Update
                                        </button>
                                        <button className='w-full py-2 px-2 rounded-lg font-medium border border-red-200 bg-red-50 hover:bg-red-100 transition-colors duration-200 text-red-600' onClick={fetchItems} type='button'>
                                            Reset
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </Transition>
                    </div>
                </Block>
            </Layout>
        </div>
  )
}

export default UpdateRole