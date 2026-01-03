import React from 'react';
import { X, Loader2 } from 'lucide-react';
import { Pengumuman } from '../../../types/dashboard';

interface AnnouncementModalProps {
    isOpen: boolean;
    loading: boolean;
    announcement: Pengumuman | null;
    onClose: () => void;
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({ isOpen, loading, announcement, onClose }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-transform duration-300 scale-100 animate-in fade-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white rounded-t-lg z-10">
                    <h2 className="text-xl font-bold text-gray-800">Detail Pengumuman</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors p-1 hover:bg-gray-100 rounded-full">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : announcement ? (
                        <>
                            <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                                {announcement.kategori}
                            </span>
                            <h3 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
                                {announcement.judul}
                            </h3>
                            <p className="text-sm text-gray-500 mb-5 border-b pb-4">
                                Dipublikasikan pada: {new Date(announcement.tanggalPublish).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <div className="prose max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: announcement.konten }} />
                        </>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-red-500 font-medium">Gagal memuat konten pengumuman.</p>
                            <button onClick={onClose} className="mt-4 text-blue-600 hover:underline">Tutup</button>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t bg-gray-50 rounded-b-lg text-right sticky bottom-0">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 hover:bg-gray-300 font-bold py-2 px-6 rounded-lg transition-colors">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementModal;
