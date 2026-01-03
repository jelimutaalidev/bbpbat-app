export interface AttendanceProps {
    userData: {
        profileComplete: boolean;
        documentsComplete: boolean;
    };
}

export interface AttendanceRecord {
    id: number;
    tanggal: string;
    status: "hadir" | "izin" | "sakit" | "alpha";
    jam_masuk: string | null;
    jam_keluar: string | null;
    keterangan: string;
}

export interface AttendanceStats {
    totalHadir: number;
    totalIzin: number;
    totalSakit: number;
    totalAlpha: number;
    kehadiranPersen: number;
}
