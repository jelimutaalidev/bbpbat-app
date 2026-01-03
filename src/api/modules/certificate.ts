import api from '../core/apiClient';

export interface EligibleParticipant {
    id: number;
    nama: string;
    institusi: string;
    tipe_peserta: 'PELAJAR' | 'UMUM';
    // Tambahkan 3 field yang hilang sesuai dengan serializer baru
    penempatan: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
}

export interface CertificateDetail {
    id: number;
    nomor_sertifikat: string;
    file_sertifikat: string;
    file_url: string;
    tanggal_terbit: string;
    template_digunakan: 'PELAJAR' | 'UMUM';
    peserta: EligibleParticipant; // Sekarang ini akan cocok
}

// Interface untuk mendefinisikan struktur data persyaratan
export interface CertificateRequirement {
    deskripsi: string;
    terpenuhi: boolean;
}

// Interface untuk mendefinisikan semua kemungkinan respons dari API
export interface ParticipantCertificateStatus {
    status: 'DITERBITKAN' | 'MENUNGGU_PENERBITAN' | 'BELUM_MEMENUHI_SYARAT' | 'ERROR';
    message: string;
    // 'data' bisa berisi detail sertifikat atau daftar persyaratan, tergantung statusnya
    data?: CertificateDetail | { persyaratan: CertificateRequirement[] };
}

// API MANAJEMEN SERTIFIKAT (ADMIN)

/**
 * Mengambil daftar peserta yang memenuhi syarat untuk diterbitkan sertifikat.
 * @returns Promise dengan array data EligibleParticipant.
 */
export const getEligibleForCertificate = () => {
    return api.get<EligibleParticipant[]>('/bimbingan/admin/sertifikat/');
};

/**
 * Memicu proses pembuatan sertifikat untuk seorang peserta.
 * @param pesertaId - ID dari peserta yang akan dibuatkan sertifikat.
 * @returns Promise dengan detail sertifikat yang baru dibuat (CertificateDetail).
 */
export const generateCertificate = (pesertaId: number) => {
    return api.post<CertificateDetail>('/bimbingan/admin/sertifikat/', { peserta_id: pesertaId });
};

/**
 * Mengambil status dan data sertifikat untuk peserta yang sedang login.
 * 
 */
export const getParticipantCertificate = () => {
    return api.get<ParticipantCertificateStatus>('/peserta/sertifikat/');
};
