import React, { useState, useEffect } from 'react';
import userIcon from '../../assets/image/user asli victus putih.png';
import useAuth from '../../hooks/useAuth';
import logo from '../../../public/icons/MI-Inventory-logo.svg';
import { useNavigate } from 'react-router-dom';
import menus from '../../js/menus';

const CustomSidebar = ({ showProfile = true, navOpen, setNavOpen }) => {
    const [isOpenProfile, setIsOpenProfile] = useState(false);
    const [opens, setOpens] = useState(false);
    const [openAccordions, setOpenAccordions] = useState({});
    const { name, email, role, navigation_menu } = useAuth();
    const handleNavigation = useNavigate();

    const allowedMenus = menus.filter(menu =>
        navigation_menu?.some(nav => nav.name === menu.key)
    );

    const logout = () => {
        localStorage.removeItem('authToken');
        handleNavigation('/login');
    };

    const toggleAccordion = () => {
        setIsOpenProfile(!isOpenProfile);
    };

    const handleAccordionToggle = (key) => {
        setOpenAccordions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    useEffect(() => {
        if (navOpen) {
            setTimeout(() => {
                setOpens(true);
            }, 100);
        }
    }, [navOpen]);

    useEffect(() => {
        const body = document.getElementById('layouts');
        if (body) {
            if (opens) {
                body.classList.add('!overflow-y-hidden');
            } else {
                body.classList.remove('!overflow-y-hidden');
            }
        }
    }, [opens]);

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <>
            <div className={`fixed inset-0 bg-black/50 transition-opacity duration-350 z-40
            ${opens ? 'opacity-100 backdrop-blur-sm' : 'opacity-0 pointer-events-none'}`}
                onClick={() => [setOpens(false), setTimeout(() => setNavOpen(false), 350)]}
            />
            <div className={`bg-white absolute px-3 top-0 left-0 z-50 h-screen ease-out ${opens ? 'opacity-100 w-[19rem] overflow-y-scroll max-h-full transition-all duration-300' : 'w-0 opacity-0 transition-all duration-300'} overflow-hidden`}>
                <div className="flex justify-between items-center my-5 mx-3 px-2">
                    <img src={logo} style={{ maxWidth: '32px', maxHeight: '30px' }} className='ps-1' alt="" />
                    <button className='w-[29px]' onClick={() => [setOpens(false), setTimeout(() => setNavOpen(false), 350)]}>
                        <i className='bx bx-x text-4xl'></i>
                    </button>
                </div>
                { showProfile && (
                    <div className="my-3 bg-coklat-mi rounded-lg">
                        <button className="flex items-center py-3 pb-4 px-4 text-white w-full justify-between" onClick={toggleAccordion}>
                            <div className='flex max-w-45 ps-1'>
                                <i className='bx bxs-user-circle place-self-center text-4xl'></i>
                                <div className="name flex flex-col ms-3 translate-y">
                                    <p className="self-start font-inter font-semibold text-base capitalize text-ellipsis whitespace-nowrap overflow-hidden max-w-40">{name}</p>
                                    <p className="self-start font-inter font-regular text-sm text-ellipsis whitespace-nowrap overflow-hidden max-w-40">{email}</p>
                                </div>
                            </div>
                            <i className={`bx bx-chevron-${isOpenProfile ? 'up' : 'down'} text-4xl text-button-mi ios-chevron`}></i>
                        </button>
                        <div className={`transition-max-height duration-1000 ease-in-out overflow-hidden ${isOpenProfile ? 'max-h-96' : 'max-h-0'}`}>
                            <div className={`bg-coklat-mi space-y-2 rounded-md px-3 pb-4 transition-opacity duration-300 ${isOpenProfile ? 'opacity-100' : 'opacity-0'}`}>
                                <button className="px-4 py-1 text-white rounded-lg transition-color duration-200 hover:bg-stone-900 w-full" onClick={() => handleNavigation('/edit-profile')}>
                                    <div className='flex items-center rounded-lg'>
                                        <i className="bx bxs-user-detail text-2xl me-2" />
                                        <span className="text-lg leading-8">Profile</span>
                                    </div>
                                </button>
                                <button className="px-4 py-1 text-white rounded-lg hover:bg-stone-900 w-full" onClick={logout}>
                                    <div className='flex items-center rounded-lg'>
                                        <i className="bx bx-log-out text-2xl me-2" />
                                        <span className="text-lg leading-8">Log out</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="bottom-nav flex flex-col font-inter mt-1 mb-2">
                    <button className={`rounded-lg my-1 ${isActive('/dashboard') ? 'bg-coklat-mi text-white' : 'hover:bg-stone-200 transition-colors duration-200'}`} onClick={() => handleNavigation('/dashboard')}>
                        <div className={`flex items-center w-60 py-1`}>
                            <i className="bx bxs-dashboard text-3xl ms-5 me-4"></i>
                            <p className="text-lg font-medium">Dashboard</p>
                        </div>
                    </button>
                    {allowedMenus.map(menu => (
                        menu.isAccordion ? (
                            <div key={menu.key}>
                                <button
                                    onClick={() => handleAccordionToggle(menu.key)}
                                    className="flex items-center my-1 justify-between rounded-lg hover:bg-stone-200 transition-colors duration-200"
                                >
                                    <div className={`flex items-center py-1`}>
                                        <i className={`${menu.icon} text-3xl ms-5 me-4`}></i>
                                        <p className='text-lg font-medium'>{menu.label}</p>
                                    </div>
                                    <i className={`bx bx-chevron-${openAccordions[menu.key] ? 'up' : 'down'} text-4xl ios-chevron me-3`}></i>
                                </button>
                                <div className={`transition-max-height duration-300 overflow-hidden ${openAccordions[menu.key] ? 'max-h-96' : 'max-h-0'}`}>
                                    {menu.children.filter(sub => navigation_menu.some(nav => nav.name === sub.key)).map(sub => (
                                        <button key={sub.key} onClick={() => handleNavigation(sub.path)} className='rounded-r-lg'>
                                            <div className={`flex items-center ms-8 transition-all duration-200 border-l-2 hover:border-transparent hover:rounded-r-lg border-stone-200 py-2 ${isActive(sub.path) ? 'bg-coklat-mi text-white rounded-r-lg hover:border-stone-200' : 'hover:bg-stone-200'}`}>
                                                <p className='text-lg font-medium ps-10'>{sub.label}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <button key={menu.key} onClick={() => handleNavigation(menu.path)} className={`rounded-lg my-1 ${isActive(menu.path) ? 'bg-coklat-mi text-white' : 'hover:bg-stone-200 transition-colors duration-200'}`}>
                                <div className={`flex items-center w-60 py-1`}>
                                    <i className={`${menu.icon} text-3xl ms-5 me-4`}></i>
                                    <p className='text-lg font-medium'>{menu.label}</p>
                                </div>
                            </button>
                        )
                    ))}
                </div>
            </div>
        </>
    );
};

export default CustomSidebar;
