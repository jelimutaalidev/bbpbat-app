import React from 'react';
import { User, Mail, Phone } from 'lucide-react';
import { PembimbingProfile } from '../../../types/dashboard';

interface MentorCardProps {
    pembimbing: PembimbingProfile | null;
}

const MentorCard: React.FC<MentorCardProps> = ({ pembimbing }) => {
    if (!pembimbing) return null;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Pembimbing Anda</h2>
            <div className="flex items-center space-x-4 mb-4">
                {pembimbing.foto_url ? (
                    <img
                        src={pembimbing.foto_url}
                        alt={pembimbing.nama_lengkap}
                        className="w-16 h-16 rounded-full bg-gray-200 object-cover border border-gray-100"
                    />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border border-gray-100">
                        <User className="w-8 h-8 text-gray-500" />
                    </div>
                )}
                <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1">{pembimbing.nama_lengkap}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1">{pembimbing.jabatan}</p>
                </div>
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{pembimbing.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{pembimbing.telepon}</span>
                </div>
            </div>
        </div>
    );
};

export default MentorCard;
