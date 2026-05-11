import api from './client';
export const adminApi = {
    getStats: () => api.get('admin/stats'),
    getUsers: () => api.get('admin/users'),
    createUser: (data) => api.post('admin/users', data),
    blockUser: (userId) => api.put(`admin/users/${userId}/block`),
    unblockUser: (userId) => api.put(`admin/users/${userId}/unblock`),
    getReports: () => api.get('admin/reports'),
    resolveReport: (reportId) => api.put(`admin/reports/${reportId}/resolve`),
    dismissReport: (reportId) => api.put(`admin/reports/${reportId}/dismiss`),
};
