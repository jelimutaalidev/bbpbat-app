export interface PembayaranStatus {
    sudah_diunggah: boolean;
    tanggal_unggah: string | null;
    status_verifikasi: string | null;
    file_url: string | null;
}

export interface LaporanStatus {
    sudah_diunggah: boolean;
    tanggal_unggah: string | null;
    file_url: string | null;
}

export interface PembimbingProfile {
    nama_lengkap: string;
    jabatan: string;
    email: string;
    telepon: string;
    foto_url: string | null;
}

export interface Pengumuman {
    id: number;
    judul: string;
    tanggalPublish: string;
    kategori: string;
    konten: string;
}

export interface ProgresProgram {
    sisa_hari: number;
    total_hari: number;
    persentase_selesai: number;
}

export interface DashboardData {
    tipe_peserta: 'PELAJAR' | 'UMUM';
    total_hadir: number;
    progres_program: ProgresProgram;
    sertifikat_tersedia: boolean;
    laporan_status: LaporanStatus;
    pembayaran_status: PembayaranStatus;
    pembimbing: PembimbingProfile | null;
    pengumuman_terbaru: Pengumuman[];
}
