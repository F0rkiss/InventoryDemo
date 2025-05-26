import React, { useState, useEffect } from 'react'
import userIcon from '../../assets/image/user asli victus putih.png'
import useAuth from '../../hooks/useAuth';
import logo from '../../assets/image/baru.png'
import { useNavigate } from 'react-router-dom';

const CustomSidebar = ({ showProfile = true, navOpen, setNavOpen }) => {
    const [isOpenProfile, setIsOpenProfile] = useState(false)
    const [isOpenItem, setIsOpenItem] = useState(false)
    const [opens, setOpens] = useState(false)
    const { name, email, role } = useAuth();
    const handleNavigation = useNavigate()

    const logout = () => {
        localStorage.removeItem('authToken')
        handleNavigation('/login')
    }

    const toggleAccordion = () => {
        setIsOpenProfile(!isOpenProfile);
    };

    const toggleAccordionItem = () => {
        setIsOpenItem(!isOpenItem);
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
            <div className={`bg-white absolute top-0 left-0 z-50 h-screen transition-all ease-in-out duration-300 ${opens ? 'w-64 overflow-y-scroll max-h-full' : 'w-0'} overflow-hidden `}>
                <div className="navbar bg-white flex flex-col">
                    <h2 className="ms-4 font-bold font-inter text-xl mt-5">INVENTORY</h2>
                    <hr className="w-full mt-4" />
                </div>
                {/* <div className="image flex justify-center flex-col bg-white">
                    <img className="max-w-44 mt-4 mb-4 self-center" src={logo} alt="Logo" />
                    <hr />
                </div> */}
                {   showProfile && (
                    <div className="mx-2 my-3 bg-coklat-mi rounded-md">
                        <button className="flex bg-coklat-mi rounded-md items-center ios-specific py-3 cursor-pointer text-white w-full justify-between" onClick={toggleAccordion}>
                            <div className='flex mt-1 max-w-40'>
                                <img className="ios-image ms-3 translate-y-1" style={{ maxWidth: '40px', maxHeight: '40px' }} src={userIcon} alt="Profile" />
                                <div className="name flex flex-col ms-3 translate-y">
                                    <p className="self-start font-inter font-bold text-base capitalize text-ellipsis whitespace-nowrap overflow-hidden max-w-40">{name}</p>
                                    <p className="self-start font-inter font-normal text-sm text-ellipsis whitespace-nowrap overflow-hidden max-w-40">{email}</p>
                                </div>
                            </div>
                            <i className={`bx bx-chevron-${isOpenProfile ? 'up' : 'down'} text-4xl text-button-mi ios-chevron me-1`}></i>
                        </button>
                        <hr className={`border-gray-400 transition-opacity duration-700 mb-2 ${isOpenProfile ? 'opacity-100' : 'opacity-0'}`}
                            onTransitionEnd={() => { if (!isOpenProfile) setIsOpenProfile(null); }}
                        />
                        <div className={`transition-max-height duration-1000 ease-in-out overflow-hidden ${isOpenProfile ? 'max-h-96' : 'max-h-0'}`}>
                            <div className={`bg-coklat-mi rounded-md mt-2 pb-6  transition-opacity duration-300 ${isOpenProfile ? 'opacity-100' : 'opacity-0'}`}>
                                <button className={`ms-3 text-white flex ${role === 'user' && 'hidden'}`} onClick={() => handleNavigation('/make-request/personal-make-request')}>
                                    <i className="bx bx-message-add text-2xl me-3 mb-2" />
                                    <span className="text-lg leading-8">Make Request Anda</span>
                                </button>
                                <button className="ms-3 text-white flex" onClick={() => handleNavigation('/edit-profile')}>
                                    <i className="bx bx-edit-alt text-2xl me-3 mb-2" />
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
                    <button className="w-100 text-start" onClick={role === 'user' ? () => handleNavigation('/dashboard-user') : () => handleNavigation('/dashboard-admin') }>
                        <div className={`flex items-center w-60 mb-1 pb-1 rounded-r-full ${isActive('/dashboard-admin') ? 'bg-coklat-mi text-white' : ''}  active:bg-coklat-mi active:text-white pt-2`}>
                            <i className="bx bxs-dashboard text-3xl ms-5 me-4"></i>
                            <p className="text-lg font-medium">Dashboard</p>
                        </div>
                    </button>
                    {/* <button className="w-100 text-start" onClick={role === 'user' ? () => handleNavigation('/barang-anda') : () => handleNavigation('/barang/list-barang')}>
                        <div className={`flex items-center mb-1 w-60 py-1 rounded-r-full ${isActive('/barang') ? 'bg-coklat-mi text-white' : ''}  active:bg-coklat-mi active:text-white`}>
                            <i className="bx bx-package text-3xl ms-5 me-4"></i>
                            <p className="text-lg font-medium">{role === 'user' ? 'Barang Anda' : 'Barang'}</p>
                        </div>
                    </button> */}
                    <button className="w-100 text-start" onClick={role === 'user' ? () => handleNavigation('/barang-anda') : toggleAccordionItem}>
                        <div className={`flex items-center mb-1 w-60 py-1 rounded-r-full `}>
                            <i className="bx bx-package text-3xl ms-5 me-4"></i>
                            <p className="text-lg font-medium">{role === 'user' ? 'Barang Anda' : 'Barang'}</p>
                            <i className={`ms-20 bx bx-chevron-${isOpenItem ? 'up' : 'down'} text-4xl ios-chevron me-1`}></i>
                        </div>
                    </button>
                    {/* More feature barang */}
                    <div className={`transition-max-height overflow-hidden ${isOpenItem ? 'max-h-96' : 'max-h-0'}`}>
                        <button className="w-100 text-start" onClick={role === 'user' ? () => handleNavigation('/barang-anda') : () => handleNavigation('/jenis-barang/list-jenis-barang')}>
                            <div className={`flex items-center mb-1 w-60 py-2 rounded-r-full ${isActive('/jenis-barang/list-jenis-barang') ? 'bg-coklat-mi text-white' : ''}  active:bg-coklat-mi active:text-white`}>
                                <p className="text-lg font-medium ml-20">Jenis Barang</p>
                            </div>
                        </button>
                        <button className="w-100 text-start" onClick={role === 'user' ? () => handleNavigation('/barang-anda') : () => handleNavigation('/sumber-barang/list-sumber-barang')}>
                            <div className={`flex items-center mb-1 w-60 py-2 rounded-r-full ${isActive('/sumber-barang/list-sumber-barang') ? 'bg-coklat-mi text-white' : ''}  active:bg-coklat-mi active:text-white`}>
                                <p className="text-lg font-medium ml-20">Sumber Barang</p>
                            </div>
                        </button>
                    </div>
                    {/* Jika Bukan Admin Tidak Muncul */}
                    {
                        role == 'admin' && 
                        <div className={`hidden-to-user `}>
                            <button className="w-100 text-start" onClick={() => handleNavigation('/department/list-department')}>
                                <div className={`flex items-center mb-1 w-60 py-1 rounded-r-full ${isActive('/department') ? 'bg-coklat-mi text-white' : ''} active:bg-coklat-mi active:text-white`}>
                                    <i className="bx bx-building text-3xl ms-5 me-4"></i>
                                    <p className="text-lg font-medium">Department</p>
                                </div>
                            </button>
                            <button className="w-100 text-start" onClick={() => handleNavigation('/divisi/list-divisi')}>
                                <div className={`flex items-center mb-1 w-60 py-1 rounded-r-full ${isActive('/divisi') ? 'bg-coklat-mi text-white' : ''} active:bg-coklat-mi active:text-white`}>
                                    <i className="bx bx-briefcase text-3xl ms-5 me-4"></i>
                                    <p className="text-lg font-medium">Divisi</p>
                                </div>
                            </button>
                            <button className="w-100 text-start" onClick={() => handleNavigation('/category/list-category')}>
                                <div className={`flex items-center mb-1 w-60 py-1 rounded-r-full ${isActive('/category') ? 'bg-coklat-mi text-white' : ''} active:bg-coklat-mi active:text-white`}>
                                    <i className="bx bx-category-alt text-3xl ms-5 me-4"></i>
                                    <p className="text-lg font-medium">Category</p>
                                </div>
                            </button>
                            <button className="w-100 text-start" onClick={() => handleNavigation('/user/list-user')}>
                                <div className={`flex items-center mb-1 w-60 py-1 rounded-r-full ${isActive('/user') ? 'bg-coklat-mi text-white' : ''} active:bg-coklat-mi active:text-white`}>
                                    <i className="bx bx-user-circle text-3xl ms-5 me-4"></i>
                                    <p className="text-lg font-medium">Data User</p>
                                </div>
                            </button>
                            <button className="w-100 text-start" onClick={() => handleNavigation('/navigations/list-navigations')}>
                                <div className={`flex items-center mb-1 w-60 py-1 rounded-r-full ${isActive('/navigations/list-navigations') ? 'bg-coklat-mi text-white' : ''} active:bg-coklat-mi active:text-white`}>
                                    < i className='bx bx-navigation text-3xl ms-5 me-4'  ></i> 
                                    <p className="text-lg font-medium">User Navigation</p>
                                </div>
                            </button>
                            <button className="w-100 text-start" onClick={() => handleNavigation('/role/list-role')}>
                                <div className={`flex items-center mb-1 w-60 py-1 rounded-r-full ${isActive('/role/list-role') ? 'bg-coklat-mi text-white' : ''} active:bg-coklat-mi active:text-white`}>
                                    < i className='bx  bx-tag text-3xl ms-5 me-4' ></i> 
                                    <p className="text-lg font-medium">Role</p>
                                </div>
                            </button>
                            <button className="w-100 text-start" onClick={() => handleNavigation('/billing/list-billing')}>
                                <div className={`flex items-center mb-1 w-60 py-1 rounded-r-full ${isActive('/billing') ? 'bg-coklat-mi text-white' : ''} active:bg-coklat-mi active:text-white`}>
                                    <i className="bx bx-spreadsheet text-3xl ms-5 me-4"></i>
                                    <p className="text-lg font-medium">Billing</p>
                                </div>
                            </button>
                    </div>
                    }
                    
                    <button className="w-100 text-start" onClick={role === 'user' ? () => handleNavigation('/make-request/personal-make-request') :() => handleNavigation('/make-request/list-make-request')}>
                        <div className={`flex items-center mb-1 w-60 py-1 rounded-r-full ${isActive('/make-request') ? 'bg-coklat-mi text-white' : ''} active:bg-coklat-mi active:text-white`}>
                            <i className="bx bx-message-add text-3xl ms-5 me-4"></i>
                            <p className="text-lg font-medium">{role == 'user' ? 'Make Request' : 'Data MR'}</p>
                        </div>
                    </button>
                </div>
            </div>
        </>
    )
}


export default CustomSidebar