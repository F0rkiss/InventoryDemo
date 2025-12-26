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


function Dashboard() {

    const [items, setItems] = useState({});
    const [memoData, setMemoData] = useState([]);
    const [barang, setBarang] = useState([]);
    const [loading, setLoading] = useState(false);
    const [contentVisible, setContentVisible] = useState(false)
    const [disabled, setDisabled] = useState(false)
    const { name, email, role, navigation_menu } = useAuth();
    const navigate = useNavigate()

    useEffect(() => {
        fetchItems();
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
            
            // console.log('Memo Response:', memoResponse);
            // console.log('Memo Data:', memoResponse.data);
            console.log('Memo Data Data:', memoResponse.data.data.data);
            
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
                            <div>
                                <h2 className="text-2xl font-bold capitalize">Haloo {name}</h2>
                                <h3 className='text-1xl font-bold mb-6 capitalize'>Selamat Datang di Inventory Media Indonesia</h3>
                                {/* <img src={LogoMi} alt="Logo Media Indonesia" className='max-w-52 mx-auto mt-4 mb-6' /> */}

                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {/* MR Card */}
                                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 relative border border-gray-100">
                                    {/* Redirect Icon - Top Right */}
                                    <div className="absolute top-4 right-4">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                                            {/* PUT YOUR REDIRECT ICON HERE */}
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    {/* Title Badge */}
                                    <div className="mb-3">
                                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-50 text-green-600 border border-green-200">Make Request</span>
                                    </div>
                                    
                                    {/* Number */}
                                    <p className="text-4xl font-bold text-gray-900 mb-1">{items.makerequest || 0}</p>
                                    
                                    {/* Description */}
                                    <p className="text-sm text-gray-500">Yang telah dibuat</p>
                                </div>

                                {/* PR Card */}
                                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 relative border border-gray-100">
                                    {/* Redirect Icon - Top Right */}
                                    <div className="absolute top-4 right-4">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                                            {/* PUT YOUR REDIRECT ICON HERE */}
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    {/* Title Badge */}
                                    <div className="mb-3">
                                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-50 text-yellow-600 border border-yellow-200">Purchase Request</span>
                                    </div>
                                    
                                    {/* Number */}
                                    <p className="text-4xl font-bold text-gray-900 mb-1">{items.purchaseRequest || 0}</p>
                                    
                                    {/* Description */}
                                    <p className="text-sm text-gray-500">Telah dibuat</p>
                                </div>

                                {/* LPB Card */}
                                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 relative border border-gray-100">
                                    {/* Redirect Icon - Top Right */}
                                    <div className="absolute top-4 right-4">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                                            {/* PUT YOUR REDIRECT ICON HERE */}
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    {/* Title Badge */}
                                    <div className="mb-3">
                                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-50 text-blue-600 border border-blue-200">LPB</span>
                                    </div>
                                    
                                    {/* Number */}
                                    <p className="text-4xl font-bold text-gray-900 mb-1">{items.lpb || 0}</p>
                                    
                                    {/* Description */}
                                    <p className="text-sm text-gray-500">Telah dibuat</p>
                                </div>

                                {/* Memo Card */}
                                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 relative border border-gray-100">
                                    {/* Redirect Icon - Top Right */}
                                    <div className="absolute top-4 right-4">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                                            {/* PUT YOUR REDIRECT ICON HERE */}
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    {/* Title Badge */}
                                    <div className="mb-3">
                                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-50 text-purple-600 border border-purple-200">Purchase Order</span>
                                    </div>
                                    
                                    {/* Number */}
                                    <p className="text-4xl font-bold text-gray-900 mb-1">{items.purchaseOrder || 0}</p>
                                    
                                    {/* Description */}
                                    <p className="text-sm text-gray-500">Telah dibuat</p>
                                    
                                </div>

                                {/* Barang Card */}
                                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 relative border border-gray-100">
                                    {/* Redirect Icon - Top Right */}
                                    <div className="absolute top-4 right-4">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                                            {/* PUT YOUR REDIRECT ICON HERE */}
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    {/* Title Badge */}
                                    <div className="mb-3">
                                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-orange-50 text-orange-600 border border-orange-200">Barang</span>
                                    </div>
                                    
                                    {/* Number */}
                                    <p className="text-4xl font-bold text-gray-900 mb-1">{items.barang || 0}</p>
                                    
                                    {/* Description */}
                                    <p className="text-sm text-gray-500">Di Gudang</p>
                                </div>

                                {/* MR Belum Approve Card */}
                                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 relative border border-gray-100">
                                    {/* Redirect Icon - Top Right */}
                                    <div className="absolute top-4 right-4">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                                            {/* PUT YOUR REDIRECT ICON HERE */}
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    {/* Title Badge */}
                                    <div className="mb-3">
                                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-50 text-red-600 border border-red-200">MR Pending</span>
                                    </div>
                                    
                                    {/* Number */}
                                    <p className="text-4xl font-bold text-gray-900 mb-1">{items.mr_proses || 0}</p>
                                    
                                    {/* Description */}
                                    <p className="text-sm text-gray-500">Belum Approve</p>
                                </div>

                                {/* PO Card */}
                                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 relative border border-gray-100">
                                    {/* Redirect Icon - Top Right */}
                                    <div className="absolute top-4 right-4">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                                            {/* PUT YOUR REDIRECT ICON HERE */}
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    {/* Title Badge */}
                                    <div className="mb-3">
                                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-cyan-50 text-cyan-600 border border-cyan-200">Memo</span>
                                    </div>
                                    
                                    {/* Number */}
                                    <p className="text-4xl font-bold text-gray-900 mb-1">{items.memo || 0}</p>
                                    
                                    {/* Description */}
                                    <p className="text-sm text-gray-500">Telah dibuat</p>
                                </div>

                                {/* Billing Card */}
                                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 relative border border-gray-100">
                                    {/* Redirect Icon - Top Right */}
                                    <div className="absolute top-4 right-4">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                                            {/* PUT YOUR REDIRECT ICON HERE */}
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    {/* Title Badge */}
                                    <div className="mb-3">
                                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-teal-50 text-teal-600 border border-teal-200">Billing</span>
                                    </div>
                                    
                                    {/* Number */}
                                    <p className="text-4xl font-bold text-gray-900 mb-1">{items.billing || 0}</p>
                                    
                                    {/* Description */}
                                    <p className="text-sm text-gray-500">Telah dibuat</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Section - Memo */}
                        <div className="lg:w-1/2">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-2xl font-bold mb-6">Memo</h2>
                                <div className="space-y-4 max-h-[600px] lg:h-[562px] overflow-y-auto">
                                    {memoData && memoData.length > 0 ? (
                                        memoData.map((memo, index) => (
                                            <MemoCard 
                                                key={memo.id || index}
                                                item={memo}
                                                isSelected={false}
                                                onClick={() => navigate(`/memo-information/${memo.id}`)}
                                                initial={role}
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