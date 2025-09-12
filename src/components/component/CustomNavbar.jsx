import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CustomSidebar from './CustomSidebar';
import { useAuth } from '../../auth/AuthContext';
import Notifications from '../../components/component/notifications';
import menus from '../../js/menus';

const CustomNavbar = ({ scrollRootSelector, scrollRootRef }) => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [activeTitle, setActiveTitle] = useState('Inventory MI');
  const [isScrolled, setIsScrolled] = useState(false);
  const { role } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const findActiveTitle = () => {
      const currentPathSegment = location.pathname.split('/')[1];
      if (!currentPathSegment) return 'Dashboard';
      for (const menu of menus) {
        const menuPathSegment = menu.path?.split('/')[1];
        if (currentPathSegment === menuPathSegment) return menu.label;
        if (menu.isAccordion && menu.children) {
          const matchingChild = menu.children.find(
            child => child.path?.split('/')[1] === currentPathSegment
          );
          if (matchingChild) return menu.label;
        }
      }
      return 'Dashboard';
    };
    setActiveTitle(findActiveTitle());
  }, [location.pathname]);

  // 🔒 Add shadow when scrolled (works with window or a custom scroll container)
  useEffect(() => {
    const root =
      (scrollRootRef && scrollRootRef.current) ||
      (scrollRootSelector ? document.querySelector(scrollRootSelector) : window);

    if (!root) return;

    const getScrollTop = () =>
      root === window
        ? window.scrollY || window.pageYOffset
        : root.scrollTop || 0;

    const onScroll = () => setIsScrolled(getScrollTop() > 0);

    onScroll(); // set initial state on mount
    root.addEventListener('scroll', onScroll, { passive: true });
    return () => root.removeEventListener('scroll', onScroll);
  }, [scrollRootSelector, scrollRootRef]);

  return (
    <>
      {openSidebar && (
        <CustomSidebar navOpen={openSidebar} setNavOpen={setOpenSidebar} />
      )}

      <div
        className={`sticky top-0 z-20 px-1 bg-white border-b border-gray-400/30 transition-shadow duration-200 ${
          isScrolled ? 'shadow-md' : 'shadow-none'
        }`}
      >
        <div className="flex justify-between h-16 items-center w-full">
          <span className="flex items-center ios-specific">
            {role && (
              <button
                aria-label="sidebar-button"
                onClick={() => setOpenSidebar(!openSidebar)}
              >
                <i className="bx bx-menu text-black text-3xl ms-4"></i>
              </button>
            )}
            <span className="ml-3 pl-4 border-l-2 text-xl font-semibold max-w-fit whitespace-nowrap">
              {/* {activeTitle} */}
              MI Inventory
            </span>
          </span>
          <Notifications />
        </div>
      </div>
    </>
  );
};

export default CustomNavbar;
