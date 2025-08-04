import React, { useState, useEffect } from 'react'
import userIcon from '../../assets/image/user asli victus putih.png'
import useAuth from '../../hooks/useAuth';
import logo from '../../../public/icons/MI-Inventory-logo.svg'
import { useNavigate } from 'react-router-dom';

const menus = [
    { key: "Dashboard", label: "Dashboard", icon: "bx bxs-dashboard", path: "/dashboard" },
    {
        key: "Barang" || "JenisBarang" || "SumberBarang",
        label: "Barang",
        icon: "bx bx-package",
        isAccordion: true,
        children: [
            { key: "Barang", label: "List Barang", path: "/barang/list-barang" },
            { key: "JenisBarang", label: "Jenis Barang", path: "/jenis-barang/list-jenis-barang" },
            { key: "SumberBarang", label: "Sumber Barang", path: "/sumber-barang/list-sumber-barang" },
        ]
    },
    { key: "Categories", label: "Category", icon: "bx bx-category-alt", path: "/category/list-category" },
    { key: "User", label: "Data User", icon: "bx bxs-user-badge", path: "/user/list-user" },
    {
        key: "MakeRequest" || "TypeRequest",
        label: "Request",
        icon: "bx bx-message-add",
        isAccordion: true,
        children: [
            { key: "MakeRequest", label: "Make Request", path: "/make-request/list-make-request" },
            { key: "TypeRequest", label: "Type Request", path: "/type-request/list-type-request" },
        ]
    },
    { key: "JenisMemo", label: "Jenis Memo", icon: "bx bx-note", path: "/jenismemo/list-jenismemo" },
    { key: "Status", label: "Status", icon: "bx bx-checkbox-checked", path: "/status/list-status" },
    { key: "NavigationGroup", label: "Navigation Group", icon: "bx bx-navigation", path: "/navigation-groups/list-navigation-groups" },
    { key: "Role", label: "Role", icon: "bx bx-tag", path: "/role/list-role" },
    { key: "Billing", label: "Billing", icon: "bx bx-spreadsheet", path: "/billing/list-billing" },
];

