import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import dayjs from '../../helper/RelativeTimeHelper';
import { encrypting } from '../../helper/EncryptHelper';

const Notifications = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [nextCursor, setNextCursor] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const hasFetched = useRef(false);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await api.get('notification');
            const data = response.data.data;
        
            const withReadStatus = data
                .map((item) => ({
                ...item,
                isRead: false,
                }))
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // 🔄 terbaru duluan
        
            setItems(withReadStatus);
            setNextCursor(response.data.next_cursor);
            } catch (error) {
            console.error('Error fetching notifications:', error);
            } finally {
            setLoading(false);
            }
        };

    const fetchMoreItems = async () => {
        if (loading || !nextCursor) return;
        try {
            setLoading(true);
            const response = await api.get('notification', {
                params: { cursor: nextCursor },
            });
            const data = response.data.data;

            const newItems = data
            .map((item) => ({
                ...item,
                isRead: false,
            }))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sort newest first

            setItems((prevItems) => {
            const existingIds = new Set(prevItems.map((item) => item.id));
            const uniqueNew = newItems.filter((item) => !existingIds.has(item.id));
            const combined = [...prevItems, ...uniqueNew];
            return combined.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); // Re-sort after merge
            });


            setNextCursor(response.data.next_cursor);
        } catch (error) {
            console.error('Error fetching more notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleNotificationClick = (notif) => {
        const encryptedId = encrypting(notif.id);
        if (notif.jenis_request === 'MR') {
            navigate(`/approvalStepHistory-makeRequest/detail/${encryptedId}`);
        } else if (notif.jenis_request === 'PR'){
            navigate(`/approvalStepHistory-purchaseRequest/detail/${encryptedId}`);
        } else if (notif.jenis_request === 'PO'){
            navigate(`/approvalStepHistory-purchaseOrder/detail/${encryptedId}`);
        } else if (notif.jenis_request === 'LPB'){
            navigate(`/approvalStepHistory-lpb/detail/${encryptedId}`);
        } else if (notif.jenis_request === 'Memo'){
            navigate(`/approvalStepHistory-memoStatis/detail/${encryptedId}`);
        } else if (notif.jenis_request === 'MemoDinamis'){
            navigate(`/approvalStepHistory-memoDinamis/detail/${encryptedId}`);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.notifications-container')) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!hasFetched.current) {
            fetchItems();
            hasFetched.current = true;
        }
    }, []);

    const unreadCount = items.filter((item) => !item.isRead).length;

    return (
        <div className="notifications-container relative mr-5">
            <button onClick={toggleDropdown} className="relative transition-colors duration-200 hover:bg-gray-200 rounded-md px-2 py-1">
                <i className="bx bx-bell text-2xl"></i>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 text-xs text-white bg-red-500 rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                        <p className="text-sm text-gray-500">{unreadCount} belum disetujui</p>
                    </div>

                    <div
                        className="max-h-96 overflow-y-auto"
                        onScroll={(e) => {
                            const bottom =
                                e.target.scrollHeight - e.target.scrollTop ===
                                e.target.clientHeight;
                            if (bottom) fetchMoreItems();
                        }}
                    >
                        {items.length > 0 ? (
                            items.map((notif, index) => (
                                <div
                                    key={`${notif.id}-${index}`}  
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`px-4 py-3 border-b border-gray-100 cursor-pointer ${
                                        notif.isRead ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-sm font-medium text-gray-800">
                                                    {["MR", "PR", "PO", "LPB", "Memo", "MemoDinamis"].includes(notif.jenis_request)
                                                        ? notif.username
                                                        : notif.jenis_request === "LPB"
                                                            ? notif.penerima
                                                            : "Not Set Yet"}
                                                </h4>
                                                <p className="text-xs text-gray-400 ml-2">
                                                    {dayjs(notif.created_at).fromNow()}
                                                </p>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{notif.message_approval}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-xs text-gray-400">
                                                    {notif.should_approve ? 'Perlu approval' : 'Tidak perlu approval'}
                                                </p>
                                                <span
                                                    className={`px-2 py-1 rounded-full font-semibold text-xs ${
                                                        notif.jenis_request === 'LPB'
                                                            ? 'bg-blue-500 bg-opacity-30 text-blue-700'
                                                            : notif.jenis_request === 'MR'
                                                            ? 'bg-green-500 bg-opacity-30 text-green-700'
                                                            : notif.jenis_request === 'PR'
                                                            ? 'bg-yellow-500 bg-opacity-30 text-yellow-700'
                                                            : notif.jenis_request === 'PO'
                                                            ? 'bg-purple-500 bg-opacity-30 text-purple-700'
                                                            : notif.jenis_request === 'Memo'
                                                            ? 'bg-cyan-100 text-cyan-700'
                                                            : notif.jenis_request === 'MemoDinamis'
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : 'bg-gray-400 bg-opacity-30 text-gray-700'
                                                    }`}
                                                >
                                                    {notif.jenis_request === "MemoDinamis" ? "Memo Dinamis" : notif.jenis_request}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-gray-500">
                                <i className="bx bx-bell text-3xl mb-2"></i>
                                <p>No notifications</p>
                            </div>
                        )}
                        {loading && (
                            <div className="text-center py-2 text-gray-500 text-sm">
                                Loading...
                            </div>
                        )}
                    </div>

                    <div className="px-4 py-3 border-t border-gray-200">
                        <button
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            onClick={() => navigate('/notifications')}
                        >
                            Lihat Semuanya
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
