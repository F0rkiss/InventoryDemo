// hooks/useMenuAccess.jsc
import useAuth from './useAuth';

export default function useMenuAccess(menuName) {
  const { navigation_menu } = useAuth();
  // menuName bisa "JenisMemo", "Barang", dst
  const menu = navigation_menu?.find(m => m.name === menuName) || {};

  // Return seluruh akses, fallback ke 0 (not allowed)
  return {
    canCreate: menu.create_access === 1,
    canRead: menu.read_access === 1,
    canUpdate: menu.update_access === 1,
    canDelete: menu.delete_access === 1
  };
}