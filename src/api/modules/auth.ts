import api from '../core/apiClient';

export const loginUser = async (email: string, password: string) => {
    const response = await api.post('/auth/token/', { email, password });
    if (response.data.access && response.data.refresh) {
        localStorage.setItem('authToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
    }
    return response;
};

// getCurrentUser tetap ada untuk validasi di App.tsx
export const getCurrentUser = () => {
    return api.get('/auth/me/');
};
