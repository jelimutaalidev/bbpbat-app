// src/components/main/Reports.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, AlertCircle, Upload, Loader2, MessageSquare, Download, CheckCircle, Clock, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { getParticipantReports } from '../../api/apiService';
import UploadReportModal from './UploadReportModal';

// Interface untuk data props
interface ReportsProps {
  userData: {
    profileComplete: boolean;
    documentsComplete: boolean;
  };
}

// Interface untuk data laporan dari backend
interface ParticipantReport {
  id: number;
  judul: string;
  deskripsi: string;
  tanggalSubmit: string;
  status: string;
  feedback_admin: string;
  fileUrl: string;
  filename: string;
}

const Reports: React.FC<ReportsProps> = ({ userData }) => {
  const [reports, setReports] = useState<ParticipantReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getParticipantReports();
      setReports(response.data);
    } catch (err) {
      console.error("Gagal mengambil riwayat laporan:", err);
      setError("Gagal memuat riwayat laporan.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userData.profileComplete && userData.documentsComplete) {
      fetchReports();
    }
  }, [userData.profileComplete, userData.documentsComplete, fetchReports]);
  
  const getStatusChip = (status: string) => {
    switch (status) {
      case 'diterima':
        return <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full"><CheckCircle size={14} /> Diterima</span>;
      case 'ditolak':
        return <span className="flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full"><X size={14} /> Ditolak</span>;
      case 'direview':
        return <span className="flex items-center gap-1.5 text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full"><Clock size={14} /> Direview</span>;
      default:
        return <span className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full"><FileText size={14} /> Baru</span>;
    }
  };
  
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

  // Tampilan jika profil belum lengkap
  if (!userData.profileComplete || !userData.documentsComplete) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laporan</h1>
          <p className="text-gray-600">Kelola laporan kegiatan PKL Anda</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-orange-800 mb-2">Akses Terbatas</h3>
              <p className="text-orange-700">Untuk mengakses fitur laporan, Anda harus melengkapi profil dan dokumen wajib terlebih dahulu.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />
      <UploadReportModal 
        isOpen={isUploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => {
          setUploadModalOpen(false);
          fetchReports();
        }}
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laporan</h1>
          <p className="text-gray-600">Kelola laporan kegiatan PKL Anda</p>
        </div>
        <button 
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Upload size={18} /> Upload Laporan Baru
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20"><Loader2 className="w-8 h-8 mx-auto animate-spin text-gray-500" /></div>
      ) : error ? (
        <div className="text-center py-20 text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Laporan</h2>
          <p className="text-gray-600 max-w-md mx-auto">Anda belum pernah mengunggah laporan. Klik tombol "Upload Laporan Baru" untuk memulai.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusChip(report.status)}
                    <span className="text-sm text-gray-500">{formatDate(report.tanggalSubmit)}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">{report.judul}</h3>
                  <p className="text-sm text-gray-600 mt-1">{report.deskripsi}</p>
                </div>
                <a 
                  href={report.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-200"
                  title={report.filename}
                >
                  <Download size={16} /> Unduh
                </a>
              </div>
              {report.feedback_admin && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><MessageSquare size={16}/> Feedback dari Admin</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md italic">"{report.feedback_admin}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;