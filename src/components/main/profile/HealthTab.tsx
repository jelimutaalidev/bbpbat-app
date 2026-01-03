import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ProfileData } from '../../../types/profile';

interface HealthTabProps {
    localFormData: ProfileData;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    isEditing: boolean;
    errors: Record<string, string>;
    originalData: ProfileData;
}

const HealthTab: React.FC<HealthTabProps> = ({
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
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                    Informasi kesehatan ini penting untuk keselamatan Anda selama kegiatan PKL. Mohon isi dengan jujur.
                </p>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Riwayat Penyakit (2 tahun terakhir) <span className="text-red-500">*</span></label>
                <textarea
                    name="riwayatPenyakit"
                    value={localFormData.riwayatPenyakit || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing || !!originalData?.riwayatPenyakit}
                    rows={4}
                    className={getInputClass('riwayatPenyakit')}
                    placeholder="Tuliskan riwayat penyakit dalam 2 tahun terakhir. Jika tidak ada, tulis 'Tidak ada'"
                />
                {errors.riwayatPenyakit && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                        <AlertCircle className="w-4 h-4" />{errors.riwayatPenyakit}
                    </p>
                )}
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Penanganan Khusus yang Diperlukan <span className="text-red-500">*</span></label>
                <textarea
                    name="penangananKhusus"
                    value={localFormData.penangananKhusus || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing || !!originalData?.penangananKhusus}
                    rows={3}
                    className={getInputClass('penangananKhusus')}
                    placeholder="Tuliskan jika ada penanganan khusus yang diperlukan (alergi obat/makanan, dsb). Jika tidak ada, tulis 'Tidak ada'"
                />
                {errors.penangananKhusus && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                        <AlertCircle className="w-4 h-4" />{errors.penangananKhusus}
                    </p>
                )}
            </div>
        </div>
    );
};

export default HealthTab;
