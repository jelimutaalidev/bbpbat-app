import api from '../core/apiClient';

export const getAdminDashboardStats = () => {
    return api.get('/bimbingan/admin/dashboard-stats/');
};

/**
 * Mengambil data ringkasan untuk dashboard peserta.
 */
export const getParticipantDashboard = () => {
    return api.get('/peserta/dashboard/');
};
