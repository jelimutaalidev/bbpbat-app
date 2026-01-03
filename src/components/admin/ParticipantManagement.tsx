import React, { useState, useEffect, useMemo } from 'react';
import { Users, Building, Eye, Search, CheckCircle, Clock, AlertCircle, X, UserCheck, GraduationCap, FileText } from 'lucide-react';
import { getParticipants } from '../../api/apiService';

// Tipe data untuk profil peserta (disesuaikan agar lebih kuat)
interface ParticipantProfile {
  id: number;
  user: {
    id: number;
    email: string;
    nama_lengkap: string;
  };
  tipe_peserta: 'PELAJAR' | 'UMUM';
  nama_institusi: string;
  profil_lengkap: boolean;
  dokumen_lengkap: boolean;
  status: 'Aktif' | 'Selesai' | 'Lulus';
  penempatan: { nama: string } | null;
  tanggal_mulai: string;
  tanggal_selesai: string;
  // Menambahkan data yang mungkin ada dari backend
  alamat?: string;
  no_telepon?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
}

// =================================================================
// SUB-KOMPONEN UNTUK UI YANG LEBIH BERSIH DAN PROFESIONAL
// =================================================================

// 1. Kartu Statistik yang Didesain Ulang
const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4 transition-all hover:shadow-md">
    <div className={`rounded-full p-3 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

// 2. Baris Tabel dengan Progress Bar
const ParticipantTableRow: React.FC<{ participant: ParticipantProfile; onViewDetail: () => void }> = ({ participant, onViewDetail }) => {
  const progress = (participant.profil_lengkap ? 50 : 0) + (participant.dokumen_lengkap ? 50 : 0);
  
  const statusMap = {
    Aktif: { text: "Aktif", color: "bg-sky-100 text-sky-800", icon: <Clock className="w-4 h-4" /> },
    Selesai: { text: "Selesai", color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-4 h-4" /> },
    Lulus: { text: "Lulus", color: "bg-indigo-100 text-indigo-800", icon: <GraduationCap className="w-4 h-4" /> },
  };
  // =================================================================
  // BAGIAN YANG DIPERBAIKI ADA DI SINI
  // =================================================================
  const defaultStyle = { text: "N/A", color: "bg-gray-100 text-gray-800", icon: <AlertCircle className="w-4 h-4" /> };
  // Jika status tidak dikenali, gunakan defaultStyle untuk mencegah error
  const statusStyle = statusMap[participant.status] || defaultStyle;
  // =================================================================

  return (
    <tr className="border-b hover:bg-gray-50 transition-colors">
      <td className="px-5 py-4 whitespace-nowrap">
        <p className="font-semibold text-gray-900">{participant.user.nama_lengkap}</p>
        <p className="text-sm text-gray-500">{participant.user.email}</p>
      </td>
      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">{participant.nama_institusi}</td>
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium ${statusStyle.color}`}>
              {statusStyle.icon}
              <span>{statusStyle.text}</span>
            </div>
        </div>
      </td>
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">{progress}% Kelengkapan</p>
      </td>
      <td className="px-5 py-4 whitespace-nowrap text-sm font-medium">
        <button onClick={onViewDetail} className="flex items-center gap-2 px-3 py-1.5 font-semibold text-white bg-gray-800 rounded-lg shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all">
          <Eye className="w-4 h-4" /> Detail
        </button>
      </td>
    </tr>
  );
};

