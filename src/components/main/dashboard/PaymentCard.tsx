import React from 'react';
import { Eye } from 'lucide-react';
import { PembayaranStatus } from '../../../types/dashboard';

interface PaymentCardProps {
    pembayaranStatus: PembayaranStatus;
    setActiveComponent: (component: string) => void;
}

const PaymentCard: React.FC<PaymentCardProps> = ({ pembayaranStatus, setActiveComponent }) => {
    const getStatusBadge = (status: string | null) => {
        switch (status) {
            case 'Telah Diverifikasi': return 'bg-green-100 text-green-800';
            case 'Ditolak': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return pembayaranStatus.sudah_diunggah ? (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Status Bukti Pembayaran</h3>
                    <p className="text-sm text-gray-500">
                        Diunggah pada: {new Date(pembayaranStatus.tanggal_unggah!).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <a
                    href={pembayaranStatus.file_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-full sm:w-auto"
                >
                    <Eye className="w-4 h-4" />
                    Lihat Bukti
                </a>
            </div>
            <div className="mt-4 border-t pt-4">
                <p className="text-sm font-medium text-gray-600 mb-1">Status Verifikasi:</p>
                <span className={`inline-block px-3 py-1 text-xs font-bold leading-none rounded-full ${getStatusBadge(pembayaranStatus.status_verifikasi)}`}>
                    {pembayaranStatus.status_verifikasi || 'Menunggu Verifikasi'}
                </span>
            </div>
        </div>
    ) : (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h3 className="text-lg font-semibold text-gray-800">Status Bukti Pembayaran</h3>
                <p className="text-sm text-gray-500">Anda belum mengunggah bukti pembayaran.</p>
            </div>
            <button
                onClick={() => setActiveComponent('payment')}
                className="bg-blue-600 text-white hover:bg-blue-700 font-medium py-2 px-4 rounded-lg text-sm transition-colors w-full sm:w-auto"
            >
                Unggah Bukti
            </button>
        </div>
    );
};

export default PaymentCard;
