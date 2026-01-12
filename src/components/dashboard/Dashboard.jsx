import { Page, Block } from 'framework7-react'
import CustomNavbar from '../component/CustomNavbar'
import React, { useState, useEffect } from 'react'
import LogoMi from '../../assets/image/baru.png'
import api from '../../api/api';
import Loader from '../component/Loader';
import { useNavigate } from 'react-router-dom';
import Layout from '../component/Layout';
import { useAuth } from '../../auth/AuthContext';
import MemoCard from '../component/cards/MemoCard';
import getCurrentDate from '../../helper/CurrentDateHelper';

function Dashboard() {

    const [items, setItems] = useState({});
    const mr = items.makerequest;
    const mr_pending = items.mr_proses;
    const pr = items.purchaseRequest;
    const po = items.purchaseOrder;
    const lpb = items.lpb;
    const memo = items.memo;
    const memo_pending = items.memo_proses;
    const barang = items.barang;
    const billing = items.billing;

    const [memoData, setMemoData] = useState([]);
    // const [barang, setBarang] = useState([]);
    const [loading, setLoading] = useState(false);
    const [contentVisible, setContentVisible] = useState(false)
    const [disabled, setDisabled] = useState(false)
    const [currentTime, setCurrentTime] = useState(getCurrentDate(true));
    const { name, email, role, navigation_menu } = useAuth();
    const navigate = useNavigate()

    useEffect(() => {
        fetchItems();
    }, []);

    useEffect(() => {
    const timer = setInterval(() => {
        setCurrentTime(getCurrentDate(true));
    }, 1000); // 1000ms = 1 detik

    // Bersihkan timer pas komponen di-unmount biar gak memory leak
    return () => clearInterval(timer);
}, []);

    const fetchItems = async() => {
        try {
            setLoading(true)
            
            // Determine which dashboard endpoint to use based on role
            const dashboardEndpoint = role === 'admin' ? 'dashboardAdmin' : 'dashboardUser';
            
            // Fetch both dashboard stats and memo data
            const [dashboardResponse, memoResponse] = await Promise.all([
                api.get(dashboardEndpoint),
                api.get('dashboardMemo')
            ]);
            
            
            setItems(dashboardResponse.data)
            setMemoData(memoResponse.data.data.data || [])
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
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
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Left Section - Stats Grid */}
                        <div className="lg:w-1/2">
                            <div className='ms-4'>
                                <p className="md:text-4xl text-2xl font-semibold capitalize">Halo, {name?.split(' ')[0]}</p>
                                <p className='text-md font-regular mb-6 text-gray-600'>{currentTime}</p>
                                {/* <img src={LogoMi} alt="Logo Media Indonesia" className='max-w-52 mx-auto mt-4 mb-6' /> */}

                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {/* MR Card */}
                               { (mr !== undefined) && 
                                <div className="bg-white rounded-xl p-5 relative">
                                    <div className="absolute top-4 right-4">
                                        <button onClick={() => navigate('/material-request/list-material-request')} className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </button>
                                    </div>
                                    
                                    {/* Title Badge */}
                                    <div className="mb-3">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600 border border-green-200">
                                            {/* Tampil di Mobile */}
                                            <span className="md:hidden">MR</span>
                                            {/* Tampil di Desktop (Layar Medium ke atas) */}
                                            <span className="hidden md:inline">Material Request</span>
                                        </span>                                    
                                    </div>
                                    
                                    {/* Number */}
                                    <p className="text-4xl font-bold text-gray-900 mb-1">{items.makerequest}</p>
                                    
                                    {/* Description */}
                                    <p className="text-sm text-gray-500">Yang telah dibuat</p>
                                </div>}

                                {/* MR Belum Approve Card */}
                                {   mr_pending !== undefined &&
                                    <div className="bg-white rounded-xl p-5 relative">
                                    {/* Redirect Icon - Top Right */}
                                    <div className="absolute top-4 right-4">
                                        <button onClick={() => navigate('/material-request/list-material-request')} className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </button>
                                    </div>
                                    
                                    {/* Title Badge */}
                                    <div className="mb-3">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
                                            <span className="md:hidden">MR Pending</span>
                                            <span className="hidden md:inline">Material Request Pending</span>
                                        </span>
                                    </div>
                                    
                                    {/* Number */}
                                    <p className="text-4xl font-bold text-gray-900 mb-1">{items.mr_proses || 0}</p>
                                    
                                    {/* Description */}
                                    <p className="text-sm text-gray-500">Belum disetujui</p>
                                </div>}

                                {/* PR Card */}
                                {   pr !== undefined &&
                                    <div className="bg-white rounded-xl p-5 relative">
                                        {/* Redirect Icon - Top Right */}
                                        <div className="absolute top-4 right-4">
                                            <button onClick={() => navigate('/purchase-request/list-purchase-request')} className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </button>
                                        </div>
                                        
                                        {/* Title Badge */}
                                        <div className="mb-3">
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-600 border border-yellow-200">
                                                <span className="md:hidden">PR</span>
                                                <span className="hidden md:inline">Purchase Request</span>
                                            </span>
                                        </div>
                                        
                                        {/* Number */}
                                        <p className="text-4xl font-bold text-gray-900 mb-1">{items.purchaseRequest || 0}</p>
                                        
                                        {/* Description */}
                                        <p className="text-sm text-gray-500">Telah dibuat</p>
                                    </div>
                                }


                                {/* Memo Card */}
                                {   po !== undefined &&
                                    <div className="bg-white rounded-xl p-5 relative">
                                    {/* Redirect Icon - Top Right */}
                                    <div className="absolute top-4 right-4">
                                        <button onClick={() => navigate('/purchase-order/list-purchase-order')} className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </button>
                                    </div>
                                    
                                    {/* Title Badge */}
                                    <div className="mb-3">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-600 border border-purple-200">
                                            <span className="md:hidden">PO</span>
                                            <span className="hidden md:inline">Purchase Order</span>
                                        </span>
                                    </div>
                                    
                                    {/* Number */}
                                    <p className="text-4xl font-bold text-gray-900 mb-1">{items.purchaseOrder || 0}</p>
                                    
                                    {/* Description */}
                                    <p className="text-sm text-gray-500">Telah dibuat</p>
                                    
                                </div>
                                }

                                {/* LPB Card */}
                                {  lpb !== undefined &&
                                    <div className="bg-white rounded-xl p-5 relative">
                                    {/* Redirect Icon - Top Right */}
                                    <div className="absolute top-4 right-4">
                                        <button onClick={() => navigate('/lpb/list-lpb')} className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </button>
                                    </div>
                                    
                                    {/* Title Badge */}
                                    <div className="mb-3">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                                            <span className="md:hidden">LPB</span>
                                            <span className="hidden md:inline">Laporan Penerimaan Barang</span>
                                        </span>
                                    </div>
                                    
                                    {/* Number */}
                                    <p className="text-4xl font-bold text-gray-900 mb-1">{items.lpb || 0}</p>
                                    
                                    {/* Description */}
                                    <p className="text-sm text-gray-500">Telah dibuat</p>
                                </div>}

                                {/* Barang Card */}
                                {   barang !== undefined &&
                                <div className="bg-white rounded-xl p-5 relative">
                                    {/* Redirect Icon - Top Right */}
                                    <div className="absolute top-4 right-4">
                                        <button onClick={() => navigate('/barang/list-barang')} className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </button>
                                    </div>
                                    
                                    {/* Title Badge */}
                                    <div className="mb-3">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200">Barang</span>
                                    </div>
                                    
                                    {/* Number */}
                                    <p className="text-4xl font-bold text-gray-900 mb-1">{items.barang || 0}</p>
                                    
                                    {/* Description */}
                                    <p className="text-sm text-gray-500">Tercatat</p>
                                </div>}


                                {/* PO Card */}
                                {   memo !== undefined &&
                                    <div className="bg-white rounded-xl p-5 relative">
                                    {/* Redirect Icon - Top Right */}
                                    <div className="absolute top-4 right-4">
                                        <button onClick={() => navigate('/memo/list-memo')} className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </button>
                                    </div>
                                    
                                    {/* Title Badge */}
                                    <div className="mb-3">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-600 border border-cyan-200">Memo</span>
                                    </div>
                                    
                                    {/* Number */}
                                    <p className="text-4xl font-bold text-gray-900 mb-1">{items.memo || 0}</p>
                                    
                                    {/* Description */}
                                    <p className="text-sm text-gray-500">Telah dibuat</p>
                                </div>}

                                {   memo_pending !== undefined &&
                                    <div className="bg-white rounded-xl p-5 relative">
                                    {/* Redirect Icon - Top Right */}
                                    <div className="absolute top-4 right-4">
                                        <button onClick={() => navigate('/memo/list-memo')} className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </button>
                                    </div>
                                    
                                    {/* Title Badge */}
                                    <div className="mb-3">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-600 border border-cyan-200">Memo Pending</span>
                                    </div>
                                    
                                    {/* Number */}
                                    <p className="text-4xl font-bold text-gray-900 mb-1">{memo_pending}</p>
                                    
                                    {/* Description */}
                                    <p className="text-sm text-gray-500">Belum disetujui</p>
                                </div>}

                                {/* Billing Card */}
                                {   billing !== undefined &&
                                    <div className="bg-white rounded-xl p-5 relative">
                                    {/* Redirect Icon - Top Right */}
                                    <div className="absolute top-4 right-4">
                                        <button onClick={() => navigate('/billing/list-billing')} className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </button>
                                    </div>
                                    
                                    {/* Title Badge */}
                                    <div className="mb-3">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-600 border border-teal-200">Billing</span>
                                    </div>
                                    
                                    {/* Number */}
                                    <p className="text-4xl font-bold text-gray-900 mb-1">{items.billing || 0}</p>
                                    
                                    {/* Description */}
                                    <p className="text-sm text-gray-500">Telah dibuat</p>
                                </div>}
                            </div>
                        </div>

                        {/* Right Section - Memo */}
                        <div className="lg:w-1/2">
                            <div className="bg-white rounded-lg p-6 h-full">
                                <div className='w-full flex justify-between items-center mb-4'>
                                    <p className="md:text-2xl text-gray-700 font-semibold text-xl break-words">Memo Information</p>
                                    <button onClick={() => navigate('/memo-information')} className='w-fit bg-gray-100 hover:bg-gray-200 transition-all duration-200 text-xs md:text-sm text-gray-700 font-semibold py-2 px-4 rounded-lg'>
                                        <span className=''>Lihat semua</span>
                                    </button>
                                </div>
                                <div className="border-t space-y-4 max-h-[600px] lg:h-[562px] overflow-y-auto pt-2">
                                    {memoData && memoData.length > 0 ? (
                                        memoData.map((memo, index) => (
                                            <MemoCard 
                                                key={memo.id || index}
                                                item={memo}
                                                isSelected={false}
                                                onClick={() => navigate('/memo-information', { 
                                                    state: { targetId: memo.id } 
                                                })}
                                                initial='dashboard'
                                            />
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>Tidak ada memo tersedia</p>
                                        </div>
                                    )}
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