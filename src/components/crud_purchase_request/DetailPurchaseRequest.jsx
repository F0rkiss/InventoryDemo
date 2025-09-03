import React, { useEffect, useState, useMemo } from 'react';
import { Block } from 'framework7-react';
import { useNavigate, useParams } from 'react-router-dom';

import api from '../../api/api';
import Layout from '../component/Layout';
import Back from '../component/Back';
import Transition from '../component/Transition';
import DateFormat from '../../helper/DateFormatHelper';
import { DecryptID } from '../../helper/EncryptHelper';
import { useAuth } from '../../auth/AuthContext';

function DetailPurchaseRequest() {
    // ==============================
    // State
    // ==============================
    const [item, setItem] = useState({});
    const [detailPR, setDetailPR] = useState([]);       // detail barang PR
    const [prDetailQty, setPrDetailQty] = useState([]); // qty dari API
    const [decryptedId, setDecryptedId] = useState('');
    const [loading, setLoading] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);

    const { id } = useParams();
    const { role } = useAuth();
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_URL;

    // Extract MR data dari purchase request
    const mainMR = item.make_request || {};

    // ==============================
    // Effects
    // ==============================
    useEffect(() => {
        const decId = DecryptID(id);
        setDecryptedId(decId);
        if (!decId) navigate(-1);
    }, [id]);

    useEffect(() => {
        if (decryptedId) {
        fetchPurchaseRequest();
        }
    }, [decryptedId]);

    // ==============================
    // API Call
    // ==============================
    const fetchPurchaseRequest = async () => {
        try {
        setLoading(true);
        const { data } = await api.get(`/purchaseRequest-detail/${decryptedId}`);

        setItem(data.data);
        setDetailPR(data.data.details || []);   // barang detail
        setPrDetailQty(data.data.qty || []);    // qty barang
        } catch (error) {
        console.error('Error fetchPurchaseRequest:', error);
        } finally {
        setLoading(false);
        setTimeout(() => setContentVisible(true), 50);
        }
    };

    // ==============================
    // Helpers
    // ==============================
    const qtyMap = useMemo(() => {
        const map = new Map();
        (prDetailQty || []).forEach(q => {
        map.set(String(q.barang_id), q);
        });
        return map;
    }, [prDetailQty]);

    const getQty = (prRow, type = 'requested_qty') => {
        if (!prRow) return '-';
        const barangId = prRow.invent_barangs_id ?? prRow.barangs?.id;
        if (!barangId) return '-';

        const found = qtyMap.get(String(barangId));
        return found?.[type] ?? '-';
    };

    // ==============================
    // Render
    // ==============================
    return (
        <Layout title="Detail Purchase Request">
        <Block>
            <div className="px-4">
            <Transition contentVisible={contentVisible}>
                {/* HEADER */}
                <div className="flex items-center justify-between mb-4">
                <Back goHome={() => navigate('/purchase-request/list-purchase-request')} />
                <p
                    className={`py-2 px-2 rounded-md ${
                    item.is_full_approval
                        ? 'text-amber-700 bg-amber-200'
                        : 'text-green-700 bg-green-200'
                    }`}
                >
                    {item.is_full_approval ? 'Pending' : 'Approved'}
                </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 mt-3">
                {/* MAIN INFO */}
                <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                <p className="font-semibold text-gray-400 mb-2 text-xl">Purchase Request Information</p>
                <p className="text-xl font-bold capitalize">{item.kode}</p>
                <p className="text-lg mb-4">{DateFormat(item.tanggal, false)}</p>

                <div className="space-y-3">
                <InfoRow label="Employee Name" value={item.user?.EmpName} />
                <InfoRow label="Employee Code" value={item.user?.EmpCode} />
                <InfoRow label="Employee Email" value={item.user?.email} />
                <InfoRow label="Status Purchase Order" value={<p
                    className={`py-1 px-4 text-xs font-medium rounded ${
                    item.can_be_deleted
                        ? 'text-amber-600 bg-amber-100'
                        : 'text-green-700 bg-green-200'
                    }`}
                >
                    {item.can_be_deleted
                    ? 'Belum Masuk Purchase Order'
                    : 'Sudah Masuk Purchase Order'}
                </p>} />
                </div>

                </div>

                {/* MR INFO */}
                <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                <p className="font-semibold text-gray-400 mb-2 text-xl">Make Request Information</p>
                <p className="text-lg font-bold">{mainMR.kode}</p>
                <p className="text-sm text-gray-500 mb-4">{DateFormat(mainMR.tanggal, false)}</p>

                <div className="space-y-3">
                    <InfoRow label="Pembuat Permintaan" value={mainMR.user?.EmpName} />
                    <InfoRow label="Email" value={mainMR.user?.email} />
                    <InfoRow label="Type Request" value={mainMR.type_request?.name} />
                    <InfoRow label="Jenis" value={mainMR.type_request?.jenis} />
                    <InfoRow label="Deskripsi" value={mainMR.type_request?.description} />
                </div>
                </div>
                </div>

                {/* DETAIL PR */}
                <div className="bg-white border rounded-md p-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-xl text-gray-400 font-semibold">Detail Purchase Request</p>
                    <div className="text-sm text-gray-500">
                    {detailPR.length} barang
                    </div>
                </div>

                {detailPR.length === 0 ? (
                    <p className="text-gray-400 italic text-center py-4">
                    Belum ada barang dipilih
                    </p>
                ) : (
                    <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="bg-gray-100">
                        <th className="px-3 py-2 rounded-l-md">No</th>
                        <th className="px-3 py-1">Barang</th>
                        <th className="px-3 py-1">Jumlah Diminta</th>
                        <th className="px-3 py-1">Jumlah Sudah Dipesan</th>
                        <th className="px-3 py-1 rounded-r-md">Jumlah Belum Dipesan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {detailPR.map((pr, i) => (
                        <tr
                            key={pr.id ?? i}
                            className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                        >
                            <td className="px-4 py-4 rounded-l-md">{i + 1}</td>
                            <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                                {pr.barangs?.image && (
                                <img
                                    src={`${apiUrl}${pr.barangs.image}`}
                                    alt={pr.barangs.name}
                                    className="w-8 h-8 object-cover rounded-md border"
                                />
                                )}
                                <div>
                                <p className="font-medium text-gray-900">{pr.barangs?.name}</p>
                                <p className="text-xs text-gray-500">{pr.barangs?.kode_barang}</p>
                                </div>
                            </div>
                            </td>
                            <td className="px-4 py-4">{getQty(pr, 'requested_qty')}</td>
                            <td className="px-4 py-4">{getQty(pr, 'used_qty')}</td>
                            <td className="px-4 py-4 rounded-r-md">{getQty(pr, 'sisa')}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                )}
                </div>
            </Transition>
            </div>
        </Block>
        </Layout>
    );
    }

    // ==============================
    // Small Reusable Components
    // ==============================
    const InfoRow = ({ label, value }) => (
    <div className="flex justify-between">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium">{value || '-'}</span>
    </div>
);

export default DetailPurchaseRequest;
