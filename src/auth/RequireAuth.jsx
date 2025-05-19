import React from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { jwtDecode } from 'jwt-decode'; 

const RequireAuth = ({ allowedRoles }) => {
    const location = useLocation();
    const { auth, logout } = useAuth();

    const getRoleFromToken = (token) => {
        if (!token) return null;

        try {
            const decoded = jwtDecode(token);
            return decoded.role;
        } catch (error) {
            return null;
        }
    };

    const token = localStorage.getItem('authToken');
    const role = getRoleFromToken(token);

    // Redirect to appropriate dashboard if the user is already authenticated
    if (token && location.pathname === '/login') {
        if (role === 'admin') {
            return <Navigate to='/dashboard-admin' replace />;
        } else if (role === 'user') {
            return <Navigate to='/dashboard-user' replace />;
        }
    }

    // Redirect to login page if unauthenticated
    if (!auth?.token) {
        return <Navigate to='/login' state={{ from: location }} replace />;
    }
    
    if (!role || !allowedRoles.includes(role)) {
        if (role === 'admin') {
            return <Navigate to='/dashboard-admin' state={{ from: location }} replace />;
        } else if (role === 'user') {
            return <Navigate to='/dashboard-user' state={{ from: location }} replace />;
        } else {
            return <Navigate to='/login' state={{ from: location }} replace />;
        }
    }

    // Render the child components if the user is authorized
    return <Outlet />;
};

export default RequireAuth;
