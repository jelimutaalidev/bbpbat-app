import api from '../core/apiClient';

/**
 * [ADMIN] Mengambil daftar bukti pembayaran dari semua peserta.
 * @param statusFilter - Filter berdasarkan status verifikasi.
 */
export const getPaymentsForAdmin = async (statusFilter: string = 'all') => {
    try {
        const endpoint = '/admin/pembayaran/';
        const params = statusFilter !== 'all' ? { status: statusFilter } : {};

        const response = await api.get(endpoint, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching payments for admin:", error);
        throw error;
    }
};

/**
 * [ADMIN] Memverifikasi (menyetujui/menolak) bukti pembayaran.
 * @param paymentId - ID dari bukti pembayaran.
 * @param newStatus - Status baru ('Telah Diverifikasi' atau 'Ditolak').
 * @param feedback - Catatan dari admin (opsional).
 */
export const updatePaymentStatus = async (
    paymentId: number,
    newStatus: 'Telah Diverifikasi' | 'Ditolak',
    feedback: string
) => {
    try {
        const endpoint = `/admin/pembayaran/${paymentId}/verifikasi/`;
        const payload = {
            status: newStatus,
            catatan: feedback,
        };

        const response = await api.post(endpoint, payload);
        return response.data;
    } catch (error) {
        console.error(`Error updating payment status for ID ${paymentId}:`, error);
        throw error;
    }
};

/**
 * [PESERTA] Mengambil data bukti pembayaran milik user yang login.
 */
export const getMyPayment = async () => {
    try {
        const response = await api.get('/peserta/pembayaran/');
        return response.data;
    } catch (error) {
        console.error("Error fetching participant payment:", error);
        throw error;
    }
};

/**
 * [PESERTA] Mengunggah file bukti pembayaran.
 */
export const uploadMyPayment = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/peserta/pembayaran/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading participant payment:", error);
        throw error;
    }
};
