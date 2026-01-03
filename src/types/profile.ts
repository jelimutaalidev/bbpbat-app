import { UserData } from './app';
export type { UserData };

export interface ProfileData {
    namaLengkap: string;
    email: string;
    alamat: string;
    noTelepon: string;
    tempatLahir: string;
    tanggalLahir: string;
    golonganDarah: string;
    namaInstitusi: string;
    alamatInstitusi: string;
    emailInstitusi: string;
    nomorInduk?: string;
    noTeleponInstitusi?: string;
    namaPembimbing?: string;
    noTeleponPembimbing?: string;
    emailPembimbing?: string;
    rencanaMultai: string;
    rencanaAkhir: string;
    penempatanPKL: string;
    riwayatPenyakit: string;
    penangananKhusus: string;
    namaOrangTua?: string;
    noTeleponOrangTua?: string;
}

export interface ProfileProps {
    userData: UserData;
    profileData: ProfileData;
    updateUserData: (data: Partial<UserData>) => void;
    updateProfileData: (data: ProfileData) => void;
    loadingProfile?: boolean;
    // Props passed by MainPage but maybe not used directly in Profile yet
    refreshProfile?: () => Promise<void>;
    onUpdate?: () => Promise<void>;
    setActiveComponent?: (component: string) => void;
}
