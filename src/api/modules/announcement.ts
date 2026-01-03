import api from '../core/apiClient';

// Interface untuk data create/update pengumuman
export interface AnnouncementData {
    judul: string;
    konten: string;
    kategori: string;
    target: string; // Di backend akan menjadi 'target_peserta'
    prioritas: string;
    status: string;
}

// API MANAJEMEN PENGUMUMAN (ADMIN)

/**
 * Mengambil semua pengumuman.
 */
export const getAnnouncements = () => {
    return api.get('/pengumuman/manage/');
};

/**
 * Membuat pengumuman baru.
 * @param data - Objek berisi data pengumuman.
 */
export const createAnnouncement = (data: AnnouncementData) => {
    return api.post('/pengumuman/manage/', data);
};

/**
 * Memperbarui pengumuman yang sudah ada.
 * @param id - ID dari pengumuman yang akan diperbarui.
 * @param data - Objek berisi data pengumuman yang baru.
 */
export const updateAnnouncement = (id: number, data: AnnouncementData) => {
    return api.patch(`/pengumuman/manage/${id}/`, data);
};

/**
 * Menghapus sebuah pengumuman.
 * @param id - ID dari pengumuman yang akan dihapus.
 */
export const deleteAnnouncement = (id: number) => {
    return api.delete(`/pengumuman/manage/${id}/`);
};

// API PENGUMUMAN UNTUK PESERTA

/**
 * Mengambil detail dari satu pengumuman berdasarkan ID-nya.
 * @param announcementId - ID dari pengumuman yang akan diambil.
 */
export const getAnnouncementDetail = (announcementId: number) => {
    // Memanggil endpoint: GET /api/pengumuman/{id}/
    return api.get(`/pengumuman/${announcementId}/`);
};
