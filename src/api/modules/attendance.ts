import api from '../core/apiClient';

// API MANAJEMEN ABSENSI (ADMIN)
/**
 * Mengambil data absensi untuk admin berdasarkan tipe peserta dan tanggal.
 * @param tipePeserta - 'student' atau 'general'
 * @param tanggal - 'YYYY-MM-DD'
 */
export const getAdminAttendance = (tipePeserta: string, tanggal: string) => {
    return api.get('/bimbingan/admin/absensi/', {
        params: {
            tipe_peserta: tipePeserta,
            tanggal: tanggal,
        },
    });
};

/**
 * Memperbarui data absensi peserta (Admin).
 * @param id - ID record absensi
 * @param data - Data yang akan diupdate (status, checkIn, checkOut, keterangan)
 */
export const updateAdminAttendance = (id: number, data: any) => {
    return api.patch(`/bimbingan/admin/absensi/${id}/`, data);
};

// API ABSENSI PESERTA

/**
 * Mengambil seluruh riwayat absensi untuk peserta yang sedang login.
 */
export const getParticipantAttendance = () => {
    return api.get('/peserta/absensi/');
};

/**
 * Mengirimkan aksi absensi (check-in/check-out) untuk hari ini.
 * Backend akan secara cerdas menentukan apakah ini check-in atau check-out.
 */
export const submitParticipantAttendance = () => {
    return api.post('/peserta/absensi/');
};

/**
 * Mengirimkan data pengajuan izin atau sakit dari peserta.
 * @param formData - Objek FormData yang berisi 'tanggal', 'status_kehadiran', 'keterangan', dan 'surat_dokter' (opsional).
 */
export const submitLeaveRequest = (formData: FormData) => {
    return api.post('/peserta/ajukan-izin/', formData, {
        headers: {
            // SECARA EKSPLISIT MENGATUR Content-Type MENJADI null
            // AGAR BROWSER MENGAMBIL ALIH DAN MENGATURNYA MENJADI multipart/form-data
            'Content-Type': null,
        },
    });
};
