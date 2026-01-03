import api from '../core/apiClient';

// Interface untuk mendefinisikan struktur data kuota dari backend
export interface QuotaData {
    id: number;
    nama: string;
    deskripsi: string;
    kuota_pelajar: number;
    kuota_pelajar_terisi: number;
    kuota_umum: number;
    kuota_umum_terisi: number;
}

// Interface untuk data yang akan dikirim saat memperbarui kuota
export interface QuotaUpdateData {
    kuota_pelajar: number;
    kuota_umum: number;
}

/**
 * Mengambil data kuota lengkap untuk semua unit penempatan.
 */
export const getAdminQuotaData = () => {
    return api.get<QuotaData[]>('/bimbingan/admin/penempatan/');
};

/**
 * Memperbarui data kuota untuk satu unit penempatan.
 * @param placementId ID dari unit penempatan yang akan diubah.
 * @param data Objek berisi kuota_pelajar dan kuota_umum yang baru.
 */
export const updateAdminQuota = (placementId: number, data: QuotaUpdateData) => {
    return api.patch<QuotaData>(`/bimbingan/admin/penempatan/${placementId}/`, data);
};
