import api from '../core/apiClient';

// Interface untuk data update laporan
export interface ReportUpdateData {
    status_review?: 'BARU' | 'DIREVIEW' | 'DITERIMA' | 'DITOLAK';
    feedback_admin?: string;
}

// API MANAJEMEN LAPORAN (ADMIN)

/**
 * Mengambil daftar laporan untuk admin, dengan filter.
 * @param tipePeserta - 'student' atau 'general'
 * @param status - 'all', 'baru', 'direview', 'diterima', 'ditolak'
 */
export const getAdminReports = (tipePeserta: string, status: string) => {
    return api.get('/bimbingan/admin/laporan/', {
        params: {
            tipe_peserta: tipePeserta,
            status: status,
        },
    });
};

/**
 * Memperbarui status dan/atau feedback sebuah laporan.
 * @param reportId - ID dari laporan yang akan diperbarui.
 * @param data - Objek berisi status_review dan/atau feedback_admin.
 */
export const updateAdminReport = (reportId: number | string, data: ReportUpdateData) => {
    return api.patch(`/bimbingan/admin/laporan/${reportId}/`, data);
};

// API LAPORAN PESERTA

/**
 * Mengambil riwayat laporan untuk peserta yang sedang login.
 */
export const getParticipantReports = () => {
    return api.get('/peserta/laporan/');
};

/**
 * Mengirimkan file laporan baru dari peserta.
 * @param formData - Objek FormData yang berisi 'judul', 'deskripsi', dan 'file'.
 */
export const submitParticipantReport = (formData: FormData) => {
    return api.post('/peserta/laporan/', formData, {
        headers: {
            'Content-Type': null, // Biarkan browser mengatur header multipart
        },
    });
};
