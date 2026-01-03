// File: src/components/main/Certificate.tsx

import React, { useState, useEffect } from 'react';
import { Award, Clock, Download, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { 
  getParticipantCertificate, 
  ParticipantCertificateStatus,
  CertificateRequirement,
  CertificateDetail
} from '../../api/apiService';

// =================================================================
// 1. Komponen untuk Tampilan Sertifikat SUDAH DITERBITKAN
// =================================================================
const CertificateIssuedView: React.FC<{ certificate: CertificateDetail }> = ({ certificate }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-6 md:p-8 grid md:grid-cols-3 gap-6 items-center">
      <div className="flex justify-center md:justify-start">
        <div className="bg-green-100 p-6 rounded-full">
          <Award className="w-16 h-16 text-green-600" />
        </div>
      </div>
      <div className="md:col-span-2 text-center md:text-left">
        <h2 className="text-xl font-bold text-gray-800">Sertifikat Telah Diterbitkan!</h2>
        <p className="text-gray-600 mt-1">Selamat, Anda telah berhasil menyelesaikan program.</p>
        <div className="mt-4 bg-gray-50 border rounded-md p-4 text-sm text-left">
          <div className="flex justify-between items-center py-1">
            <span className="font-medium text-gray-500">Nomor Sertifikat</span>
            <span className="font-mono text-gray-800">{certificate.nomor_sertifikat}</span>
          </div>
          <div className="flex justify-between items-center py-1 mt-1 border-t">
            <span className="font-medium text-gray-500">Tanggal Terbit</span>
            <span className="font-mono text-gray-800">{new Date(certificate.tanggal_terbit).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        <a 
          href={certificate.file_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-transform hover:scale-105"
        >
          <Download className="w-5 h-5" />
          Unduh Sertifikat (.docx)
        </a>
      </div>
    </div>
  </div>
);

// =================================================================
// 2. Komponen untuk Tampilan MENUNGGU PENERBITAN
// =================================================================
const CertificateWaitingView: React.FC = () => (
  <div className="bg-sky-50 rounded-lg shadow-sm border border-sky-200 p-8 text-center">
    <Clock className="w-16 h-16 text-sky-500 mx-auto mb-4" />
    <h2 className="text-xl font-semibold text-sky-900 mb-2">
      Selamat, Anda Telah Memenuhi Syarat!
    </h2>
    <p className="text-sky-800 max-w-md mx-auto">
      Sertifikat Anda sedang dalam antrean untuk diverifikasi dan diterbitkan oleh admin. 
      Silakan periksa kembali halaman ini secara berkala.
    </p>
  </div>
);

// =================================================================
// 3. Komponen untuk Tampilan BELUM MEMENUHI SYARAT
// =================================================================
const CertificateRequirementsView: React.FC<{ requirements: CertificateRequirement[] }> = ({ requirements }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    <div className="p-6">
      <div className="flex items-center gap-3">
        <FileText className="w-8 h-8 text-gray-500" />
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Langkah Menuju Sertifikat</h2>
          <p className="text-gray-600">Selesaikan semua persyaratan di bawah ini untuk melanjutkan.</p>
        </div>
      </div>
    </div>
    <div className="border-t border-gray-200 px-6 py-4">
      <ul className="space-y-4">
        {requirements.map((req, index) => (
          <li key={index} className="flex items-center gap-3">
            {req.terpenuhi ? (
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-gray-400 flex-shrink-0" />
            )}
            <span className={`text-sm ${req.terpenuhi ? 'text-gray-800' : 'text-gray-500'}`}>
              {req.deskripsi}
            </span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

// =================================================================
// 4. Komponen UTAMA dengan Logika Fetching & Conditional Rendering
// =================================================================
const Certificate: React.FC = () => {
  const [statusInfo, setStatusInfo] = useState<ParticipantCertificateStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificateStatus = async () => {
      try {
        const response = await getParticipantCertificate();
        setStatusInfo(response.data);
      } catch (err) {
        console.error("Gagal mengambil status sertifikat:", err);
        setError("Gagal terhubung ke server. Silakan coba beberapa saat lagi.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCertificateStatus();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 animate-pulse">
          <div className="h-8 bg-gray-200 rounded-md w-1/2 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded-md w-3/4 mx-auto"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-8 text-center text-red-800">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4"/>
            <h3 className="font-semibold mb-2">Terjadi Kesalahan</h3>
            <p>{error}</p>
        </div>
      );
    }
    
    switch (statusInfo?.status) {
      case 'DITERBITKAN':
        // Type guard untuk memastikan data adalah CertificateDetail
        const certData = statusInfo.data as CertificateDetail;
        return <CertificateIssuedView certificate={certData} />;
      case 'MENUNGGU_PENERBITAN':
        return <CertificateWaitingView />;
      case 'BELUM_MEMENUHI_SYARAT':
        // Type guard untuk memastikan data adalah persyaratan
        const reqData = (statusInfo.data as { persyaratan: CertificateRequirement[] })?.persyaratan || [];
        return <CertificateRequirementsView requirements={reqData} />;
      default:
        return <p className="text-center text-gray-500">Status tidak diketahui.</p>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Sertifikat</h1>
        <p className="text-gray-600">Lihat status dan unduh sertifikat kelulusan Anda.</p>
      </div>
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default Certificate;