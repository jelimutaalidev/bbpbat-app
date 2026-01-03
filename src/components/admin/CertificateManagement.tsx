import React, { useState, useEffect, useMemo } from 'react';
import { Users, Building, Award, Download, Search, CheckCircle, Clock, Send, Hourglass, Eye } from 'lucide-react';
import {
  getEligibleForCertificate,
  generateCertificate,
} from '../../api/apiService';
import CertificatePreview from './CertificatePreview';

// Interface untuk data peserta dari API
interface ParticipantData {
  id: number;
  nama: string;
  institusi: string;
  tipe_peserta: 'PELAJAR' | 'UMUM';
  penempatan: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  // Status lokal untuk UI
  status: 'siap_terbit' | 'diterbitkan';
  nomorSertifikat?: string;
  no_telepon?: string;
}

const CertificateManagement: React.FC = () => {
  // State untuk data, loading, dan UI kontrol
  const [allParticipants, setAllParticipants] = useState<ParticipantData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  // State untuk Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null); // Tipe data bisa diperjelas

  // State UI yang sudah ada kita pertahankan
  const [activeTab, setActiveTab] = useState('student');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mengambil data dari API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getEligibleForCertificate();
        // Transformasi data dari API ke format yang dibutuhkan UI
        const transformedData: ParticipantData[] = response.data.map(p => ({
          ...p,
          no_telepon: p.no_telepon,
          status: 'siap_terbit', // Semua yang dari endpoint ini statusnya 'siap_terbit'
        }));
        setAllParticipants(transformedData);
      } catch (err) {
        console.error("Gagal mengambil data sertifikat:", err);
        setError("Gagal memuat data dari server. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Logika filter yang sudah ada, kini berjalan pada data dari API
  const filteredData = useMemo(() => {
    const dataByTab = allParticipants.filter(p =>
      activeTab === 'student' ? p.tipe_peserta === 'PELAJAR' : p.tipe_peserta === 'UMUM'
    );

    return dataByTab.filter(item => {
      const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.institusi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.penempatan.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allParticipants, activeTab, searchTerm, statusFilter]);

  // Fungsi untuk menerbitkan sertifikat, kini memanggil API
  const handleIssueCertificate = async (participantId: number) => {
    setGeneratingId(participantId);
    try {
      const response = await generateCertificate(participantId);
      alert(`Sertifikat berhasil diterbitkan untuk ${response.data.peserta.nama}!\nNomor: ${response.data.nomor_sertifikat}`);

      // Update UI: ubah status peserta yang bersangkutan menjadi 'diterbitkan'
      setAllParticipants(prev => prev.map(p =>
        p.id === participantId
          ? {
            ...p,
            status: 'diterbitkan',
            nomorSertifikat: response.data.nomor_sertifikat,
          }
          : p
      ));
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Terjadi kesalahan.";
      alert(`Error: ${errorMessage} `);
    } finally {
      setGeneratingId(null);
    }
  };

  const handlePreview = (participant: ParticipantData) => {
    // Siapkan data untuk preview
    // Jika belum diterbitkan, kita gunakan placeholder nomor sertifikat
    const isPublished = participant.status === 'diterbitkan';
    const nomor = isPublished ? participant.nomorSertifikat! : "BBPBAT/CERT/PREVIEW/XXX";

    setPreviewData({
      nama: participant.nama,
      nomorSertifikat: nomor,
      institusi: participant.institusi,
      penempatan: participant.penempatan,
      tanggalMulai: formatDate(participant.tanggal_mulai),
      tanggalSelesai: formatDate(participant.tanggal_selesai),
      tanggalTerbit: formatDate(new Date().toISOString()), // Hari ini atau ambil dari backend jika ada
    });
    setIsPreviewOpen(true);
  };

  // Helper Functions yang sudah ada, kita pertahankan
  const tabs = [
    { id: 'student', label: 'Pelajar', icon: <Users className="w-4 h-4" /> },
    { id: 'general', label: 'Masyarakat/Dinas', icon: <Building className="w-4 h-4" /> }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'siap_terbit': return 'bg-blue-100 text-blue-800';
      case 'diterbitkan': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'siap_terbit': return 'Siap Terbit';
      case 'diterbitkan': return 'Diterbitkan';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'siap_terbit': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'diterbitkan': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  // formatDateCustom is no longer needed as pdf-lib generation is removed
  // const formatDateCustom = (dateString: string) => {
  //   return new Date(dateString).toLocaleDateString('id-ID', {
  //     day: 'numeric', month: 'long', year: 'numeric'
  //   });
  // }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manajemen Sertifikat</h1>
        <p className="text-gray-500 mt-2 text-lg">Kelola penerbitan sertifikat peserta bimbingan teknis dengan mudah.</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/50">
          <nav className="flex space-x-8 px-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group py-5 px-1 border-b-2 font-medium text-sm flex items-center gap-2.5 transition-all duration-150 ${activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                  }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                  {tab.icon}
                </div>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-5 mb-8 items-center justify-between">
            <div className="relative flex-1 w-full md:max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari nama, instansi, atau penempatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg bg-gray-50 shadow-sm transition-all"
              >
                <option value="all">Semua Status</option>
                <option value="siap_terbit">Siap Terbit</option>
                <option value="diterbitkan">Diterbitkan</option>
              </select>
              <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all shadow-md active:scale-95 whitespace-nowrap">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Peserta</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Penempatan</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Periode</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {isLoading ? (
                    <tr><td colSpan={5} className="text-center p-12 text-gray-500 italic">Memuat data sertifikat...</td></tr>
                  ) : error ? (
                    <tr><td colSpan={5} className="text-center p-12 text-red-500 bg-red-50">{error}</td></tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="p-4 bg-gray-50 rounded-full mb-4">
                            <Award className="w-10 h-10 text-gray-300" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900">Tidak ada data ditemukan</h3>
                          <p className="text-gray-500 max-w-sm mt-1">Belum ada peserta yang memenuhi kriteria pencarian atau status ini.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((participant) => (
                      <tr key={participant.id} className="hover:bg-gray-50/80 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-sm border border-indigo-200">
                              {participant.nama.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">{participant.nama}</div>
                              <div className="text-xs text-gray-500">{participant.institusi}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 font-medium bg-gray-50 px-3 py-1 rounded-md inline-block border border-gray-100">
                            {participant.penempatan}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 flex flex-col">
                            <span>{formatDate(participant.tanggal_mulai)}</span>
                            <span className="text-gray-400 text-xs">s/d {formatDate(participant.tanggal_selesai)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-1">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${participant.status === 'diterbitkan'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                              {participant.status === 'diterbitkan' ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1.5" />
                                  Diterbitkan
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 mr-1.5" />
                                  Siap Terbit
                                </>
                              )}
                            </span>
                            {participant.nomorSertifikat && (
                              <span className="text-[10px] text-gray-400 font-mono tracking-tight ml-1">
                                {participant.nomorSertifikat}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex items-center gap-2">
                            {/* Tombol WhatsApp (Manual) */}
                            {participant.no_telepon ? (
                              <button
                                onClick={() => {
                                  // Format nomor telepon: hapus 0 di depan, tambah 62, hapus karakter non-digit
                                  let phone = participant.no_telepon?.replace(/\D/g, '');
                                  if (phone?.startsWith('0')) {
                                    phone = '62' + phone.substring(1);
                                  }

                                  const text = encodeURIComponent(
                                    `Halo ${participant.nama},\n\n` +
                                    `Selamat! Anda telah menyelesaikan kegiatan PKL/Magang di BBPBAT dengan baik.\n` +
                                    `Berikut kami lampirkan sertifikat kelulusan Anda.\n\n` +
                                    `Terima kasih.`
                                  );

                                  window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
                                }}
                                className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-100 flex items-center gap-1"
                                title="Kirim vi WhatsApp"
                              >
                                <Send className="w-5 h-5" />
                                <span className="text-xs font-medium">Kirim WA</span>
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400 italic px-2">No WA Tidak Ada</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`mt-8 rounded-xl p-6 border ${activeTab === 'student' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'
            }`}>
            <div className="flex gap-4">
              <div className={`p-2 rounded-lg h-fit ${activeTab === 'student' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                <Award className={`w-6 h-6 ${activeTab === 'student' ? 'text-amber-600' : 'text-blue-600'}`} />
              </div>
              <div>
                <h3 className={`text-base font-semibold mb-2 ${activeTab === 'student' ? 'text-amber-900' : 'text-blue-900'}`}>
                  {activeTab === 'student' ? 'Syarat Penerbitan (Pelajar/Mahasiswa)' : 'Syarat Penerbitan (Umum/Dinas)'}
                </h3>
                <ul className={`text-sm list-disc list-inside space-y-1.5 ${activeTab === 'student' ? 'text-amber-800' : 'text-blue-800'}`}>
                  {activeTab === 'student' ? (
                    <>
                      <li>Status bimbingan telah <strong>Selesai</strong>.</li>
                      <li>Laporan akhir telah diunggah dan berstatus <strong>Diterima</strong>.</li>
                    </>
                  ) : (
                    <>
                      <li>Status bimbingan telah <strong>Selesai</strong>.</li>
                      <li>Bukti pembayaran telah diunggah dan berstatus <strong>Diterima</strong>.</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Preview Modal */}
      <CertificatePreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={previewData}
      />
    </div>
  );
};

export default CertificateManagement;