import React from 'react';
import { Award } from 'lucide-react';

interface CertificateCardProps {
    isAvailable: boolean;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ isAvailable }) => {
    return (
        <div className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 transition-all duration-200 ${isAvailable ? 'cursor-pointer hover:border-purple-400 hover:shadow-md' : ''}`}>
            <div className="bg-purple-100 rounded-lg p-2 w-min mb-4">
                <Award className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">
                {isAvailable ? '1/1' : '0/1'}
            </h3>
            <p className="text-gray-600 text-sm font-medium">
                {isAvailable ? 'Sertifikat Siap Diunduh' : 'Sertifikat Belum Tersedia'}
            </p>
        </div>
    );
};

export default CertificateCard;
