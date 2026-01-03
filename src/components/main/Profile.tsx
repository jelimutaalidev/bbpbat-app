import React, { useState, useEffect, useRef, useCallback } from 'react';
import { updatePesertaProfile, getPlacementOptions } from '../../api/apiService';
import { User, Building, Calendar, Heart, CheckCircle, AlertCircle } from 'lucide-react';
import { ProfileProps, ProfileData } from '../../types/profile';
import ProfileHeader from './profile/ProfileHeader';
import PersonalTab from './profile/PersonalTab';
import InstitutionTab from './profile/InstitutionTab';
import InternshipTab from './profile/InternshipTab';
import HealthTab from './profile/HealthTab';

const Profile: React.FC<ProfileProps> = ({ userData, profileData, updateUserData, updateProfileData, loadingProfile }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [placementOptions, setPlacementOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await getPlacementOptions();
        // Backend returns objects {id, nama, ...}, we only need the names for the dropdown
        // to match the string value stored in the profile
        const options = response.data.map((item: any) => item.nama);
        setPlacementOptions(options);
      } catch (error) {
        console.error("Gagal mengambil data penempatan:", error);
      }
    };
    fetchOptions();
  }, []);

  const [localFormData, setLocalFormData] = useState<ProfileData>(profileData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const originalDataRef = useRef<ProfileData>(profileData);
  const isEditingRef = useRef(isEditing);

  useEffect(() => {
    isEditingRef.current = isEditing;
  }, [isEditing]);

  const tabs = [
    { id: 'personal', label: 'Informasi Pribadi', icon: <User className="w-4 h-4" /> },
    { id: 'institution', label: 'Informasi Institusi', icon: <Building className="w-4 h-4" /> },
    { id: 'internship', label: 'Rencana PKL', icon: <Calendar className="w-4 h-4" /> },
    { id: 'health', label: 'Informasi Kesehatan', icon: <Heart className="w-4 h-4" /> }
  ];

  useEffect(() => {
    if (!isEditingRef.current) {
      setLocalFormData(profileData);
      originalDataRef.current = profileData;
    }
  }, [profileData]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLocalFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!localFormData.namaLengkap?.trim()) newErrors.namaLengkap = 'Nama lengkap wajib diisi';
    if (!localFormData.email?.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(localFormData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!localFormData.alamat?.trim()) newErrors.alamat = 'Alamat wajib diisi';
    if (!localFormData.noTelepon?.trim()) newErrors.noTelepon = 'Nomor telepon wajib diisi';
    if (!localFormData.tempatLahir?.trim()) newErrors.tempatLahir = 'Tempat lahir wajib diisi';
    if (!localFormData.tanggalLahir) newErrors.tanggalLahir = 'Tanggal lahir wajib diisi';
    if (!localFormData.golonganDarah) newErrors.golonganDarah = 'Golongan darah wajib dipilih';
    if (!localFormData.namaInstitusi?.trim()) newErrors.namaInstitusi = 'Nama institusi wajib diisi';
    if (!localFormData.alamatInstitusi?.trim()) newErrors.alamatInstitusi = 'Alamat institusi wajib diisi';
    if (!localFormData.emailInstitusi?.trim()) newErrors.emailInstitusi = 'Email institusi wajib diisi';
    if (!localFormData.rencanaMultai) newErrors.rencanaMultai = 'Rencana mulai PKL wajib diisi';
    if (!localFormData.rencanaAkhir) newErrors.rencanaAkhir = 'Rencana akhir PKL wajib diisi';
    if (!localFormData.penempatanPKL) newErrors.penempatanPKL = 'Penempatan PKL wajib dipilih';
    if (!localFormData.riwayatPenyakit?.trim()) newErrors.riwayatPenyakit = 'Riwayat penyakit wajib diisi';
    if (!localFormData.penangananKhusus?.trim()) newErrors.penangananKhusus = 'Penanganan khusus wajib diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkProfileCompletion = (data: ProfileData) => {
    const requiredFields: (keyof ProfileData)[] = [
      'namaLengkap', 'email', 'alamat', 'noTelepon', 'tempatLahir', 'tanggalLahir', 'golonganDarah',
      'namaInstitusi', 'alamatInstitusi', 'emailInstitusi', 'rencanaMultai', 'rencanaAkhir',
      'penempatanPKL', 'riwayatPenyakit', 'penangananKhusus'
    ];
    return requiredFields.every(field => data[field] && data[field].toString().trim() !== '');
  };

  const snakeToCamel = (obj: any) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelKey = key.replace(/(_\w)/g, (m) => m[1].toUpperCase());
        newObj[camelKey] = obj[key];
      }
    }
    return newObj;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setSaveMessage({ type: 'error', text: 'Mohon lengkapi semua field yang wajib diisi.' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const dataToSend = {
        nama_lengkap: localFormData.namaLengkap,
        email: localFormData.email,
        alamat: localFormData.alamat,
        no_telepon: localFormData.noTelepon,
        tempat_lahir: localFormData.tempatLahir,
        tanggal_lahir: localFormData.tanggalLahir,
        golongan_darah: localFormData.golonganDarah,
        nama_institusi: localFormData.namaInstitusi,
        alamat_institusi: localFormData.alamatInstitusi,
        email_institusi: localFormData.emailInstitusi,
        nomor_induk: localFormData.nomorInduk,
        no_telepon_institusi: localFormData.noTeleponInstitusi,
        nama_pembimbing: localFormData.namaPembimbing,
        no_telepon_pembimbing: localFormData.noTeleponPembimbing,
        email_pembimbing: localFormData.emailPembimbing,
        rencana_mulai: localFormData.rencanaMultai,
        rencana_akhir: localFormData.rencanaAkhir,
        penempatan_pkl: localFormData.penempatanPKL,
        riwayat_penyakit: localFormData.riwayatPenyakit,
        penanganan_khusus: localFormData.penangananKhusus,
        nama_orang_tua: localFormData.namaOrangTua,
        no_telepon_orang_tua: localFormData.noTeleponOrangTua,
      };

      const response = await updatePesertaProfile(dataToSend);
      const updatedProfileCamelCase = snakeToCamel(response.data);

      setLocalFormData(updatedProfileCamelCase);
      updateProfileData(updatedProfileCamelCase);

      const isComplete = checkProfileCompletion(updatedProfileCamelCase);
      updateUserData({ profileComplete: isComplete });

      setIsSaving(false);
      setIsEditing(false);
      setSaveMessage({ type: 'success', text: 'Profil berhasil disimpan!' });

      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);

    } catch (error: any) {
      setIsSaving(false);
      setSaveMessage({ type: 'error', text: 'Gagal menyimpan profil. Silakan coba lagi.' });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSaveMessage(null);
    setErrors({});
    originalDataRef.current = { ...localFormData };
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveMessage(null);
    setErrors({});
    setLocalFormData(originalDataRef.current);
  };

  const renderTabContent = () => {
    const commonProps = {
      localFormData,
      handleInputChange,
      isEditing,
      errors,
      originalData: originalDataRef.current,
    };

    switch (activeTab) {
      case 'personal':
        return <PersonalTab {...commonProps} />;
      case 'institution':
        return <InstitutionTab {...commonProps} />;
      case 'internship':
        return <InternshipTab {...commonProps} placementOptions={placementOptions} />;
      case 'health':
        return <HealthTab {...commonProps} />;
      default:
        return <PersonalTab {...commonProps} />;
    }
  };

  if (loadingProfile) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-1/2" />
        <div className="h-96 bg-gray-200 rounded" />
      </div>
    );
  }

  const profileFields: (keyof ProfileData)[] = [
    'namaLengkap', 'email', 'alamat', 'noTelepon', 'tempatLahir', 'tanggalLahir', 'golonganDarah',
    'namaInstitusi', 'alamatInstitusi', 'emailInstitusi', 'rencanaMultai', 'rencanaAkhir',
    'penempatanPKL', 'riwayatPenyakit', 'penangananKhusus'
  ];
  const filledCount = profileFields.filter(f => profileData && profileData[f] && profileData[f].toString().trim() !== '').length;
  const percentComplete = Math.round((filledCount / profileFields.length) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <ProfileHeader
        userData={userData}
        profileData={profileData}
        isEditing={isEditing}
        isSaving={isSaving}
        percentComplete={percentComplete}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-teal-400 transition-all duration-1000 ease-out rounded-full"
          style={{ width: `${percentComplete}%` }}
        />
      </div>

      {saveMessage && (
        <div className={`rounded-lg p-4 border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${saveMessage.type === 'success'
          ? 'bg-green-50 border-green-200 text-green-700'
          : 'bg-red-50 border-red-200 text-red-700'
          }`}>
          {saveMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <p className="font-medium">{saveMessage.text}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 overflow-x-auto">
          <nav className="flex space-x-1 px-4 md:px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6 md:p-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Profile;