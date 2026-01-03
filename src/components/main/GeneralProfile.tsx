import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Building, Calendar, Heart, Save, Edit, AlertCircle, CheckCircle } from 'lucide-react';

// Tipe data untuk form agar lebih aman dan terstruktur
type ProfileFormData = {
  [key: string]: any; // Memungkinkan properti string apa pun
  nama_lengkap?: string;
  email?: string;
  alamat?: string;
  no_telepon?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  golongan_darah?: string;
  nama_institusi?: string;
  alamat_institusi?: string;
  email_institusi?: string;
  rencana_mulai?: string;
  rencana_akhir?: string;
  penempatan_pkl?: string;
  riwayat_penyakit?: string;
  penanganan_khusus?: string;
};

// Interface untuk props yang disederhanakan
interface GeneralProfileProps {
  profileData: ProfileFormData;
  updateProfileData: (data: ProfileFormData) => void;
  // Menghapus updateUserData karena tidak digunakan secara langsung di handleSave
}

const GeneralProfile: React.FC<GeneralProfileProps> = ({ profileData, updateProfileData }) => {
  // State management
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  // Menambahkan tipe eksplisit pada state
  const [localFormData, setLocalFormData] = useState<ProfileFormData>(profileData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Refs untuk menyimpan data asli sebelum diedit
  const originalDataRef = useRef<ProfileFormData>(profileData);
  const isEditingRef = useRef(isEditing);

  const placementOptions = [
    'BIOFLOK NILA', 'PEMBENIHAN KOMET', 'PEMBENIHAN GURAME', 'PEMBENIHAN NILA SULTANA',
    'PEMBENIHAN BAUNG', 'PEMBENIHAN LELE SANGKURIANG', 'PEMBENIHAN PATIN', 'PEMBENIHAN MAS MANTAP',
    'PEMBENIHAN NILEM', 'Ikan Wader', 'PEMBENIHAN KOI', 'PEMBENIHAN MANFISH', 'IKAN KOKI',
    'PAKAN MANDIRI (BUATAN)', 'CACING SUTERA', 'MOINA', 'UDANG GALAH (PELABUHAN RATU)',
    'LAB KESEHATAN IKAN', 'LAB NUTRISI DAN RESIDU', 'LAB KUALITAS AIR', 'Pelayanan Publik',
    'Perpustakaan', 'Uji Terap Teknik dan Kerjasama', 'Arsip', 'Kepegawaian', 'Koperasi', 'KODOK LEMBU'
  ];

  useEffect(() => {
    isEditingRef.current = isEditing;
  }, [isEditing]);

  useEffect(() => {
    if (!isEditingRef.current) {
      setLocalFormData(profileData);
      originalDataRef.current = profileData;
    }
  }, [profileData]);

  const tabs = [
    { id: 'personal', label: 'Informasi Pribadi', icon: <User className="w-4 h-4" /> },
    { id: 'institution', label: 'Informasi Institusi', icon: <Building className="w-4 h-4" /> },
    { id: 'bimtek', label: 'Rencana Bimtek', icon: <Calendar className="w-4 h-4" /> },
    { id: 'health', label: 'Informasi Kesehatan', icon: <Heart className="w-4 h-4" /> }
  ];

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Menambahkan tipe eksplisit pada parameter 'prev'
    setLocalFormData((prev: ProfileFormData) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      // Menambahkan tipe eksplisit pada parameter 'prev'
      setErrors((prev: Record<string, string>) => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!localFormData.nama_lengkap?.trim()) newErrors.nama_lengkap = 'Nama lengkap wajib diisi';
    if (!localFormData.email?.trim()) newErrors.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(localFormData.email)) newErrors.email = 'Format email tidak valid';
    if (!localFormData.alamat?.trim()) newErrors.alamat = 'Alamat wajib diisi';
    if (!localFormData.no_telepon?.trim()) newErrors.no_telepon = 'Nomor telepon wajib diisi';
    if (!localFormData.tempat_lahir?.trim()) newErrors.tempat_lahir = 'Tempat lahir wajib diisi';
    if (!localFormData.tanggal_lahir) newErrors.tanggal_lahir = 'Tanggal lahir wajib diisi';
    if (!localFormData.golongan_darah) newErrors.golongan_darah = 'Golongan darah wajib dipilih';
    if (!localFormData.nama_institusi?.trim()) newErrors.nama_institusi = 'Nama institusi wajib diisi';
    if (!localFormData.alamat_institusi?.trim()) newErrors.alamat_institusi = 'Alamat institusi wajib diisi';
    if (!localFormData.email_institusi?.trim()) newErrors.email_institusi = 'Email institusi wajib diisi';
    if (!localFormData.rencana_mulai) newErrors.rencana_mulai = 'Rencana mulai bimtek wajib diisi';
    if (!localFormData.rencana_akhir) newErrors.rencana_akhir = 'Rencana akhir bimtek wajib diisi';
    if (!localFormData.penempatan_pkl) newErrors.penempatan_pkl = 'Penempatan bimtek wajib dipilih';
    if (!localFormData.riwayat_penyakit?.trim()) newErrors.riwayat_penyakit = 'Riwayat penyakit wajib diisi';
    if (!localFormData.penanganan_khusus?.trim()) newErrors.penanganan_khusus = 'Penanganan khusus wajib diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setSaveMessage('');
      return;
    }
    setIsSaving(true);
    setSaveMessage('');
    // Simulasi panggilan API
    setTimeout(() => {
      // Memanggil fungsi update dari props untuk menyinkronkan data ke state global
      updateProfileData(localFormData);
      
      setIsSaving(false);
      setIsEditing(false);
      setSaveMessage('Profil berhasil disimpan!');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 1500);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSaveMessage('');
    setErrors({});
    originalDataRef.current = { ...localFormData };
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveMessage('');
    setErrors({});
    setLocalFormData(originalDataRef.current);
  };

  // Render Functions dengan LOGIKA BARU pada 'disabled'
  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap *</label>
          <input
            type="text" name="nama_lengkap" value={localFormData.nama_lengkap || ''} onChange={handleInputChange}
            disabled={!isEditing || !!originalDataRef.current.nama_lengkap}
            className={`w-full px-4 py-3 border rounded-lg transition-colors ${errors.nama_lengkap ? 'border-red-300' : 'border-gray-300'} ${(!isEditing || !!originalDataRef.current.nama_lengkap) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="Masukkan nama lengkap"
          />
          {errors.nama_lengkap && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.nama_lengkap}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input
            type="email" name="email" value={localFormData.email || ''} onChange={handleInputChange}
            disabled={!isEditing || !!originalDataRef.current.email}
            className={`w-full px-4 py-3 border rounded-lg transition-colors ${errors.email ? 'border-red-300' : 'border-gray-300'} ${(!isEditing || !!originalDataRef.current.email) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="john.doe@email.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.email}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Alamat *</label>
        <textarea
          name="alamat" value={localFormData.alamat || ''} onChange={handleInputChange}
          disabled={!isEditing || !!originalDataRef.current.alamat}
          rows={3}
          className={`w-full px-4 py-3 border rounded-lg transition-colors ${errors.alamat ? 'border-red-300' : 'border-gray-300'} ${(!isEditing || !!originalDataRef.current.alamat) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          placeholder="Masukkan alamat lengkap"
        />
        {errors.alamat && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.alamat}</p>}
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">No Telepon/HP/WA *</label>
          <input
            type="tel" name="no_telepon" value={localFormData.no_telepon || ''} onChange={handleInputChange}
            disabled={!isEditing || !!originalDataRef.current.no_telepon}
            className={`w-full px-4 py-3 border rounded-lg transition-colors ${errors.no_telepon ? 'border-red-300' : 'border-gray-300'} ${(!isEditing || !!originalDataRef.current.no_telepon) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="+62 812 3456 7890"
          />
          {errors.no_telepon && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.no_telepon}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tempat Lahir *</label>
          <input
            type="text" name="tempat_lahir" value={localFormData.tempat_lahir || ''} onChange={handleInputChange}
            disabled={!isEditing || !!originalDataRef.current.tempat_lahir}
            className={`w-full px-4 py-3 border rounded-lg transition-colors ${errors.tempat_lahir ? 'border-red-300' : 'border-gray-300'} ${(!isEditing || !!originalDataRef.current.tempat_lahir) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="Kota tempat lahir"
          />
          {errors.tempat_lahir && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.tempat_lahir}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir *</label>
          <input
            type="date" name="tanggal_lahir" value={localFormData.tanggal_lahir || ''} onChange={handleInputChange}
            disabled={!isEditing || !!originalDataRef.current.tanggal_lahir}
            className={`w-full px-4 py-3 border rounded-lg transition-colors ${errors.tanggal_lahir ? 'border-red-300' : 'border-gray-300'} ${(!isEditing || !!originalDataRef.current.tanggal_lahir) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          {errors.tanggal_lahir && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.tanggal_lahir}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Golongan Darah *</label>
        <select
          name="golongan_darah" value={localFormData.golongan_darah || ''} onChange={handleInputChange}
          disabled={!isEditing || !!originalDataRef.current.golongan_darah}
          className={`w-full px-4 py-3 border rounded-lg transition-colors ${errors.golongan_darah ? 'border-red-300' : 'border-gray-300'} ${(!isEditing || !!originalDataRef.current.golongan_darah) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        >
          <option value="">Pilih golongan darah</option>
          <option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option>
        </select>
        {errors.golongan_darah && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.golongan_darah}</p>}
      </div>
    </div>
  );

  const renderInstitutionInfo = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nama Institusi/Perusahaan/Dinas *</label>
        <input
          type="text" name="nama_institusi" value={localFormData.nama_institusi || ''} onChange={handleInputChange}
          disabled={!isEditing || !!originalDataRef.current.nama_institusi}
          className={`w-full px-4 py-3 border rounded-lg transition-colors ${errors.nama_institusi ? 'border-red-300' : 'border-gray-300'} ${(!isEditing || !!originalDataRef.current.nama_institusi) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          placeholder="Nama institusi"
        />
        {errors.nama_institusi && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.nama_institusi}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Institusi *</label>
        <textarea
          name="alamat_institusi" value={localFormData.alamat_institusi || ''} onChange={handleInputChange}
          disabled={!isEditing || !!originalDataRef.current.alamat_institusi}
          rows={3}
          className={`w-full px-4 py-3 border rounded-lg transition-colors ${errors.alamat_institusi ? 'border-red-300' : 'border-gray-300'} ${(!isEditing || !!originalDataRef.current.alamat_institusi) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          placeholder="Alamat lengkap institusi"
        />
        {errors.alamat_institusi && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.alamat_institusi}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email Institusi *</label>
        <input
          type="email" name="email_institusi" value={localFormData.email_institusi || ''} onChange={handleInputChange}
          disabled={!isEditing || !!originalDataRef.current.email_institusi}
          className={`w-full px-4 py-3 border rounded-lg transition-colors ${errors.email_institusi ? 'border-red-300' : 'border-gray-300'} ${(!isEditing || !!originalDataRef.current.email_institusi) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          placeholder="email@institusi.com"
        />
        {errors.email_institusi && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.email_institusi}</p>}
      </div>
    </div>
  );

  const renderBimtekPlan = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rencana Mulai Bimtek *</label>
          <input
            type="date" name="rencana_mulai" value={localFormData.rencana_mulai || ''} onChange={handleInputChange}
            disabled={!isEditing || !!originalDataRef.current.rencana_mulai}
            className={`w-full px-4 py-3 border rounded-lg transition-colors ${errors.rencana_mulai ? 'border-red-300' : 'border-gray-300'} ${(!isEditing || !!originalDataRef.current.rencana_mulai) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          {errors.rencana_mulai && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.rencana_mulai}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rencana Akhir Bimtek *</label>
          <input
            type="date" name="rencana_akhir" value={localFormData.rencana_akhir || ''} onChange={handleInputChange}
            disabled={!isEditing || !!originalDataRef.current.rencana_akhir}
            className={`w-full px-4 py-3 border rounded-lg transition-colors ${errors.rencana_akhir ? 'border-red-300' : 'border-gray-300'} ${(!isEditing || !!originalDataRef.current.rencana_akhir) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          {errors.rencana_akhir && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.rencana_akhir}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Penempatan Bimtek *</label>
        <select
          name="penempatan_pkl" value={localFormData.penempatan_pkl || ''} onChange={handleInputChange}
          disabled={!isEditing || !!originalDataRef.current.penempatan_pkl}
          className={`w-full px-4 py-3 border rounded-lg transition-colors ${errors.penempatan_pkl ? 'border-red-300' : 'border-gray-300'} ${(!isEditing || !!originalDataRef.current.penempatan_pkl) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        >
          <option value="">Pilih unit penempatan</option>
          {placementOptions.map((option, index) => (<option key={index} value={option}>{option}</option>))}
        </select>
        {errors.penempatan_pkl && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.penempatan_pkl}</p>}
      </div>
    </div>
  );

  const renderHealthInfo = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Riwayat Penyakit (2 tahun terakhir) *</label>
        <textarea
          name="riwayat_penyakit" value={localFormData.riwayat_penyakit || ''} onChange={handleInputChange}
          disabled={!isEditing || !!originalDataRef.current.riwayat_penyakit}
          rows={4}
          className={`w-full px-4 py-3 border rounded-lg transition-colors ${errors.riwayat_penyakit ? 'border-red-300' : 'border-gray-300'} ${(!isEditing || !!originalDataRef.current.riwayat_penyakit) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          placeholder="Tuliskan riwayat penyakit. Jika tidak ada, tulis 'Tidak ada'"
        />
        {errors.riwayat_penyakit && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.riwayat_penyakit}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Penanganan Khusus yang Diperlukan *</label>
        <textarea
          name="penanganan_khusus" value={localFormData.penanganan_khusus || ''} onChange={handleInputChange}
          disabled={!isEditing || !!originalDataRef.current.penanganan_khusus}
          rows={3}
          className={`w-full px-4 py-3 border rounded-lg transition-colors ${errors.penanganan_khusus ? 'border-red-300' : 'border-gray-300'} ${(!isEditing || !!originalDataRef.current.penanganan_khusus) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          placeholder="Tuliskan jika ada penanganan khusus. Jika tidak ada, tulis 'Tidak ada'"
        />
        {errors.penanganan_khusus && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.penanganan_khusus}</p>}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal': return renderPersonalInfo();
      case 'institution': return renderInstitutionInfo();
      case 'bimtek': return renderBimtekPlan();
      case 'health': return renderHealthInfo();
      default: return renderPersonalInfo();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Profil Peserta</h1>
          <p className="text-gray-600">Lengkapi informasi pribadi dan data peserta Anda</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing && (
            <button onClick={handleCancel} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors">
              Batal
            </button>
          )}
          <button onClick={isEditing ? handleSave : handleEdit} disabled={isSaving} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
            {isSaving ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Menyimpan...</>)
              : isEditing ? (<><Save className="w-4 h-4" />Simpan</>)
              : (<><Edit className="w-4 h-4" />Lengkapi Profil</>)}
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-700 font-medium">{saveMessage}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default GeneralProfile;
