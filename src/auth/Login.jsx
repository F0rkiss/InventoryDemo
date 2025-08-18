// Login.jsx
import React, { useState, useEffect } from 'react';
import { Page, Block } from 'framework7-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';
import useAuth from '../hooks/useAuth';
import gambar from '../assets/image/Media_Indonesia_(2017) (1).png';
import { jwtDecode } from 'jwt-decode';
import CryptoJS from 'crypto-js';
import encryptData from './CobaIndex';
function Login() {
    const navigate = useNavigate();
    const { setAuth, auth } = useAuth();
    const [credential, setCredential] = useState({
        employee_code: '',
        password: ''
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [disabled, setDisabled] = useState(false)

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
            if (disabled) {
                return;
            }
            setDisabled(true)
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
                setErrorMessage('Email Atau Password Anda Salah')
            }
        } finally {
            setDisabled(false)
        }
    };
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-inter">
        <div className="bg-[#212121] rounded-2xl shadow-2xl p-10 w-full max-w-sm">
        <div className="flex justify-center mb-6">
            <img src={gambar} alt="Logo" className="h-14 object-contain" />
        </div>
        <h2 className="text-2xl font-bold text-center text-white mb-6">Sign In</h2>
        <form onSubmit={handleSubmit}>
            <div className='mb-6 border-b'>
            <label className='block text-gray-200 text-sm font-light mb-2 px-0'>Employee Code</label>
            <input
                type="text"
                className='bg-white border-b-2 border-gray-600 w-full !pb-1 !text-white placeholder:text-gray-500 focus:outline-none focus:border-gray-200 transition-colors'
                placeholder='Enter employee code'
                value={credential.employee_code}
                onChange={handleInputChange('employee_code')}
                required
            />
            </div>
            <div className='mb-6 border-b'>
            <label className='block text-gray-200 text-sm font-light mb-2 px-0'>Password</label>
            <input
                type="password"
                placeholder='Enter password'
                value={credential.password}
                onChange={handleInputChange('password')}
                className='bg-transparent border-b-2  w-full py-2 !pb-1 !text-white placeholder:text-gray-500 focus:outline-none focus:border-gray-200 transition-colors'
                required
            />
            </div>
            {errorMessage && (
            <div className='mb-6 text-red-500 text-sm text-center'>
                {errorMessage}
            </div>
            )}
            <div className="mt-8">
            <button
                type='submit'
                disabled={disabled}
                className='w-full bg-gray-200 text-black font-semibold py-3 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base tracking-wider'
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



