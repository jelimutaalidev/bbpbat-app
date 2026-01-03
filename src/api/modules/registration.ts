import api from '../core/apiClient';

// API PUBLIK
export const getPlacementOptions = () => {
    return api.get('/bimbingan/penempatan/');
};

export const submitRegistration = (data: FormData) => {
    return api.post('/bimbingan/pendaftaran/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// API KHUSUS ADMIN
export const getNewRegistrations = (userType: 'PELAJAR' | 'UMUM') => {
    return api.get('/bimbingan/admin/pendaftaran/', {
        params: { tipe_peserta: userType }
    });
};

export const approveRegistration = (registrationId: number | string) => {
    return api.post(`/bimbingan/admin/pendaftaran/${registrationId}/approve/`);
};

export const rejectRegistration = (registrationId: number | string, reason: string) => {
    return api.post(`/bimbingan/admin/pendaftaran/${registrationId}/reject/`, { alasan: reason });
};
