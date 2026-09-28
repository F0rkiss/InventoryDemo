import React from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { jwtDecode } from 'jwt-decode'; 

// Segmen pertama URL -> nama menu (sama dengan key di js/menus.js).
// Hanya halaman master data/admin yang dikunci di sini. Rute transaksi (MR, PR, PO, LPB, memo, stok)
// sengaja tidak dikunci karena dibuka lewat link dashboard/notifikasi oleh approver.
// Ini hanya pengaman tampilan: otorisasi sebenarnya tetap harus dilakukan backend.
const SegmentMenu = {
    'role': 'Role',
    'status': 'Status',
    'billing': 'Billing',
    'barang': 'Barang',
    'jenis-barang': 'JenisBarang',
    'sumber-barang': 'SumberBarang',
    'category': 'Categories',
    'tk': 'TingkatKebutuhan',
    'user': 'User',
    'type-request': 'TypeRequest',
    'jenismemo': 'JenisMemo',
    'navigation-groups': 'NavigationGroup',
    'approval-step': 'ApprovalStep',
    'approval-step-purchase': 'ApprovalStepPurchase',
    'approval-step-lpb': 'ApprovalStepLPB',
    'approval-step-memo': 'ApprovalStepMemo',
    'supplier': 'Suplier',
    'mata-uang': 'MataUang',
    'ppn': 'PPN',
    'list-payment-method': 'PaymentType',
    'create-payment-method': 'PaymentType',
    'update-payment-method': 'PaymentType',
    'mutasi': 'InventMutasi',
    'log': 'InventLog',
    'material-request-admin': 'MakeRequestAdmin',
    'memo-admin': 'Memo',
};

const getMenuKeyForPath = (pathname) => SegmentMenu[pathname.split('/')[1]] ?? null;

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
