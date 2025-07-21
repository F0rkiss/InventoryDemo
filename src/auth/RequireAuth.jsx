import React from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { jwtDecode } from 'jwt-decode'; 

const PathMenu = [
    { menu: "Dashboard", path: "/dashboard" },
    { menu: "Role", path: "/role/list-role" },
    { menu: "Status", path: "/status/list-status" },
    { menu: "Billing", path: "/billing/list-billing" },
    { menu: "Barang", path: "/barang/list-barang" },
    { menu: "JenisBarang", path: "/jenis-barang/list-jenis-barang" },
    { menu: "SumberBarang", path: "/sumber-barang/list-sumber-barang" },
    { menu: "Categories", path: "/category/list-category" },
    { menu: "User", path: "/user/list-user" },
    { menu: "MakeRequest", path: "/make-request/list-make-request" },
    { menu: "JenisMemo", path: "/jenismemo/list-jenismemo" },
    { menu: "NavigationGroup", path: "/navigation-groups/list-navigation-groups" },
    { menu: "NavigationMenu", path: "/navigation-menu/list-navigation-menu" },
]

const getMenuKeyForPath = (pathname) => {
    if (pathname === '/dashboard') return null;
    const found = PathMenu.find(item => pathname.startsWith(item.path));
    return found ? found.menu : null;
};

const RequireAuth = () => {
    const location = useLocation();
    const { auth, navigation_menu } = useAuth();

    // Redirect to login page if unauthenticated
    if (!auth?.token) {
        return <Navigate to='/login' state={{ from: location }} replace />;
    }

    const requiredMenu = getMenuKeyForPath(location.pathname);

    if (requiredMenu && !navigation_menu?.some(nav => nav.name === requiredMenu)) {
        // Tidak punya akses menu → redirect ke dashboard
        return <Navigate to='/dashboard' replace />;
    }

    // Render the child components if the user is authorized
    return <Outlet />;
};

export default RequireAuth;
