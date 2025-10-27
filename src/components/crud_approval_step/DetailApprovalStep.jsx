import React, { useState, useEffect } from 'react'
import api from '../../api/api'
import { useParams, useNavigate } from 'react-router-dom'
import { Block } from 'framework7-react'
import Back from '../component/Back'
import Loader from '../component/Loader'
import Transition from '../component/Transition'
import Layout from '../component/Layout'
import { DecryptID } from '../../helper/EncryptHelper'

function DetailApprovalStep() {
    const [item, setItem] = useState({})
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)
    const [decryptedId, setDecryptedId] = useState('')

    useEffect(() => {
        const decryptedIds = DecryptID(id)
        setDecryptedId(decryptedIds)
        if (!decryptedIds) navigate(-1)
    }, [id])

    useEffect(() => {
        if (decryptedId) fetchItems()
    }, [decryptedId])

    const fetchItems = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/inventApprovalStep-detail/${decryptedId}`)
            setItem(response.data.data)
        } catch (error) {
            console.error('API Error:', error.response?.data || error.message)
        } finally {
            setLoading(false)
            setTimeout(() => setContentVisible(true), 50)
        }
    }

    return (
        <Layout title="Detail Approval Step">
            <Block>
                {loading ? (
                    <Loader Class={'mt-20'} />
                ) : (
                    <div className="px-4">
                        <Transition contentVisible={contentVisible}>
                            <div className="flex items-center justify-between mb-4">
                                <Back goHome={() => navigate('/approval-step/list-approval-step')} />
                            </div>

                            <div className="flex flex-col lg:flex-row gap-4 mt-3">
                                {/* Approval Step Info */}
                                <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                                    <p className="font-semibold text-gray-400 text-xl">Approval Step Information</p>
                                    <p className="text-xl font-bold capitalize mt-2">{item.user?.EmpName || '-'}</p>
                                    <p className="text-lg mb-4">Step: {item.approval_step || '-'}</p>

                                    <div className="space-y-3">
                                        <InfoRow label="Employee Name" value={item.user?.EmpName} />
                                        <InfoRow label="Employee Email" value={item.user?.email} />
                                        <InfoRow label="Employee Code" value={item.user?.EmpCode} />
                                        <InfoRow label="Phone" value={item.user?.EmpPhone} />
                                        <InfoRow label="Admin Approval" value={item.isAdminApproved ? "Diperlukan" : "Tidak Diperlukan"} />
                                    </div>
                                </div>

                                {/* Type Request Info */}
                                <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-400 text-xl truncate">Type Request Information</p>
                                        </div>

                                        {item.type_request?.jenis && (
                                            <div className="shrink-0 ml-2">
                                                <span className="inline-flex items-center py-1 px-3 rounded-md text-amber-700 bg-amber-200 text-sm font-medium">
                                                    {item.type_request.jenis}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-lg font-bold mt-3 truncate max-w-full">{item.type_request?.name || '-'}</p>
                                    <p className="text-sm text-gray-500 mb-4 mt-1 whitespace-pre-wrap break-words">{item.type_request?.description || '-'}</p>

                                    <div className="space-y-3">
                                        <InfoRow label="Jenis Request" value={item.type_request?.jenis} />
                                        <InfoRow label="Deskripsi" value={item.type_request?.description} />
                                    </div>
                                </div>
                            </div>

                            {/* NOTE */}
                            <div className="bg-white border rounded-md p-6 mt-6">
                                <p className="text-xl text-gray-400 font-semibold mb-2">Note</p>
                                <p className="text-gray-700 whitespace-pre-wrap">{item.note || '-'}</p>
                            </div>
                        </Transition>
                    </div>
                )}
            </Block>
        </Layout>
    )
}

// ==============================
// Small Reusable Component
// ==============================
const InfoRow = ({ label, value }) => (
    <div className="flex items-start justify-between">
        <span className="text-gray-500 w-36 shrink-0">{label}</span>
        <span className="font-medium text-right min-w-0 break-words">{value || '-'}</span>
    </div>
)

export default DetailApprovalStep
