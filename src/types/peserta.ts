// src/types/peserta.ts

// Tipe untuk data user yang di-nesting dari UserSerializer
interface IUser {
  id: number;
  email: string;
  name: string;
}

// Tipe untuk dokumen yang di-nesting
interface IDokumen {
  id: number;
  jenis_dokumen: string;
  file: string; // URL
  diunggah_pada: string;
  status_verifikasi: string;
}

// Tipe untuk bukti pembayaran yang di-nesting
interface IBuktiPembayaran {
  id: number;
  file: string; // URL
  diunggah_pada: string;
  status_verifikasi: string;
}

// [INTEGRASI] Interface utama berdasarkan PesertaProfileSerializer
export interface IPesertaProfile {
  id: number;
  user: IUser;
  tipe_peserta: string;
  alamat: string;
  no_telepon: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  nama_institusi: string;
  profil_lengkap: boolean;
  dokumen_lengkap: boolean;
  dokumen: IDokumen[];
  pembayaran: IBuktiPembayaran | null;
  status: string;
  penempatan: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  nama_lengkap: string;
  email: string;
  alamat_institusi: string;
  email_institusi: string;
  nomor_induk: string;
  no_telepon_institusi: string;
  nama_pembimbing: string;
  no_telepon_pembimbing: string;
  email_pembimbing: string;
  rencana_mulai: string;
  rencana_akhir: string;
  penempatan_pkl: string;
  golongan_darah: string;
  riwayat_penyakit: string;
  penanganan_khusus: string;
  nama_orang_tua: string;
  no_telepon_orang_tua: string;
}