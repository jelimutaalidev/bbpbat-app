import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ProfileData } from '../../../types/profile';

interface PersonalTabProps {
    localFormData: ProfileData;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    isEditing: boolean;
    errors: Record<string, string>;
    originalData: ProfileData;
}

const PersonalTab: React.FC<PersonalTabProps> = ({
    localFormData,
    handleInputChange,
    isEditing,
    errors,
    originalData,
}) => {
    const getInputClass = (fieldName: keyof ProfileData) => {
        const hasError = !!errors[fieldName];
        const isDisabled = !isEditing || !!originalData?.[fieldName];

        return `w-full px-4 py-3 rounded-lg border transition-all duration-200 outline-none ${hasError
                ? 'border-red-300 focus:ring-2 focus:ring-red-200 bg-red-50'
                : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            } ${isDisabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-800'}`;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="namaLengkap"
                        value={localFormData.namaLengkap || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing || !!originalData?.namaLengkap}
                        className={getInputClass('namaLengkap')}
                        placeholder="Masukkan nama lengkap sesuai KTP"
                    />
                    {errors.namaLengkap && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                            <AlertCircle className="w-4 h-4" />{errors.namaLengkap}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                    <input
                        type="email"
                        name="email"
                        value={localFormData.email || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing || !!originalData?.email}
                        className={getInputClass('email')}
                        placeholder="contoh@email.com"
                    />
                    {errors.email && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                            <AlertCircle className="w-4 h-4" />{errors.email}
                        </p>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat Lengkap <span className="text-red-500">*</span></label>
                <textarea
                    name="alamat"
                    value={localFormData.alamat || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing || !!originalData?.alamat}
                    rows={3}
                    className={getInputClass('alamat')}
                    placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten, Kode Pos"
                />
                {errors.alamat && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                        <AlertCircle className="w-4 h-4" />{errors.alamat}
                    </p>
                )}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">No. Telepon/WA <span className="text-red-500">*</span></label>
                    <input
                        type="tel"
                        name="noTelepon"
                        value={localFormData.noTelepon || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing || !!originalData?.noTelepon}
                        className={getInputClass('noTelepon')}
                        placeholder="081234567890"
                    />
                    {errors.noTelepon && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                            <AlertCircle className="w-4 h-4" />{errors.noTelepon}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Orang Tua</label>
                    <input
                        type="text"
                        name="namaOrangTua"
                        value={localFormData.namaOrangTua || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing || !!originalData?.namaOrangTua}
                        className={getInputClass('namaOrangTua')}
                        placeholder="Nama Ayah/Ibu/Wali"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">No. Telepon Orang Tua</label>
                    <input
                        type="tel"
                        name="noTeleponOrangTua"
                        value={localFormData.noTeleponOrangTua || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing || !!originalData?.noTeleponOrangTua}
                        className={getInputClass('noTeleponOrangTua')}
                        placeholder="081234567890"
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tempat Lahir <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="tempatLahir"
                        value={localFormData.tempatLahir || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing || !!originalData?.tempatLahir}
                        className={getInputClass('tempatLahir')}
                        placeholder="Kota kelahiran"
                    />
                    {errors.tempatLahir && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                            <AlertCircle className="w-4 h-4" />{errors.tempatLahir}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Lahir <span className="text-red-500">*</span></label>
                    <input
                        type="date"
                        name="tanggalLahir"
                        value={localFormData.tanggalLahir || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing || !!originalData?.tanggalLahir}
                        className={getInputClass('tanggalLahir')}
                    />
                    {errors.tanggalLahir && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                            <AlertCircle className="w-4 h-4" />{errors.tanggalLahir}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Golongan Darah <span className="text-red-500">*</span></label>
                    <select
                        name="golonganDarah"
                        value={localFormData.golonganDarah || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing || !!originalData?.golonganDarah}
                        className={getInputClass('golonganDarah')}
                    >
                        <option value="">Pilih</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="AB">AB</option>
                        <option value="O">O</option>
                    </select>
                    {errors.golonganDarah && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                            <AlertCircle className="w-4 h-4" />{errors.golonganDarah}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PersonalTab;
