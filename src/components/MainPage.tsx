import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, User, FileText, Clock, FileCheck, Award,
  LogOut, Menu, X, Fish, CreditCard
} from 'lucide-react';
import { NavigationState } from '../App';
import Dashboard from './main/Dashboard';
import { getPesertaProfile } from '../api/apiService';
import Profile from './main/Profile';
import Documents from './main/Documents';
import Attendance from './main/Attendance';
import Reports from './main/Reports';
import Certificate from './main/Certificate';
import PaymentUpload from './main/PaymentUpload';

import { UserData } from '../types/app';

// --- PERBAIKAN 1: Menambahkan helper function `snakeToCamel` di sini ---
// Ini akan mengonversi semua data dari API secara otomatis dan rekursif (termasuk di dalam array/objek)
const snakeToCamel = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(v => snakeToCamel(v));
  }
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/(_\w)/g, (m) => m[1].toUpperCase());
    acc[camelKey] = snakeToCamel(obj[key]);
    return acc;
  }, {} as { [key: string]: any });
};


// --- TYPE DEFINITIONS ---

type ProfileData = any; // Kita buat 'any' agar lebih fleksibel setelah konversi otomatis

interface MainPageProps {
  onNavigate: (page: NavigationState) => void;
  onLogout: () => void;
}

const MainPage: React.FC<MainPageProps> = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [userData, setUserData] = useState<UserData>({
    name: '',
    institution: '',
    profileComplete: false,
    documentsComplete: false,
    paymentComplete: false,
    userType: (localStorage.getItem('userType') as 'pelajar' | 'umum') || 'pelajar',
  });

  // --- PERBAIKAN 2: Hapus `generalProfileData`, kita hanya butuh SATU state ---
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchAndSetProfileData = useCallback(async () => {
    setLoadingProfile(true);
    setProfileError(null);
    try {
      const res = await getPesertaProfile();

      // --- PERBAIKAN 3: Konversi seluruh data API ke camelCase SATU KALI di sini ---
      const data = snakeToCamel(res.data);

      const newUserType = data.tipePeserta === 'Pelajar/Mahasiswa' ? 'pelajar' : 'umum';

      // Mengisi userData dengan data yang sudah di-konversi
      setUserData({
        name: data.user?.namaLengkap || '',
        institution: data.namaInstitusi || '',
        profileComplete: data.profilLengkap || false,
        documentsComplete: data.dokumenLengkap || false,
        paymentComplete: !!data.pembayaran,
        userType: newUserType,
      });
      localStorage.setItem('userType', newUserType);

      // --- PERBAIKAN 4: Cukup set satu state profileData dengan data yang sudah bersih ---
      // Ini akan digunakan oleh semua tipe peserta
      setProfileData({
        ...data,
        // Menyesuaikan beberapa field yang mungkin tidak cocok namanya
        namaLengkap: data.user?.namaLengkap || data.namaLengkap,
        email: data.user?.email || data.email,
        penempatanPKL: data.penempatan, // Map 'penempatan' dari API ke 'penempatanPkl' untuk form
        rencanaMultai: data.rencanaMulai // Map 'rencanaMulai' dari API ke 'rencanaMultai' di form (mengikuti nama di Profile.tsx)
      });

    } catch (err) {
      setProfileError('Gagal memuat data profil peserta.');
      console.error(err);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    fetchAndSetProfileData();
  }, [fetchAndSetProfileData]);

  const studentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, component: Dashboard },
    { id: 'profile', label: 'Profil', icon: <User className="w-5 h-5" />, component: Profile },
    { id: 'documents', label: 'Berkas', icon: <FileText className="w-5 h-5" />, component: Documents },
    { id: 'attendance', label: 'Absensi', icon: <Clock className="w-5 h-5" />, component: Attendance, disabled: !userData.profileComplete || !userData.documentsComplete },
    { id: 'reports', label: 'Laporan', icon: <FileCheck className="w-5 h-5" />, component: Reports, disabled: !userData.profileComplete || !userData.documentsComplete },
    { id: 'certificate', label: 'Sertifikat', icon: <Award className="w-5 h-5" />, component: Certificate, disabled: !userData.profileComplete || !userData.documentsComplete }
  ];

  const generalMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, component: Dashboard },
    // --- PERBAIKAN 5: Peserta Umum sekarang menggunakan komponen 'Profile' yang sama ---
    { id: 'profile', label: 'Profil', icon: <User className="w-5 h-5" />, component: Profile },
    { id: 'payment', label: 'Upload Bukti Pembayaran', icon: <CreditCard className="w-5 h-5" />, component: PaymentUpload },
    { id: 'certificate', label: 'Sertifikat', icon: <Award className="w-5 h-5" />, component: Certificate, disabled: !userData.profileComplete || !userData.paymentComplete }
  ];

  const menuItems = userData.userType === 'pelajar' ? studentMenuItems : generalMenuItems;
  const ActiveComponent = menuItems.find(item => item.id === activeMenu)?.component || Dashboard;

  const handleMenuClick = (menuId: string) => {
    const menuItem = menuItems.find(item => item.id === menuId);
    if (menuItem && !menuItem.disabled) {
      setActiveMenu(menuId);
      setSidebarOpen(false);
    }
  };

  const handleUpdateUserData = (data: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...data }));
  };

  const componentProps = {
    userData,
    // --- PERBAIKAN 6: Hapus logika kondisional, selalu gunakan `profileData` ---
    profileData,
    loadingProfile,
    updateUserData: handleUpdateUserData,
    updateProfileData: fetchAndSetProfileData,
    refreshProfile: fetchAndSetProfileData,
    onUpdate: fetchAndSetProfileData,
    // --- PERBAIKAN 7: Perbaiki error TypeScript dengan menambahkan prop yang dibutuhkan Dashboard ---
    setActiveComponent: setActiveMenu, // Dashboard butuh prop ini untuk navigasi
  };

  // --- TIDAK ADA PERUBAHAN PADA KODE JSX DI BAWAH INI ---
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Fish className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">BBPBAT</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700" >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">{userData.name}</p>
              <p className="text-sm text-gray-600">{userData.institution}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${userData.userType === 'pelajar' ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800'}`}>
                {userData.userType === 'pelajar' ? 'Pelajar' : 'Masyarakat Umum'}
              </span>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleMenuClick(item.id)}
                  disabled={item.disabled}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${activeMenu === item.id ? 'bg-blue-100 text-blue-700 border border-blue-200' : item.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                  {item.disabled && (
                    <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      Terkunci
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200" >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </div>
      <div className="flex-1 lg:ml-0">
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-500 hover:text-gray-700" >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <Fish className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-800">BBPBAT</span>
            </div>
            <div className="w-6"></div>
          </div>
        </div>
        <main className="p-6">
          {loadingProfile || !profileData ? (
            <div className='flex items-center justify-center h-64'>
              <p className='text-gray-600'>Memuat data profil...</p>
            </div>
          ) : profileError ? (
            <div className='flex items-center justify-center h-64 bg-red-50 rounded-lg'>
              <p className='text-red-600'>{profileError}</p>
            </div>
          ) : (
            <ActiveComponent {...componentProps} />
          )}
        </main>
      </div>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default MainPage;