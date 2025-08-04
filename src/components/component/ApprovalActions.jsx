import React, { useState } from 'react'

const ApprovalActions = ({ 
    itemId, 
    onApprove, 
    onDecline, 
    approveText = 'Setujui', 
    declineText = 'Tolak',
    showReasonInput = false,
    reasonRequired = false,
    className = ''
}) => {
    const [isProcessing, setIsProcessing] = useState(false)
    const [reason, setReason] = useState('')
    const [showReasonField, setShowReasonField] = useState(false)

    const handleApprove = async () => {
        if (isProcessing) return
        setIsProcessing(true)
        try {
            if (onApprove) {
                await onApprove(itemId, reason)
            }
        } catch (error) {
            console.error('Error approving:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleDecline = async () => {
        if (isProcessing) return
        
        // If reason is required and not provided, show reason field
        if (reasonRequired && !reason.trim()) {
            setShowReasonField(true)
            return
        }
        
        setIsProcessing(true)
        try {
            if (onDecline) {
                await onDecline(itemId, reason)
            }
        } catch (error) {
            console.error('Error declining:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleDeclineClick = () => {
        if (showReasonInput || reasonRequired) {
            setShowReasonField(true)
        } else {
            handleDecline()
        }
    }

    const handleReasonSubmit = () => {
        if (reason.trim()) {
            handleDecline()
        }
    }

    return (
        <div className={`flex flex-col gap-2 px-4 py-3 bg-gray-50 ${className}`}>
            {/* Reason Input Field */}
            {showReasonField && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className={`flex flex-col gap-2 px-4 py-3 bg-gray-50 rounded-md shadow-lg w-full max-w-md ${className}`}>
                {/* Reason Input Field */}
                <textarea
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Masukkan alasan penolakan..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows="3"
                />
                <div className="flex gap-2 mt-2 justify-end">
                    <button
                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors duration-200"
                    onClick={() => {
                        setShowReasonField(false)
                        setReason('')
                    }}
                    >
                    Batal
                    </button>
                    <button
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors duration-200 disabled:opacity-50"
                    onClick={handleReasonSubmit}
                    disabled={!reason.trim()}
                    >
                    Kirim
                    </button>
                </div>
                </div>
            </div>
            )}


            {/* Action Buttons */}
            <div className="flex gap-2">
                <button 
                    className='flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    onClick={handleApprove}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Memproses...
                        </span>
                    ) : (
                        approveText
                    )}
                </button>
                <button 
                    className='flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    onClick={handleDeclineClick}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Memproses...
                        </span>
                    ) : (
                        declineText
                    )}
                </button>
            </div>
        </div>
    )
}

export default ApprovalActions 