// 3. Modal Detail Peserta yang Ditingkatkan
const ParticipantDetailModal: React.FC<{ participant: ParticipantProfile; onClose: () => void }> = ({ participant, onClose }) => {
    // ... implementasi modal yang lebih baik ...
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">Detail Peserta</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Kolom Kiri */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Informasi Pribadi</h4>
                        <div>
                            <p className="text-sm text-gray-500">Nama Lengkap</p>
                            <p className="font-semibold text-gray-800">{participant.user.nama_lengkap}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-semibold text-gray-800">{participant.user.email}</p>
                        </div>
                         <div>
                            <p className="text-sm text-gray-500">No. Telepon</p>
                            <p className="font-semibold text-gray-800">{participant.no_telepon || 'Belum diisi'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tempat, Tanggal Lahir</p>
                            <p className="font-semibold text-gray-800">{participant.tempat_lahir || 'N/A'}, {participant.tanggal_lahir ? new Date(participant.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</p>
                        </div>
                    </div>
                    {/* Kolom Kanan */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Informasi Bimbingan</h4>
                        <div>
                            <p className="text-sm text-gray-500">Asal Institusi</p>
                            <p className="font-semibold text-gray-800">{participant.nama_institusi}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Penempatan</p>
                            <p className="font-semibold text-gray-800">{participant.penempatan?.nama || 'Belum ditempatkan'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Periode</p>
                            <p className="font-semibold text-gray-800">{new Date(participant.tanggal_mulai).toLocaleDateString('id-ID')} - {new Date(participant.tanggal_selesai).toLocaleDateString('id-ID')}</p>
                        </div>
                         <div>
                            <p className="text-sm text-gray-500">Status Kelengkapan</p>
                             <div className="flex gap-4 mt-1">
                                <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${participant.profil_lengkap ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {participant.profil_lengkap ? <CheckCircle className="w-3 h-3"/> : <AlertCircle className="w-3 h-3"/>} Profil
                                </span>
                                <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${participant.dokumen_lengkap ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {participant.dokumen_lengkap ? <CheckCircle className="w-3 h-3"/> : <AlertCircle className="w-3 h-3"/>} Dokumen
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 4. Skeleton Loader yang Modern
const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
    <div className="w-full animate-pulse">
        {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border-b border-gray-200">
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
            </div>
        ))}
    </div>
);

// =================================================================
// KOMPONEN UTAMA YANG SUDAH DISEMPURNAKAN
// =================================================================
const ParticipantManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PELAJAR' | 'UMUM'>('PELAJAR');
  const [activeStatus, setActiveStatus] = useState<'active' | 'completed' | 'graduated'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantProfile | null>(null);

  // State untuk data tabel yang sedang ditampilkan
  const [participants, setParticipants] = useState<ParticipantProfile[]>([]);

  // State BARU untuk menyimpan angka statistik secara terpisah
  const [stats, setStats] = useState({ active: '...', completed: '...', graduated: '...' });

  // State loading yang lebih spesifik
  const [loadingTable, setLoadingTable] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("Komponen ParticipantManagement dirender ulang...");

  // HAPUS useEffect lama Anda dan GANTI dengan DUA blok ini

// EFEK 1: KHUSUS UNTUK MENGAMBIL DATA STATISTIK
useEffect(() => {
  const fetchStats = async () => {
    console.log(`[EFEK STATS] Mengambil statistik untuk: ${activeTab}`);
    setLoadingStats(true);
    try {
      // Lakukan 3 panggilan API secara bersamaan untuk efisiensi
      const [activeRes, completedRes, graduatedRes] = await Promise.all([
        getParticipants(activeTab, 'active'),
        getParticipants(activeTab, 'completed'),
        getParticipants(activeTab, 'graduated')
      ]);
      // Simpan hanya jumlahnya (length)
      setStats({
        active: activeRes.data.length,
        completed: completedRes.data.length,
        graduated: graduatedRes.data.length,
      });
    } catch (err) {
      console.error("Gagal mengambil statistik peserta:", err);
      // Jangan set error utama agar tabel tetap bisa dimuat
      setStats({ active: '!', completed: '!', graduated: '!' });
    } finally {
      setLoadingStats(false);
    }
  };
  fetchStats();
}, [activeTab]); // <-- Hanya dijalankan saat tab Pelajar/Umum berubah

// EFEK 2: KHUSUS UNTUK MENGAMBIL DATA ISI TABEL
useEffect(() => {
  const fetchTableData = async () => {
    console.log(`[EFEK TABEL] Mengambil data tabel untuk status: ${activeStatus}`);
    setLoadingTable(true);
    setError(null);
    try {
      const response = await getParticipants(activeTab, activeStatus);
      setParticipants(response.data);
    } catch (err) {
      console.error(`Gagal mengambil data untuk status ${activeStatus}:`, err);
      setError("Gagal memuat data tabel. Silakan coba lagi.");
      setParticipants([]); // Kosongkan tabel jika error
    } finally {
      setLoadingTable(false);
    }
  };
  fetchTableData();
}, [activeTab, activeStatus]); // <-- Dijalankan saat tab Pelajar/Umum atau Aktif/Selesai/Lulus berubah

  const filteredParticipants = useMemo(() => {
  if (!searchTerm) return participants; // Langsung gunakan state 'participants'
  return participants.filter(p => 
      p.user.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nama_institusi.toLowerCase().includes(searchTerm.toLowerCase())
    );
}, [participants, searchTerm]);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Data Peserta</h1>
        <p className="mt-1 text-gray-600">Kelola dan pantau seluruh data peserta bimbingan teknis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Peserta Aktif" value={loadingStats ? '...' : stats.active} icon={<UserCheck className="w-6 h-6 text-sky-800" />} color="bg-sky-200" />
        <StatCard title="Peserta Selesai" value={loadingStats ? '...' : stats.completed} icon={<CheckCircle className="w-6 h-6 text-green-800" />} color="bg-green-200" />
        <StatCard title="Peserta Lulus" value={loadingStats ? '...' : stats.graduated} icon={<GraduationCap className="w-6 h-6 text-indigo-800" />} color="bg-indigo-200" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button onClick={() => setActiveTab('PELAJAR')} className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'PELAJAR' ? 'border-gray-800 text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              <Users className="w-5 h-5" /> Pelajar
            </button>
            <button onClick={() => setActiveTab('UMUM')} className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'UMUM' ? 'border-gray-800 text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              <Building className="w-5 h-5" /> Masyarakat/Dinas
            </button>
          </nav>
        </div>
        
        <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-5">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="text" placeholder="Cari nama atau instansi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-lg">
                    <button onClick={() => setActiveStatus('active')} className={`px-3 py-1.5 text-sm font-semibold rounded-md flex-1 transition-colors ${activeStatus === 'active' ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}>Aktif</button>
                    <button onClick={() => setActiveStatus('completed')} className={`px-3 py-1.5 text-sm font-semibold rounded-md flex-1 transition-colors ${activeStatus === 'completed' ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}>Selesai</button>
                    <button onClick={() => setActiveStatus('graduated')} className={`px-3 py-1.5 text-sm font-semibold rounded-md flex-1 transition-colors ${activeStatus === 'graduated' ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}>Lulus</button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Peserta</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Instansi</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status Peserta</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kelengkapan</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loadingTable ? (
                           <TableSkeleton />
                        ) : error ? (
                            <tr><td colSpan={5} className="text-center p-8 text-red-600 flex items-center justify-center gap-2"><AlertCircle className="w-6 h-6" /> {error}</td></tr>
                        ) : filteredParticipants.length > 0 ? (
                            filteredParticipants.map(p => (
                                <ParticipantTableRow key={p.id} participant={p} onViewDetail={() => setSelectedParticipant(p)} />
                            ))
                        ) : (
                            <tr><td colSpan={5} className="text-center p-12">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">Tidak Ada Data</h3>
                                <p className="text-gray-500">Tidak ada peserta yang cocok dengan filter yang dipilih.</p>
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {selectedParticipant && <ParticipantDetailModal participant={selectedParticipant} onClose={() => setSelectedParticipant(null)} />}
    </div>
  );
};

export default ParticipantManagement;