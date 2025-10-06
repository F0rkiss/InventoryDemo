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

            const withReadStatus = data.map((item) => ({
                ...item,
                isRead: false,
            }));

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

            const newItems = data.map((item) => ({
                ...item,
                isRead: false,
            }));

            setItems((prevItems) => {
                const existingIds = new Set(prevItems.map((item) => item.id));
                const uniqueNew = newItems.filter((item) => !existingIds.has(item.id));
                return [...prevItems, ...uniqueNew];
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
        } else {
            navigate(`/approvalStepHistory-lpb/detail/${encryptedId}`);
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
        <div className="notifications-container relative mr-8">
            <button onClick={toggleDropdown} className="relative">
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
                            items.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`px-4 py-3 border-b border-gray-100 cursor-pointer ${
                                        notif.isRead ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-sm font-medium text-gray-800">
                                                    {/* {notif.username} */}
                                                    {notif.jenis_request === "MR"
                                                        ? notif.username
                                                        : notif.jenis_request === "LPB"
                                                            ? notif.penerima
                                                            : notif.penerima}
                                                    {/* {notif.kode || notif.penerima} */}
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
                                                <p className="text-xs text-gray-400">{notif.jenis_request}</p>
                                                {/* <p className="text-xs text-gray-400">{notif.kode}</p> */}
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
