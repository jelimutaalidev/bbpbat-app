import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ProfileData } from '../../../types/profile';

interface InternshipTabProps {
    localFormData: ProfileData;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    isEditing: boolean;
    errors: Record<string, string>;
    originalData: ProfileData;
    placementOptions: string[];
}

const InternshipTab: React.FC<InternshipTabProps> = ({
    localFormData,
    handleInputChange,
    isEditing,
    errors,
    originalData,
    placementOptions,
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Rencana Mulai PKL <span className="text-red-500">*</span></label>
                    <input
                        type="date"
                        name="rencanaMultai"
                        value={localFormData.rencanaMultai || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing || !!originalData?.rencanaMultai}
                        className={getInputClass('rencanaMultai')}
                    />
                    {errors.rencanaMultai && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                            <AlertCircle className="w-4 h-4" />{errors.rencanaMultai}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Rencana Akhir PKL <span className="text-red-500">*</span></label>
                    <input
                        type="date"
                        name="rencanaAkhir"
                        value={localFormData.rencanaAkhir || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing || !!originalData?.rencanaAkhir}
                        className={getInputClass('rencanaAkhir')}
                    />
                    {errors.rencanaAkhir && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                            <AlertCircle className="w-4 h-4" />{errors.rencanaAkhir}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pilihan Penempatan PKL <span className="text-red-500">*</span></label>
                    <select
                        name="penempatanPKL"
                        value={localFormData.penempatanPKL || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing || !!originalData?.penempatanPKL}
                        className={getInputClass('penempatanPKL')}
                    >
                        <option value="">Pilih unit penempatan</option>
                        {placementOptions.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                    {errors.penempatanPKL && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                            <AlertCircle className="w-4 h-4" />{errors.penempatanPKL}
                        </p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">
                        Pilih unit kerja yang paling sesuai dengan minat dan jurusan Anda.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InternshipTab;
