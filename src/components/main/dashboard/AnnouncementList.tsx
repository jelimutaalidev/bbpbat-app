import React from 'react';
import { Megaphone } from 'lucide-react';
import { Pengumuman } from '../../../types/dashboard';

interface AnnouncementListProps {
    announcements: Pengumuman[];
    onAnnouncementClick: (id: number) => void;
}

const AnnouncementList: React.FC<AnnouncementListProps> = ({ announcements, onAnnouncementClick }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Pengumuman Terkini</h2>
                </div>
            </div>
            <div className="p-6 flex-grow overflow-y-auto max-h-[400px]">
                {announcements.length > 0 ? (
                    <ul className="space-y-2">
                        {announcements.map(item => (
                            <li key={item.id}
                                onClick={() => onAnnouncementClick(item.id)}
                                className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors duration-200 group">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full group-hover:bg-blue-200 transition-colors">
                                        {item.kategori}
                                    </span>
                                </div>
                                <p className="font-semibold text-gray-800 leading-tight group-hover:text-blue-700 transition-colors">
                                    {item.judul}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(item.tanggalPublish).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-center py-8">Tidak ada pengumuman baru.</p>
                )}
            </div>
        </div>
    );
};

export default AnnouncementList;
