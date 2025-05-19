    import React, { useEffect, useState } from 'react'
    import logo from '../../../assets/image/baru.png'
    import userIcon from '../../../assets/image/user asli victus putih.png'
    import { useAuth } from '../../../auth/AuthContext';
    import { useNavigate } from 'react-router-dom';

    const UserSidebar = ({showProfile = true , navOpen, setNavOpen}) => {

        const [isOpen, setIsOpen] = useState(false)
        const [opens, setOpens] = useState(false)
        const {name, email, role} = useAuth();
        const navigate = useNavigate()
        
        const logout = () => {
            localStorage.removeItem('authToken')
            navigate('/login')
        }

        const toggleAccordion = () => {
            setIsOpen(!isOpen);
        }; 

        useEffect(() => {
            if (navOpen) {
                setTimeout(() => {
                    setOpens(true);
                }, 100); 
            }

        }, [navOpen]);

        
        const isActive = (path) => location.pathname == path;
        return (
            <>
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-350 z-40
                ${opens ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
                onClick={() => [setOpens(false), setTimeout(() => setNavOpen(false), 350)]} 
            ></div>
            
            <div className={`bg-white absolute top-0 left-0 z-50 h-screen transition-all ease-in-out duration-300 ${opens ? 'w-64' : 'w-0'} overflow-hidden rounded-r-3xl`}>
                <div className="navbar bg-white flex flex-col">
                    <h2 className="ms-4 font-bold font-inter text-xl mt-5">INVENTORY</h2>
                    <hr className="w-full mt-4" />
                </div>
                <div className="image flex justify-center flex-col bg-white">
                    <img className="max-w-44 mt-4 mb-4 self-center" src={logo} alt="Logo" />
                    <hr />
                </div>
                {showProfile && (
                    <div className="mx-2 my-3 bg-coklat-mi rounded-md">
                    <button className="flex bg-coklat-mi rounded-md items-center ios-specific py-3 cursor-pointer text-white w-full justify-between" onClick={toggleAccordion}>
                        <div className='flex mt-1 max-w-40'>
                        <img className="ios-image ms-2 translate-y-1" style={{maxWidth: '40px', maxHeight: '40px'}}  src={userIcon} alt="Profile" />
                        <div className="name flex flex-col ms-3 translate-y">
                        <p className="self-start font-inter font-bold text-base capitalize text-ellipsis whitespace-nowrap overflow-hidden max-w-40">{name}</p>
                        <p className="self-start font-inter font-normal text-sm text-ellipsis whitespace-nowrap overflow-hidden max-w-40">{email}</p>
                        </div>
                        </div>
                        <i className={`bx bx-chevron-${isOpen ? 'up' : 'down'} text-4xl text-button-mi ios-chevron ms-1`}></i>
                    </button>
                    <hr className={`border-gray-400 transition-opacity duration-700 mb-2 ${ isOpen ? 'opacity-100' : 'opacity-0'}`} 
                    onTransitionEnd={() => { if (!isOpen) setIsOpen(null);}}
                    />
                    <div className={`transition-max-height duration-1000 ease-in-out overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                        <div className={`bg-coklat-mi rounded-md mt-2 pb-6  transition-opacity duration-700 ${ isOpen ? 'opacity-100' : 'opacity-0'}`}>
                        <button className="ms-3 text-white flex" onClick={() => navigate('/make-request/create-make-request')}>
                            <i className="bx bx-git-pull-request text-2xl me-3" />
                            <span className="text-lg leading-8 mb-5">Make Request</span>
                        </button>
                        <button className="ms-3 text-white flex" onClick={() => navigate('/edit-profile')}>
                            <i className="bx bx-edit-alt text-2xl me-3" />
                            <span className="text-lg leading-8 mb-5">Profile</span>
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
                    <button className="w-100 text-start" onClick={() => navigate('/dashboard-admin')}>
                    <div className={`flex items-center w-60 mb-1 pb-1 rounded-r-full ${isActive('/dashboard-admin') ? 'bg-coklat-mi text-white' : ''}  active:bg-coklat-mi active:text-white pt-2`}>
                        <i className="bx bxs-dashboard text-3xl ms-5 me-4"></i>
                        <p className="text-xl font-medium">Dashboard</p>
                    </div>
                    </button>
                    <button className="w-100 text-start" onClick={() => navigate('/barang-anda')}>
                    <div className={`flex items-center mb-1 w-60 py-1 rounded-r-full ${isActive('/list-barang') ? 'bg-coklat-mi text-white' : ''}  active:bg-coklat-mi active:text-white`}>
                        <i className="bx bx-package text-3xl ms-5 me-4"></i>
                        <p className="text-xl font-medium">Barang Anda</p>
                    </div>
                    </button>
                    <button className="w-100 text-start" onClick={() => navigate('/list-makerequest')}>
                    <div className={`flex items-center mb-1 w-60 py-1 rounded-r-full ${isActive('/list-makerequest') ? 'bg-coklat-mi text-white' : ''} active:bg-coklat-mi active:text-white`}>
                        <i className="bx bx-git-pull-request text-3xl ms-5 me-4"></i>
                        <p className="text-xl font-medium">Make Request</p>
                    </div>
                    </button>
                </div>
        </div>
        </>
        )
    }

    export default UserSidebar