const CustomSidebar = ({ showProfile = true, navOpen, setNavOpen }) => {
    const [isOpenProfile, setIsOpenProfile] = useState(false)
    const [opens, setOpens] = useState(false)
    const [openAccordions, setOpenAccordions] = useState({});

    const { name, email, role, navigation_menu } = useAuth();
    const handleNavigation = useNavigate()

    const allowedMenus = menus.filter(menu =>
        navigation_menu?.some(nav => nav.name === menu.key)
    );

    const logout = () => {
        localStorage.removeItem('authToken')
        handleNavigation('/login')
    }

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
        const body = document.getElementById('layouts')
        if (body) {
            if (opens) {
                body.classList.add(`!overflow-y-hidden`)
            } else {
                body.classList.remove(`!overflow-y-hidden`)
            }
        }
    }, [opens])

    const isActive = (path) => location.pathname.startsWith(path);
    return (
        <>
            <div className={`fixed inset-0 bg-black transition-opacity duration-350 z-40
            ${opens ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
                onClick={() => [setOpens(false), setTimeout(() => setNavOpen(false), 350)]}
            />
            <div className={`bg-white absolute top-0 left-0 z-50 h-screen transition-all ease-in-out duration-300 ${opens ? 'w-[18rem] overflow-y-scroll max-h-full' : 'w-0'} overflow-hidden `}>
                <div className="
                flex justify-between place-items-center m-5">
                    <img src={logo}  style={{ maxWidth: '30px', maxHeight: '30px' }} className='' alt="" />
                    <i className='bx bx-x text-4xl ' onClick={() => [setOpens(false), setTimeout(() => setNavOpen(false), 350)]}></i>
                </div>
                {   showProfile && (
                    <div className="mx-2 my-3 bg-coklat-mi rounded-md">
                        <button className="flex rounded-md items-center py-3 pb-4 px-3 text-white w-full justify-between" onClick={toggleAccordion}>
                            <div className='flex max-w-40'>
                                <i className='bx bxs-user-circle text-5xl'></i>
                                <div className="name flex flex-col ms-3 translate-y">
                                    <p className="self-start font-inter font-bold text-base capitalize text-ellipsis whitespace-nowrap overflow-hidden max-w-40">{name}</p>
                                    <p className="self-start font-inter font-normal text-sm text-ellipsis whitespace-nowrap overflow-hidden max-w-40">{email}</p>
                                </div>
                            </div>
                            <i className={`bx bx-chevron-${isOpenProfile ? 'up' : 'down'} text-4xl text-button-mi ios-chevron me-1`}></i>
                        </button>
                        <div className={`transition-max-height duration-1000 ease-in-out overflow-hidden ${isOpenProfile ? 'max-h-96' : 'max-h-0'}`}>
                            <div className={`bg-coklat-mi rounded-md mt-2 pb-6 transition-opacity duration-300 ${isOpenProfile ? 'opacity-100' : 'opacity-0'}`}>
                                <button className="ms-3 mb-2 text-white flex " onClick={() => handleNavigation('/edit-profile')}>
                                    <i className="bx bxs-user-detail text-2xl me-3" />
                                    <span className="text-lg leading-8">Profile</span>
                                </button>
                                <button className="ms-3 text-white flex" onClick={logout}>
                                    <i className="bx bx-log-out text-2xl me-3" />
                                    <span className="text-lg leading-8">Log Out</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <hr />
                <div className="bottom-nav flex flex-col font-inter mt-1">
                    {/* Temporary */}
                    <button className="w-100 text-start" onClick={() => handleNavigation('/dashboard')}>
                        <div className={`flex items-center w-60 mb-1 py-1 rounded-r-full ${isActive('/dashboard-admin') ? 'bg-coklat-mi text-white' : 'hover:bg-stone-200'} `}>
                            <i className="bx bxs-dashboard text-3xl ms-5 me-4"></i>
                            <p className="text-lg font-medium">Dashboard</p>
                        </div>
                    </button>
                    {allowedMenus.map(menu => (
                        menu.isAccordion ? (
                            <div key={menu.key}>
                            <button
                                onClick={() => handleAccordionToggle(menu.key)}
                                className="flex items-center mb-1 w-full rounded-r-full justify-between hover:bg-stone-200"
                            >
                                <div className={`flex items-center mb-1 w-60 py-1 rounded-r-full hover:bg-stone-200 `}>
                                    <i className={`${menu.icon} text-3xl ms-5 me-4`}></i>
                                    <p className='text-lg font-medium'>{menu.label}</p>
                                </div>
                                <i className={`bx bx-chevron-${openAccordions[menu.key] ? 'up' : 'down'} text-4xl ios-chevron me-3`}></i>
                            </button>
                            <div className={`transition-max-height overflow-hidden ${openAccordions[menu.key] ? 'max-h-96' : 'max-h-0'}`}>
                                {menu.children.filter(sub => navigation_menu.some(nav => nav.name === sub.key)).map(sub => (
                                    <button key={sub.key} onClick={() => handleNavigation(sub.path)} className=''>
                                        <div className={`flex items-center ms-8 border-l-2 border-stone-400 w-60 py-2 rounded-r-full ${isActive(sub.path) ? 'bg-coklat-mi text-white' : 'hover:bg-stone-200'} `}>
                                            <p className='text-lg font-medium ps-10'>{sub.label}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        ) : (
                            <button key={menu.key} onClick={() => handleNavigation(menu.path)} className={`rounded-r-full ${isActive(menu.path) ? 'bg-coklat-mi text-white' : 'hover:bg-stone-200'}`}>
                            <div className={`flex items-center mb-1 w-60 py-1`}>
                                <i className={`${menu.icon} text-3xl ms-5 me-4`}></i>
                                <p className='text-lg font-medium'>{menu.label}</p>
                            </div>
                            </button>
                        )
                        ))}

                </div>
            </div>
        </>
    )
}


export default CustomSidebar