import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ProfileData } from '../../../types/profile';

interface InstitutionTabProps {
    localFormData: ProfileData;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    isEditing: boolean;
    errors: Record<string, string>;
    originalData: ProfileData;
}

const InstitutionTab: React.FC<InstitutionTabProps> = ({
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
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Institusi/Sekolah/Universitas <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    name="namaInstitusi"
                    value={localFormData.namaInstitusi || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing || !!originalData?.namaInstitusi}
                    className={getInputClass('namaInstitusi')}
                    placeholder="Nama lengkap institusi"
                />
                {errors.namaInstitusi && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                        <AlertCircle className="w-4 h-4" />{errors.namaInstitusi}
                    </p>
                )}
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Induk Mahasiswa/Siswa</label>
                <input
                    type="text"
                    name="nomorInduk"
                    value={localFormData.nomorInduk || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing || !!originalData?.nomorInduk}
                    className={getInputClass('nomorInduk')}
                    placeholder="NIM/NIS/NRP"
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat Institusi <span className="text-red-500">*</span></label>
                <textarea
                    name="alamatInstitusi"
                    value={localFormData.alamatInstitusi || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing || !!originalData?.alamatInstitusi}
                    rows={3}
                    className={getInputClass('alamatInstitusi')}
                    placeholder="Alamat lengkap institusi"
                />
                {errors.alamatInstitusi && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                        <AlertCircle className="w-4 h-4" />{errors.alamatInstitusi}
                    </p>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Institusi <span className="text-red-500">*</span></label>
                    <input
                        type="email"
                        name="emailInstitusi"
                        value={localFormData.emailInstitusi || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing || !!originalData?.emailInstitusi}
                        className={getInputClass('emailInstitusi')}
                        placeholder="email@institusi.ac.id"
                    />
                    {errors.emailInstitusi && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                            <AlertCircle className="w-4 h-4" />{errors.emailInstitusi}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">No. Telepon Institusi</label>
                    <input
                        type="tel"
                        name="noTeleponInstitusi"
                        value={localFormData.noTeleponInstitusi || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing || !!originalData?.noTeleponInstitusi}
                        className={getInputClass('noTeleponInstitusi')}
                        placeholder="021-1234567"
                    />
                </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Informasi Pembimbing Institusi</h3>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Pembimbing</label>
                        <input
                            type="text"
                            name="namaPembimbing"
                            value={localFormData.namaPembimbing || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing || !!originalData?.namaPembimbing}
                            className={getInputClass('namaPembimbing')}
                            placeholder="Nama Lengkap & Gelar"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">No. Telepon Pembimbing</label>
                        <input
                            type="tel"
                            name="noTeleponPembimbing"
                            value={localFormData.noTeleponPembimbing || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing || !!originalData?.noTeleponPembimbing}
                            className={getInputClass('noTeleponPembimbing')}
                            placeholder="081234567890"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Pembimbing</label>
                    <input
                        type="email"
                        name="emailPembimbing"
                        value={localFormData.emailPembimbing || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing || !!originalData?.emailPembimbing}
                        className={getInputClass('emailPembimbing')}
                        placeholder="dosen@institusi.ac.id"
                    />
                </div>
            </div>
        </div>
    );
};

export default InstitutionTab;
