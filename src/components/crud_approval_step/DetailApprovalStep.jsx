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
                            {/* HEADER */}
                            <div className="flex items-center justify-between mb-4">
                                <Back goHome={() => navigate('/approval-step/list-approval-step')} />
                            </div>

                            <div className="flex flex-col lg:flex-row gap-4 mt-3">
                                {/* Approval Step Info */}
                                <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                                    <p className="font-semibold text-gray-400 mb-2 text-xl">Approval Step Information</p>
                                    <p className="text-xl font-bold capitalize">{item.user?.EmpName || '-'}</p>
                                    <p className="text-lg mb-4">Step: {item.approval_step || '-'}</p>

                                    <div className="space-y-3">
                                        <InfoRow label="Employee Name" value={item.user?.EmpName} />
                                        <InfoRow label="Employee Email" value={item.user?.email} />
                                        <InfoRow label="Employee Code" value={item.user?.EmpCode} />
                                        <InfoRow label="Phone" value={item.Emp} />
                                    </div>
                                </div>

                                {/* Type Request Info */}
                                <div className="bg-white border rounded-md p-6 flex-1 min-h-[200px]">
                                    <div className="flex justify-between">
                                        <p className="font-semibold text-gray-400 mb-2 text-xl">Type Request Information</p>
                                        {item.type_request?.jenis && (
                                            <p className="py-2 px-2 rounded-md text-amber-700 bg-amber-200">{item.type_request.jenis}</p>
                                        )}
                                    </div>
                                    <p className="text-lg font-bold">{item.type_request?.name || '-'}</p>
                                    <p className="text-sm text-gray-500 mb-4">{item.type_request?.description || '-'}</p>

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
    <div className="flex justify-between">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium">{value || '-'}</span>
    </div>
)

export default DetailApprovalStep
