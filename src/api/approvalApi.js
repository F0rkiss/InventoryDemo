import api from './api'

// Template API functions for approval functionality
// Replace these with your actual API endpoints and implementation

export const approvalApi = {
    // Approve a request
    approve: async (requestId, reason = '') => {
        try {
            const response = await api.post(`/approval/approve/${requestId}`, {
                reason,
                approved_at: new Date().toISOString(),
                status: 'approved'
            })
            return response.data
        } catch (error) {
            console.error('Error approving request:', error)
            throw error
        }
    },

    // Decline a request
    decline: async (requestId, reason = '') => {
        try {
            const response = await api.post(`/approval/decline/${requestId}`, {
                reason,
                declined_at: new Date().toISOString(),
                status: 'declined'
            })
            return response.data
        } catch (error) {
            console.error('Error declining request:', error)
            throw error
        }
    },

    // Get approval history for a request
    getApprovalHistory: async (requestId) => {
        try {
            const response = await api.get(`/approval/history/${requestId}`)
            return response.data
        } catch (error) {
            console.error('Error fetching approval history:', error)
            throw error
        }
    },

    // Get pending approvals for current user
    getPendingApprovals: async (params = {}) => {
        try {
            const response = await api.get('/approval/pending', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching pending approvals:', error)
            throw error
        }
    },

    // Get approval statistics
    getApprovalStats: async () => {
        try {
            const response = await api.get('/approval/stats')
            return response.data
        } catch (error) {
            console.error('Error fetching approval stats:', error)
            throw error
        }
    },

    // Bulk approve multiple requests
    bulkApprove: async (requestIds, reason = '') => {
        try {
            const response = await api.post('/approval/bulk-approve', {
                request_ids: requestIds,
                reason,
                approved_at: new Date().toISOString()
            })
            return response.data
        } catch (error) {
            console.error('Error bulk approving requests:', error)
            throw error
        }
    },

    // Bulk decline multiple requests
    bulkDecline: async (requestIds, reason = '') => {
        try {
            const response = await api.post('/approval/bulk-decline', {
                request_ids: requestIds,
                reason,
                declined_at: new Date().toISOString()
            })
            return response.data
        } catch (error) {
            console.error('Error bulk declining requests:', error)
            throw error
        }
    }
}

// Example usage in components:
/*
import { approvalApi } from '../../api/approvalApi'

// In your component:
const handleApprove = async (itemId, reason) => {
    try {
        await approvalApi.approve(itemId, reason)
        // Handle success (e.g., show notification, update UI)
        showSuccessNotification('Request berhasil disetujui')
        // Remove item from list or refresh data
    } catch (error) {
        // Handle error
        showErrorNotification('Gagal menyetujui request')
    }
}

const handleDecline = async (itemId, reason) => {
    try {
        await approvalApi.decline(itemId, reason)
        // Handle success
        showSuccessNotification('Request berhasil ditolak')
        // Remove item from list or refresh data
    } catch (error) {
        // Handle error
        showErrorNotification('Gagal menolak request')
    }
}
*/ 