// Login.jsx
import React, { useState, useEffect } from 'react';
import { Page, Block } from 'framework7-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';
import useAuth from '../hooks/useAuth';
import gambar from '../assets/image/Media_Indonesia_(2017) (1).png';
import { jwtDecode } from 'jwt-decode';
import CryptoJS from 'crypto-js';
// import encryptData from './CobaIndex';
function Login() {
    const navigate = useNavigate();
    const { setAuth, auth } = useAuth();
    const [credential, setCredential] = useState({
        employee_code: '',
        password: ''
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // <-- TAMBAHKAN INI

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            const decoded = jwtDecode(token);
            const role = decoded.role;

            if ( role ) {
                navigate('/dashboard', { replace: true });
            }
        }
    }, [navigate]);

    const handleInputChange = (field) => (e) => {
        setCredential({ ...credential, [field]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (isSubmitting) {
                return;
            }
            setIsSubmitting(true)
            // Post login credentials to the API
            const response = await api.post('/login', {
                EmpCode: credential.employee_code,
                password: credential.password
            });
    
            const token = response.data.access_token;
            
            // Store token in localStorage
            localStorage.setItem('authToken', token);; 
    
            // Set authentication state
            setAuth({
                employee_code: credential.employee_code,
                token,
                role: ''
            });
    
            // Decode token to get role
            const decoded = jwtDecode(token);
            const role = decoded.role;
    
            // Navigate based on role
            if (role) {
                navigate('/dashboard', { replace: true });
            } else {
                // Handle cases where the role is not recognized
                setErrorMessage('Login failed: Unrecognized role');
            }
        } catch (error) {
            // Handle errors during login
            setErrorMessage('Login failed: ' + (error.response?.data?.message || error.message));
            if (error.response.status === 401) {
                setErrorMessage('Email atau Password Anda salah')
            }
        } finally {
            setIsSubmitting(false)
        }
    };

    const isFormInvalid = !credential.employee_code || !credential.password;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-inter">
        <div className="bg-stone-900 rounded-2xl shadow-2xl p-10 w-full max-w-sm mx-3">
            <div className="flex justify-center mb-6">
                <img src={gambar} alt="Logo" className="h-14 object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-center text-white mb-6">Sign In</h2>
            <form onSubmit={handleSubmit}>
                <div className='mb-6'>
                    <label className='text-gray-200 text-xs mb-2 px-0'>Employee Code</label>
                    <div className='mt-1 py-2 px-3 bg-stone-800 focus-within:bg-stone-700/50 border-2 border-stone-900 rounded-md transition-colors focus-within:border-stone-500'>
                        <input
                            type="text"
                            className='w-full !text-white placeholder:text-stone-400'
                            placeholder='Masukkan employee code'
                            value={credential.employee_code}
                            onChange={handleInputChange('employee_code')}
                            required
                            autoFocus
                        />
                    </div>
                </div>
                <div className='mb-6'>
                    <label className='text-gray-200 text-xs mb-2 px-0'>Password</label>
                    {/* <-- UBAH INI: Tambahkan 'relative' */}
                    <div className='flex justify-between mt-1 py-2 px-3 bg-stone-800 focus-within:bg-stone-700/50 border-2 border-stone-900 rounded-md transition-colors focus-within:border-stone-500'>
                        <input
                            type={showPassword ? 'text' : 'password'} // <-- UBAH INI
                            placeholder='Masukkan password'
                            value={credential.password}
                            onChange={handleInputChange('password')}
                            className='w-full !text-white placeholder:text-stone-400 pr-16' // <-- UBAH INI: Tambahkan padding 'pr-16'
                            required
                        />
                        {/* <-- TAMBAHKAN TOMBOL INI --> */}
                        <button
                            type="button" // Set type="button" agar tidak men-submit form
                            className="flex items-center w-fit text-stone-400 hover:text-stone-200 text-sm font-medium"
                            onClick={() => setShowPassword(!showPassword)} // Toggle state
                        >
                            {/* Logika untuk mengubah teks tombol */}
                            <i className={`${showPassword ? 'bx bx-show' : 'bx bx-hide'} text-[18px]`}></i>
                        </button>
                    </div>
                </div>
                {errorMessage && (
                    <div className='mb-6 text-red-500 text-sm text-center'>
                        {errorMessage}
                    </div>
                )}
                <div className="mt-8">
                    <button
                        type='submit'
                        disabled={isFormInvalid || isSubmitting}
                        className='w-full bg-stone-100 text-stone-800 font-semibold py-3 rounded-lg hover:bg-stone-300 transition-color duration-200 disabled:bg-stone-500 text-base'
                    >
                        Sign In
                    </button>
                </div>
            </form>
        </div>
    </div>

    )
}

export default Login;