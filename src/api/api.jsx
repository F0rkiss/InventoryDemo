import axios from 'axios';
import encryptData from '../auth/CobaIndex';
import { Navigate, replace, useNavigate } from 'react-router-dom';
import { demoApiAdapter, isDemoMode } from './demoAdapter';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_URL}/api`,
    ...(isDemoMode ? { adapter: demoApiAdapter } : {}),
});

const generateAccessToken = async () => {
    const tokenString = `${import.meta.env.VITE_TOKEN}`
    const currentDate = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const tokenWithTimestamp = `${tokenString}${currentDate}`;
    return await encryptData(tokenWithTimestamp);
};

// Add a request interceptor to include the Bearer token
api.interceptors.request.use(
    async(config) => {
        const token = localStorage.getItem('authToken') || '';

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        const newAccessToken = await generateAccessToken();
        config.headers['AuthToken'] = newAccessToken;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status == 401 && location.pathname !== '/login') {
            localStorage.removeItem('authToken')
            window.location.reload()

        }
        return Promise.reject(error)
    }
)

export default api;
