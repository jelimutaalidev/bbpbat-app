import api from '../core/apiClient';

// API PESERTA (DASHBOARD/PROFILE DIRI)
export const getPesertaProfile = () => {
    return api.get('/peserta/me/');
};

export const updatePesertaProfile = (data: any) => {
    return api.patch('/peserta/me/update/', data);
};

// API KHUSUS ADMIN
export const getParticipants = (userType: 'PELAJAR' | 'UMUM', status: string) => {
    return api.get('/admin/peserta/', {
        params: {
            tipe_peserta: userType,
            status: status
        }
    });
};

export const getParticipantDetail = (participantId: number | string) => {
    return api.get(`/admin/peserta/${participantId}/`);
};
