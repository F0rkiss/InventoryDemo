import { Page, Block } from 'framework7-react'
import CustomNavbar from '../component/CustomNavbar'
import React, { useState, useEffect } from 'react'
import LogoMi from '../../assets/image/baru.png'
import api from '../../api/api';
import barangIcon from '../../assets/image/dashboard-image/package-regular-120.png'
import departmentIcon from '../../assets/image/dashboard-image/building-regular-120.png'
import divisiIcon from '../../assets/image/dashboard-image/briefcase-regular-120.png'
import userIcon from '../../assets/image/dashboard-image/user-circle-regular-120.png'
import MRIcon from '../../assets/image/dashboard-image/spreadsheet-regular-120.png'
import RAIcon from '../../assets/image/dashboard-image/cog-regular-120.png'
import Loader from '../component/Loader';
import { useNavigate } from 'react-router-dom';
import Layout from '../component/Layout';

function Dashboard() {

    const [items, setItems] = useState({});
    const [barang, setBarang] = useState([]);
    const [loading, setLoading] = useState(false);
    const [contentVisible, setContentVisible] = useState(false)
    const [showPending, setShowPending] = useState(true)
    const [disabled, setDisabled] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const interval = setInterval(() => {
            setShowPending(prev => !prev)
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async() => {
        try {
            setLoading(true)
            // const response = await api.get('dashboard/admin')
            setItems(response.data)
        } catch (error) {

        } finally {
            setLoading(false)
            setTimeout(() => setContentVisible(true), 50)
        }
    };



    return (
        <Layout title={'Dashboard'}>
            <Block>
                { loading ? (
                    <Loader Class={'mt-60'} />
                ) : (
                    <>
                <div className={`transition-opacity duration-700 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <p className='uppercase text-center font-extrabold text-xl'>inventory</p>
                    <img src={LogoMi} className='max-w-52 mx-auto mt-4 mb-6'/>

                    <div className='bg-white rounded-md shadow'>
                        <div className="content px-2 pb-2 pt-4">
                            <div className="barang  bg-cyan-400 rounded-full mb-4">
                                <div className="barang-content flex justify-between items-center rounded-full max-h-20">
                                    <div className="left-side text-white py-3 flex flex-col items-start w-1/2 ">
                                        <p className={`text-3xl font-bold w-32 text-center`}>{items.barang}</p>
                                        <p className='font-medium w-32 text-center'>Barang</p>
                                    </div>
                                        <img src={barangIcon} className='opacity-50 max-w-16 me-2' alt="" />
                                </div>
                            </div>
                            <div className="department bg-teal-400 rounded-full mb-4">
                                <div className="department-content flex justify-between items-center z-10 overflow-hidden rounded-full max-h-20">
                                    <div className="left-side text-white py-3 flex flex-col items-start w-1/2 ">
                                        <p className={`text-3xl font-bold w-32 text-center`}>{items.department}</p>
                                        <p className='font-medium w-32 text-center'>Department</p>
                                    </div>
                                        <img src={departmentIcon} className='opacity-50 max-w-16 me-2' alt="" />
                                </div>
                            </div>
                            <div className="divisi bg-violet-400 rounded-full mb-4">
                                <div className="divisi-content flex justify-between items-center z-10 overflow-hidden rounded-full max-h-20">
                                    <div className="left-side text-white py-3 flex flex-col items-start w-1/2 ">
                                        <p className='text-3xl font-bold w-32 text-center '>{items.divisi}</p>
                                        <p className='font-medium w-32 text-center'>Divisi</p>
                                    </div>
                                        <img src={divisiIcon} className='opacity-50 max-w-16 me-2' alt="" />
                                </div>
                            </div>
                            <div className="user bg-red-400 rounded-full mb-4">
                                <div className="user-content flex justify-between items-center z-10 overflow-hidden rounded-full max-h-20">
                                    <div className="left-side text-white py-3 flex flex-col items-start w-1/2 ">
                                        <p className='text-3xl font-bold w-32 text-center'>{items.user}</p>
                                        <p className='font-medium w-32 text-center'>User</p>
                                    </div>
                                        <img src={userIcon} className='opacity-50 max-w-16 me-2' alt="" />
                                </div>
                            </div>
                            <div className="MR bg-orange-400 rounded-full mb-4">
                                <div className="MR-content relative flex justify-between items-center overflow-hidden rounded-full">
                                <div className={`left-side py-3 text-white flex flex-col items-start w-24`}>
                                        <div className={`total-mr-count duration-1000 ${showPending ? 'opacity-100' : 'opacity-0'}`}>
                                            <p className='text-center max-sm:text-2xl text-3xl font-bold w-32 overflow-hidden whitespace-nowrap max-sm:text-ellipsis'>{items.makerequest}</p>
                                            <p className='font-medium w-full text-center'>Make Request</p>
                                        </div>
                                        <div className={`teks -z-0 absolute text-white flex flex-col items-start justify-center transition-opacity duration-1000 ${showPending ? 'opacity-0' : 'opacity-100'}`}>
                                                <p className='text-center max-sm:text-2xl text-3xl font-bold w-32 overflow-hidden whitespace-nowrap  max-sm:text-ellipsis'>{items.mrPending}</p>
                                                <p className=' text-center font-medium w-32'>MR Pending</p>
                                        </div>
                                    </div>
                                    <div className='center-button z-20'>
                                        <button className='bg-slate-400 shadow-sm rounded text-white px-3 py-1 text-sm max-sm:text-xs whitespace-nowrap ' onClick={() => navigate('/table-mr')} >Tabel MR</button>
                                    </div>
                                    <div className='right-side relative w-max overflow-hidden flex items-center justify-end'>
                                        <img src={MRIcon} className={`max-w-16 me-2 opacity-50`} alt="" />
                                    </div>
                                </div>
                            </div>
                            <div className="billing bg-emerald-400 rounded-full mb-4">
                                <div className="relative billing-content flex justify-between items-center z-10 overflow-hidden rounded-full ">
                                    <div className={`left-side text-white py-3 flex flex-col items-start w-24`}>
                                        <div className={`total-billing-count -z-10 duration-1000 ${showPending ? 'opacity-100' : 'opacity-0'}`}>
                                            <p className='text-center max-sm:text-2xl text-3xl font-bold w-32 overflow-hidden whitespace-nowrap  max-sm:text-ellipsis'>{items.billing}</p>
                                            <p className='text-center font-medium w-full'>Billing</p>
                                        </div>
                                        <div className={`teks -z-10 absolute text-white flex flex-col items-start justify-center transition-opacity duration-1000 ${showPending ? 'opacity-0' : 'opacity-100'}`}>
                                                <p className=' text-center max-sm:text-2xl text-3xl font-bold w-32 overflow-hidden whitespace-nowrap '>{items.billing3MonthWarning}</p>
                                                <p className=' text-center  font-medium w-32'>Billing Expire</p>
                                        </div>
                                    </div>
                                    <div className='center-button'>
                                        <button className='bg-slate-400 shadow-sm rounded text-white px-3 py-1 text-sm max-sm:text-xs whitespace-nowrap' onClick={() => navigate('/table-billing')}>Tabel Billing</button>
                                    </div>
                                    <div className='right-side relative w-max overflow-hidden flex items-center justify-end'>
                                        <img src={RAIcon} className={`max-w-16 me-2 transition-opacity duration-1000 opacity-50`} alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </>
                )}        
            </Block>
        </Layout>
  )
}

export default Dashboard