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
    const [isSubmitting, setIsSubmitting] = useState(false)

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
    
        if (isSubmitting) return;
        setIsSubmitting(true);
    
        try {
            // Validasi angka
            if (!/^\d+$/.test(credential.employee_code)) {
                setErrorMessage('EmpCode harus berupa angka');
                setIsSubmitting(false);
                return;
            }
    
            // Kirim data login ke API
            const response = await api.post('/login', {
                EmpCode: credential.employee_code,
                password: credential.password
            });
    
            const token = response.data.access_token;
            if (!token) {
                setErrorMessage('EmpCode tidak dikenali');
                return;
            }
    
            localStorage.setItem('authToken', token);
    
            const decoded = jwtDecode(token);
            const role = decoded.role;
    
            setAuth({
                employee_code: credential.employee_code,
                token,
                role,
            });
    
            if (role) {
                navigate('/dashboard', { replace: true });
            } else {
                setErrorMessage('EmpCode tidak dikenali');
            }
    
        } catch (error) {
            // Handle error dengan lebih spesifik
            if (error.response) {
                const { status } = error.response;
                if (status === 401 || 404) {
                    setErrorMessage('Email atau Password Anda salah');
                } else {
                    setErrorMessage('Login failed: ' + (error.response.data?.message || 'Terjadi kesalahan'));
                }
            } else {
                setErrorMessage('Login failed: ' + error.message);
            }
        } finally {
            setIsSubmitting(false);
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
                        inputMode="numeric"        // tampilkan keyboard angka di mobile
                        pattern="[0-9]*"           // hanya izinkan angka
                        className='w-full !text-white placeholder:text-stone-400'
                        placeholder='Masukkan employee code'
                        value={credential.employee_code}
                        onChange={(e) => {
                            // hapus semua karakter non-digit
                            const onlyNumbers = e.target.value.replace(/\D/g, '');
                            setCredential({ ...credential, employee_code: onlyNumbers });
                          }}
                        required
                        autoFocus
                        />
                    </div>
                </div>
                <div className='mb-6'>
                    <label className='text-gray-200 text-xs mb-2 px-0'>Password</label>
                    <div className='mt-1 py-2 px-3 bg-stone-800 focus-within:bg-stone-700/50 border-2 border-stone-900 rounded-md transition-colors focus-within:border-stone-500'>
                        <input
                            type="password"
                            placeholder='Masukkan password'
                            value={credential.password}
                            onChange={handleInputChange('password')}
                            className='w-full !text-white placeholder:text-stone-400'
                            required
                        />
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



