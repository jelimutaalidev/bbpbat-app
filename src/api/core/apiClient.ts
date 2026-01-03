import axios from 'axios';
import { logoutAndRedirect } from '../utils/authUtils';

export const BACKEND_URL = 'http://127.0.0.1:8000/';

// Gunakan URL relatif untuk fleksibilitas antara development dan production.
// Pastikan di vite.config.ts Anda ada proxy ke 'http://127.0.0.1:8000'.
const api = axios.create({
    baseURL: `${BACKEND_URL}/api`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// =================================================================
// INTERCEPTOR 1: MENGIRIM TOKEN PADA SETIAP REQUEST
// =================================================================
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        // Pastikan header ada sebelum di-assign
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// =================================================================
// INTERCEPTOR 2: MENANGANI TOKEN KEDALUWARSA (REFRESH & LOGOUT)
// =================================================================
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Kondisi `if` diperbarui dengan pengecualian untuk URL refresh
        if (
            error.response?.status === 401 &&
            originalRequest.url !== '/auth/token/refresh/' &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                logoutAndRedirect();
                return Promise.reject(new Error("Sesi berakhir, refresh token tidak ditemukan."));
            }

            try {
                const { data } = await api.post('/auth/token/refresh/', {
                    refresh: refreshToken,
                });

                localStorage.setItem('authToken', data.access);
                api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
                originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
                return api(originalRequest);

            } catch (refreshError) {
                logoutAndRedirect();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
