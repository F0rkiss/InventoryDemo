import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CustomSidebar from './CustomSidebar';
import { useAuth } from '../../auth/AuthContext';
import Notifications from '../../components/component/notifications';
import menus from '../../js/menus';

const CustomNavbar = () => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [activeTitle, setActiveTitle] = useState('Inventory MI');
  const { role } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Fungsi baru untuk mencari judul menu yang sesuai dengan segmen path
    const findActiveTitle = () => {
      // Ambil segmen path pertama dari URL saat ini (contoh: 'role' dari '/role/create-role')
      const currentPathSegment = location.pathname.split('/')[1];

      // Jika URL adalah root (hanya '/'), kembalikan judul default
      if (!currentPathSegment) {
        return 'Dashboard';
      }
      
      // Cari menu di level utama atau di dalam children yang memiliki segmen path yang sama
      for (const menu of menus) {
        const menuPathSegment = menu.path?.split('/')[1];

        // Jika segmen path cocok, kita sudah menemukan menu induknya
        if (currentPathSegment === menuPathSegment) {
            // Kita ingin menampilkan label dari menu induk (misalnya "Role"), bukan sub-menunya.
            return menu.label;
        }

        // Jika menu adalah accordion, periksa juga children-nya
        if (menu.isAccordion && menu.children) {
          const matchingChild = menu.children.find(child => child.path?.split('/')[1] === currentPathSegment);
          if (matchingChild) {
            // Jika child cocok, kembalikan label dari menu induk
            return menu.label;
          }
        }
      }
      
      // Jika tidak ada yang cocok, kembalikan judul default
      return 'Dashboard';
    };

    const newTitle = findActiveTitle();
    setActiveTitle(newTitle);
  }, [location.pathname]);

  return (
    <>
      {openSidebar && <CustomSidebar navOpen={openSidebar} setNavOpen={setOpenSidebar} />}
      
      <div className="flex flex-col bg-white border-b-2 border-gray-400/20 z-10 px-1">
        <div className="flex justify-between h-16 items-center w-full">
          <span className="flex items-center ios-specific">
            {role && (
              <button aria-label='sidebar-button' onClick={() => setOpenSidebar(!openSidebar)}>
                <i className="bx bx-menu text-black text-3xl ms-4"></i>
              </button>
            )}
            <span className="ml-3 pl-4 border-l-2 text-xl font-medium max-w-fit whitespace-nowrap">
              {activeTitle}
            </span>
          </span>
          <Notifications />
        </div>
      </div>
    </>
  );
};

export default CustomNavbar;