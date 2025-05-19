import React from 'react';
import api from '../../api/api';
import { useState, useEffect } from 'react';
import { Page, Block } from 'framework7-react';
import Loader from '../component/Loader';
import CustomNavbar from '../component/CustomNavbar';
import userIcon from '../../assets/image/user asli victus putih.png';
import Transition from '../component/Transition';
import Layout from '../component/Layout';
import Swal from 'sweetalert2';

function EditProfile() {
    const [user, setUser] = useState({});
    const [inputUser, setInputUser] = useState({
        name: '',
        email: '',
        current_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState({});
    const [disabled, setDisabled] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)

    useEffect(() => {
        fetchUser();
    }, []);

    const token = localStorage.getItem('authToken');

    const fetchUser = async () => {
        try {
            const response = await api.get('user/profile', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = response.data.data;
            setInputUser({
                name: data.name,
                email: data.email,
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
            setUser(data);
        } catch (error) {

        } finally {
            setLoading(false);
            setTimeout(() => setContentVisible(true), 50)
        }
    };

    const handleInputChange = (field) => (e) => {
        setInputUser({ ...inputUser, [field]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError({});
        try {
            if (disabled) {
                return
            }

            if (inputUser.new_password !== inputUser.confirm_password) {
                setError({
                    general: 'Konfirmasi password baru tidak cocok.'
                });
                fetchUser();
                return;
            }

            if (inputUser.new_password.length < 8 && inputUser.current_password) {
                setError({
                    general: 'Password Baru Minimal 8 Karakter.'
                });
                fetchUser();
                return;
            }

            setDisabled(true)
            const response = await api.put('user/profile', {
                name: inputUser.name,
                email: inputUser.email,
                current_password: inputUser.current_password,
                new_password: inputUser.new_password,
                confirm_password: inputUser.confirm_password
            })
            await Swal.fire({
                icon:'success',
                title: 'Sukses',
                text:'Berhasil Mengubah Profil Anda',
                confirmButtonColor:'#4ADE80'
            })
            fetchUser()
        } catch (error) {
            const errorData = error.response?.data;
            
            if (errorData?.status === 400) {
                setError({ general: 'Password saat ini tidak valid.' });
            } 
            else if (errorData?.code === 'EMAIL_ALREADY_EXISTS') {
                setError({ email: 'Email sudah digunakan oleh pengguna lain.' });
            } else if (errorData?.code === 'PASSWORDS_DO_NOT_MATCH') {
                setError({
                    confirm_password: 'Konfirmasi password baru tidak cocok.'
                });
            } else if(errorData?.msg === 'Current password is incorrect') {
                setError({ current_password: 'Current Password Salah' });
            } else {
                setError({ general: 'Terjadi kesalahan. Silakan coba lagi.' });
            }  
            
            if (errorData?.msg?.email[0] === "The email has already been taken.") {
                setError({email : 'Email Sudah Diambil'})
            }
        } finally {
            setDisabled(false)
        }
    };

    return (
        <Layout title={'Profile'}>
            <Block>
                {
                    loading ? (
                        <Loader Class='mt-72' />
                    ) : (
                        <>
                        <Transition contentVisible={contentVisible}>
                            <div className='bg-coklat-mi shadow-md rounded-xl text-white mb-10'>
                                <div className='p-5 flex flex-col items-center'>
                                    <div className="image">
                                        <img src={userIcon} className='max-w-24' />
                                    </div>
                                    <div className="text mt-3 flex flex-col items-center">
                                        <p className='font-bold capitalize text-xl'>{user.name}</p>
                                        <p className='font-light capitalize'>{user.role}</p>
                                        <p className='font-light capitalize'>Department {user.department && user.department.name}</p>
                                        <p className='font-light capitalize'>Divisi {user.department && user.department.divisi?.name}</p>
                                    </div>
                                </div>
                            </div>

                            <div className='bg-coklat-mi shadow-md rounded-xl text-white'>
                                <form onSubmit={handleSubmit}>
                                    <div className='mx-6 pt-2 pb-4'>
                                        <div className="text mt-3">
                                            <p className='font-bold capitalize text-xl'>Username</p>
                                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border text-black mt-2'>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={inputUser.name}
                                                    onChange={handleInputChange('name')}
                                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                                    placeholder='Name'
                                                    required
                                                />
                                            </div>
                                            {error.name && <p className='text-red-500 mt-1'>{error.name}</p>}
                                        </div>
                                        <div className="text mt-3">
                                            <p className='font-bold capitalize text-xl'>Email</p>
                                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border text-black mt-2'>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={inputUser.email}
                                                    onChange={handleInputChange('email')}
                                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                                    placeholder='Email'
                                                    required
                                                />
                                            </div>
                                            {error.email && <p className='text-red-500 mt-1'>{error.email}</p>}
                                        </div>
                                        <div className="text mt-3">
                                            <p className='font-bold capitalize text-xl'>Current Password</p>
                                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border text-black mt-2'>
                                                <input
                                                    type="password"
                                                    name="current_password"
                                                    value={inputUser.current_password}
                                                    onChange={handleInputChange('current_password')}
                                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                                    placeholder='Enter current password to save changes'
                                                />
                                            </div>
                                            {error.current_password && <p className='text-red-500 mt-1'>{error.current_password}</p>}
                                        </div>
                                        <div className="text mt-3">
                                            <p className='font-bold capitalize text-xl'>New Password</p>
                                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border text-black mt-2'>
                                                <input
                                                    type="password"
                                                    name="new_password"
                                                    value={inputUser.new_password}
                                                    onChange={handleInputChange('new_password')}
                                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                                    placeholder='New Password'
                                                    disabled={!inputUser.current_password}
                                                    required={Boolean(inputUser.current_password)}
                                                />
                                            </div>
                                            {error.new_password && <p className='text-red-500 mt-1'>{error.new_password}</p>}
                                        </div>
                                        <div className="text mt-3">
                                            <p className='font-bold capitalize text-xl'>Confirm New Password</p>
                                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border text-black mt-2'>
                                                <input
                                                    type="password"
                                                    name="confirm_password"
                                                    value={inputUser.confirm_password}
                                                    onChange={handleInputChange('confirm_password')}
                                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                                    placeholder='Confirm New Password'
                                                    disabled={!inputUser.current_password}
                                                    required={Boolean(inputUser.current_password)}
                                                />
                                                {error.confirm_password && <p className='text-red-500 mt-1'>{error.confirm_password}</p>}
                                            </div>
                                        </div>
                                        <div className='flex justify-end'>
                                            <button
                                                type="submit"
                                                disabled={disabled}
                                                className='bg-teal-500 text-white p-3 rounded-md mt-12'
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                        {error.general && <p className='text-red-500 mt-4 text-center'>{error.general}</p>}
                                    </div>
                                </form>
                            </div>
                            </Transition>
                        </>
                    )
                }
            </Block>
        </Layout>
    );
}

export default EditProfile;
