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

            if (role === 'admin') {
                navigate('/dashboard-admin', { replace: true });
            } else if (role === 'user') {
                navigate('/dashboard-user', { replace: true });
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
            if (role === 'admin') {
                navigate('/dashboard-admin', { replace: true });
            } else if (role === 'user') {
                navigate('/dashboard-user', { replace: true });
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
        <Page className='font-inter bg-stone-300'>
            <Block>
                <div className="px-4">
                    <div className="my-52 bg-hitam-mi rounded-2xl text-custom-gray shadow-lg w-auto">
                        <div className='flex flex-col py-12 w-11/12'>
                            <div className='ms-12 self-center'>
                                <img src={gambar} alt="Logo" className='max-w-48 mb-8 max-xs:max-w-36 max-xs:me-6' />
                            </div> 
                            <form onSubmit={handleSubmit}>
                                <div className='ms-8 mb-6'>
                                    <p className='mb-2 font-light'>Employee Code</p>
                                    <input 
                                        type="text" 
                                        className='mt-12 text-lg w-full'
                                        placeholder='Employee Code'
                                        value={credential.employee_code}
                                        onChange={handleInputChange('employee_code')}
                                        required
                                    />
                                    <hr className='self-center' />
                                </div>
                                <div className='ms-8 mb-4'>
                                    <p className='mb-2 font-light'>Password</p>
                                    <input 
                                        type="password" 
                                        placeholder='Password'
                                        value={credential.password}
                                        onChange={handleInputChange('password')}
                                        className='mt-12 text-lg w-full'
                                        required
                                    />
                                    <hr className='self-center' />
                                </div>
                                {errorMessage && (
                                    <div className='ms-8 mb-4 text-red-500 text-sm text-center'>
                                        {errorMessage}
                                    </div>
                                )}
                                <div className="submit flex justify-center px-2 mt-6">
                                    <button 
                                        type='submit' 
                                        disabled={disabled}
                                        className='bg-gray-200 text-hitam-mi text-lg rounded-xl ms-8 py-3 max-xs:py-3'
                                    >
                                        Sign In
                                    </button>
                                </div>
                            </form>
                            {/* <button className='mt-9' onClick={cryptocurrency}>Mantap</button> */}
                        </div>
                    </div>
                </div>
            </Block>
        </Page>
    )
}

export default Login;



