// src/components/admin/AdminDashboard.tsx

import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, Award, FileText, ArrowRight,
  Calendar, AlertTriangle, Loader2
} from 'lucide-react';
import { getAdminDashboardStats } from '../../api/apiService';

// Tipe data untuk props, tambahkan onNavigate untuk navigasi
interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

// Tipe data untuk statistik
interface StatsData {
  pendaftar_baru: number;
  peserta_aktif: number;
  peserta_selesai: number;
  peserta_lulus: number;
  laporan_baru: number;
}

// Tipe data untuk aktivitas terbaru dari backend
interface Activity {
  tipe: 'PENDAFTARAN' | 'LAPORAN';
  teks: string;
  waktu: string;
}

// Tipe data untuk seluruh respons API
interface DashboardData {
  stats: StatsData;
  aktivitas_terbaru: Activity[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAdminDashboardStats();
        setData(response.data);
      } catch (err) {
        console.error("Gagal mengambil data dashboard:", err);
        setError("Gagal memuat data dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Data untuk kartu statistik, sekarang dinamis dan lebih ringkas
  const statsCards = data ? [
    { title: 'Pendaftar Baru', value: data.stats.pendaftar_baru, icon: <Users/>, color: 'text-blue-600 bg-blue-100' },
    { title: 'Peserta Aktif', value: data.stats.peserta_aktif, icon: <UserCheck/>, color: 'text-green-600 bg-green-100' },
    { title: 'Laporan Baru', value: data.stats.laporan_baru, icon: <FileText/>, color: 'text-yellow-600 bg-yellow-100' },
    { title: 'Peserta Selesai', value: data.stats.peserta_selesai, icon: <Award/>, color: 'text-purple-600 bg-purple-100' },
  ] : [];

  // Data untuk "Tindakan Diperlukan", sekarang dengan link navigasi
  const pendingActions = data ? [
    { title: 'Review pendaftaran baru', count: data.stats.pendaftar_baru, priority: 'high', link: 'registrations' },
    { title: 'Periksa laporan baru', count: data.stats.laporan_baru, priority: 'medium', link: 'reports' },
    { title: 'Terbitkan sertifikat', count: data.stats.peserta_selesai, priority: 'low', link: 'certificates' }
  ].filter(a => a.count > 0) : []; // Hanya tampilkan jika count > 0

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg flex items-center justify-center gap-2"><AlertTriangle className="w-6 h-6" /> {error}</div>;
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Dashboard Admin BBPBAT</h1>
        <p className="opacity-90">Ringkasan aktivitas dan data penting sistem bimbingan teknis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className={`rounded-lg p-2 ${stat.color} w-min mb-4`}>{React.cloneElement(stat.icon, { className: 'w-6 h-6' })}</div>
            <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
            <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b"><h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-orange-600" />Tindakan Diperlukan</h2></div>
          <div className="p-6">
            {pendingActions.length > 0 ? (
              <div className="space-y-4">
                {pendingActions.map((action, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800">{action.title}</h3>
                      <span className={`text-xs px-2 py-0.5 mt-1 inline-block rounded ${getPriorityColor(action.priority)}`}>
                        Prioritas {action.priority === 'high' ? 'Tinggi' : action.priority === 'medium' ? 'Sedang' : 'Rendah'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-800">{action.count}</span>
                      <button onClick={() => onNavigate(action.link)} className="mt-1 text-sm text-blue-600 hover:underline flex items-center justify-end gap-1 w-full">
                        Lihat <ArrowRight size={14}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500 text-center py-8">Tidak ada tindakan yang diperlukan saat ini. 👍</p>}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b"><h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-600" />Aktivitas Terbaru</h2></div>
          <div className="p-6">
            {data.aktivitas_terbaru.length > 0 ? (
              <div className="space-y-4">
                {data.aktivitas_terbaru.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${activity.tipe === 'PENDAFTARAN' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{activity.teks}</p>
                      <p className="text-xs text-gray-500">{activity.waktu}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500 text-center py-8">Belum ada aktivitas terbaru.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;