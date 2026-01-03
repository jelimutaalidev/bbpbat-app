import React from 'react';
import { User, CheckCircle, AlertCircle, Edit, Save, Loader2 } from 'lucide-react';
import { ProfileData, UserData } from '../../../types/profile';

interface ProfileHeaderProps {
    userData: UserData;
    profileData: ProfileData;
    isEditing: boolean;
    isSaving: boolean;
    percentComplete: number;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    userData,
    profileData,
    isEditing,
    isSaving,
    percentComplete,
    onEdit,
    onSave,
    onCancel,
}) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white text-3xl font-bold shadow-md ring-4 ring-white">
                    {profileData?.namaLengkap ? (
                        profileData.namaLengkap
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()
                    ) : (
                        <User className="w-10 h-10" />
                    )}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {profileData?.namaLengkap || 'Profil Peserta'}
                    </h1>
                    <p className="text-gray-500 font-medium">
                        {profileData?.email || 'Kelola informasi pribadi dan data peserta'}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                        {userData?.profileComplete ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
                                <CheckCircle className="w-3.5 h-3.5" /> Profil Lengkap
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold border border-orange-200">
                                <AlertCircle className="w-3.5 h-3.5" /> Profil Belum Lengkap
                            </span>
                        )}
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {percentComplete}% terisi
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3 self-end md:self-auto">
                {isEditing && (
                    <button
                        onClick={onCancel}
                        className="px-5 py-2.5 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all duration-200 active:scale-95"
                    >
                        Batal
                    </button>
                )}
                <button
                    onClick={isEditing ? onSave : onEdit}
                    disabled={isSaving}
                    className={`px-6 py-2.5 rounded-lg font-medium text-white shadow-lg shadow-blue-500/30 transition-all duration-200 flex items-center gap-2 active:scale-95 ${isSaving
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
                        }`}
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Menyimpan...
                        </>
                    ) : isEditing ? (
                        <>
                            <Save className="w-4 h-4" />
                            Simpan Perubahan
                        </>
                    ) : (
                        <>
                            <Edit className="w-4 h-4" />
                            Edit Profil
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ProfileHeader;
