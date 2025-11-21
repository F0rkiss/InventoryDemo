import React, {useState, useEffect} from 'react'
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { Page, Block } from 'framework7-react';
import { useParams } from 'react-router-dom';
import SelectPaginate from '../component/SelectPaginate';
import Back from '../component/Back';
import Layout from '../component/Layout';
import { DecryptID } from '../../helper/EncryptHelper';
import Swal from 'sweetalert2';
// [1] IMPORT KOMPONEN TAMBAHAN
import Loader from '../component/Loader';
import Transition from '../component/Transition';

function UpdateUser() {
    const [items, setItems] = useState({
        name : '',
        role : null
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
            const response = await api.get(`inventUser-detail/${decryptedId}`);
            const data = response.data.data;
            setItems({
                name: data.data?.EmpName || '',
                role: data.data?.role ? {
                    value: data.data?.role?.id, label: data.data?.role?.name
                } : null
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal Memuat Data',
                text: 'User tidak ditemukan.'
            });
            navigate('/user/list-user');
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
            if (disabled) {
                return
            }
            setDisabled(true)
            await api.put(`inventUser-update/${decryptedId}`, {
                name : items.name,
                role_id : items.role?.value,
            })
            
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'User role berhasil diperbarui.',
                timer: 2000,
                showConfirmButton: false
            });
            navigate('/user/list-user');

        } catch (error) {
            console.error("Submit Error:", error);
            
            Swal.fire({
                icon: 'error',
                title: 'Gagal Memperbarui User',
                text: error?.response?.data?.message || 'Ada Kesalahan Dalam Sistem'
            });

            if (error.response && error.response.data) {
                setError(error.response.data.statusCode || 500);
            } else {
                setError(500); 
            }
        } finally {
            setDisabled(false)
        }
    }

  return (
        <div> 
            <Layout title={'Update User'}>
                <Block>
                    <div className="xs:px-0 md:px-4">
                        <Back goHome={() => navigate('/user/list-user')} />
                        <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Update User</p>
                        
                        {/* [5] TAMPILKAN LOADER */}
                        { loading && <Loader Class="mt-44"/> }

                        {/* [6] WRAP DENGAN TRANSITION */}
                        <Transition contentVisible={contentVisible}>
                            <div className='bg-white rounded-lg shadow-xl shadow-gray-200 border p-8'>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-5">
                                        <label className="font-semibold">Nama</label>
                                        <div className='bg-white mt-1 rounded-md text-2xl'>
                                            <input 
                                                type="text" 
                                                name="name" 
                                                value={items.name} 
                                                onChange={e => setItems({ ...items, name: e.target.value })}
                                                maxLength={50}
                                                placeholder='Nama'
                                                className="w-full border rounded font-bold" 
                                                disabled 
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="mb-5 ">
                                        <label className="font-semibold">Role</label>
                                        <div className='mt-2'> 
                                            <SelectPaginate 
                                                selectValue={items.role} 
                                                source={'role'}
                                                selectName={'Role'}
                                                itemLabel={['name']}
                                                handleSelectChange={role => 
                                                    setItems({ ...items, role })
                                                }
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-center justify-center mt-10 mx-auto max-w-full w-[25rem] space-y-2 text-center">
                                        <button disabled={disabled} type="submit" className="w-full py-2 px-2 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 transition-colors duration-200 text-white disabled:bg-blue-300">
                                            Update
                                        </button>
                                        <button type="button" onClick={fetchItems} className="w-full py-2 px-2 rounded-lg font-medium border border-red-200 bg-red-50 hover:bg-red-100 transition-colors duration-200 text-red-600">
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

export default UpdateUser