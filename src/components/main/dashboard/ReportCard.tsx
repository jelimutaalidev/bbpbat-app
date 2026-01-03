import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { LaporanStatus } from '../../../types/dashboard';

interface ReportCardProps {
    laporanStatus: LaporanStatus;
    setActiveComponent: (component: string) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ laporanStatus, setActiveComponent }) => {
    return laporanStatus.sudah_diunggah ? (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-teal-600 flex-shrink-0" />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Laporan Akhir Telah Diunggah</h3>
                        <p className="text-sm text-gray-500">
                            Diunggah pada: {new Date(laporanStatus.tanggal_unggah!).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>
            </div>
            <a
                href={laporanStatus.file_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium py-2 px-4 rounded-lg text-sm transition-colors w-full sm:w-auto text-center"
            >
                Lihat Laporan
            </a>
        </div>
    ) : (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h3 className="text-lg font-semibold text-gray-800">Status Laporan Akhir</h3>
                <p className="text-sm text-gray-500">Anda belum mengunggah laporan akhir program.</p>
            </div>
            <button
                onClick={() => setActiveComponent('reports')}
                className="bg-blue-600 text-white hover:bg-blue-700 font-medium py-2 px-4 rounded-lg text-sm transition-colors w-full sm:w-auto"
            >
                Unggah Laporan
            </button>
        </div>
    );
};

export default ReportCard;
