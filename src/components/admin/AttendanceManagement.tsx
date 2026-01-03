import React, { useState, useEffect, useCallback } from 'react';
import { Users, Building, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Search, Loader2, Edit, Filter, RefreshCw, Save, X } from 'lucide-react';
import { getAdminAttendance, updateAdminAttendance } from '../../api/apiService';

// --- TIPE DATA ---
interface AttendanceRecord {
  id: number;
  nama: string;
  instansi: string;
  penempatan: string;
  checkIn: string | null;
  checkOut: string | null;
  status: 'hadir' | 'izin' | 'sakit' | 'alpha' | string;
  keterangan: string;
}

interface AttendanceStats {
  total: number;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
}

const AttendanceManagement: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('student');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null); // Filter status interaktif

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({ total: 0, hadir: 0, izin: 0, sakit: 0, alpha: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- DATA FETCHING ---
  const fetchAttendanceData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAdminAttendance(activeTab, selectedDate);
      const data: AttendanceRecord[] = response.data;
      setAttendance(data);

      // Hitung statistik
      const newStats: AttendanceStats = {
        total: data.length,
        hadir: data.filter(item => item.status === 'hadir').length,
        izin: data.filter(item => item.status === 'izin').length,
        sakit: data.filter(item => item.status === 'sakit').length,
        alpha: data.filter(item => item.status === 'alpha').length,
      };
      setStats(newStats);
    } catch (err) {
      console.error("Gagal mengambil data absensi:", err);
      setError("Tidak dapat memuat data absensi. Silakan coba lagi nanti.");
      setAttendance([]);
      setStats({ total: 0, hadir: 0, izin: 0, sakit: 0, alpha: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, selectedDate]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  // --- HANDLERS ---
  const handleStatusClick = (status: string | null) => {
    if (selectedStatus === status) {
      setSelectedStatus(null); // Toggle off jika diklik lagi
    } else {
      setSelectedStatus(status);
    }
  };

  const handleEditClick = (record: AttendanceRecord) => {
    setEditingRecord({ ...record }); // Copy object agar tidak mutasi langsung
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;

    setIsSaving(true);
    try {
      await updateAdminAttendance(editingRecord.id, {
        status: editingRecord.status,
        checkIn: editingRecord.checkIn,
        checkOut: editingRecord.checkOut,
        keterangan: editingRecord.keterangan
      });

      // Refresh data setelah update berhasil
      await fetchAttendanceData();
      setIsEditModalOpen(false);
      setEditingRecord(null);
    } catch (err) {
      console.error("Gagal mengupdate absensi:", err);
      alert("Gagal menyimpan perubahan. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- DATA FILTERING ---
  const filteredData = attendance.filter(item => {
    const matchesSearch =
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.instansi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.penempatan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus ? item.status === selectedStatus : true;

    return matchesSearch && matchesStatus;
  });

  // --- HELPER FUNCTIONS ---
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hadir': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'izin': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'sakit': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'alpha': return <XCircle className="w-5 h-5 text-gray-600" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hadir': return 'bg-green-100 text-green-800 border-green-200';
      case 'izin': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sakit': return 'bg-red-100 text-red-800 border-red-200';
      case 'alpha': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // --- JSX ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Absensi</h1>
          <p className="text-gray-600">Kelola dan pantau kehadiran peserta bimbingan teknis</p>
        </div>
        <button
          onClick={fetchAttendanceData}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'student', label: 'Pelajar', icon: <Users className="w-4 h-4" /> },
              { id: 'general', label: 'Masyarakat/Dinas', icon: <Building className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari nama, instansi, atau penempatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Interactive Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total Peserta', value: stats.total, color: 'blue', icon: Users, status: null },
              { label: 'Hadir', value: stats.hadir, color: 'green', icon: CheckCircle, status: 'hadir' },
              { label: 'Izin', value: stats.izin, color: 'yellow', icon: AlertCircle, status: 'izin' },
              { label: 'Sakit', value: stats.sakit, color: 'red', icon: XCircle, status: 'sakit' },
              { label: 'Alpha', value: stats.alpha, color: 'gray', icon: XCircle, status: 'alpha' },
            ].map((stat, index) => (
              <div
                key={index}
                onClick={() => handleStatusClick(stat.status)}
                className={`
                  relative overflow-hidden rounded-xl p-4 border transition-all cursor-pointer hover:shadow-md
                  ${selectedStatus === stat.status
                    ? `bg-${stat.color}-50 border-${stat.color}-200 ring-2 ring-${stat.color}-500 ring-opacity-50`
                    : 'bg-white border-gray-100 hover:border-gray-200'}
                `}
              >
                <div className={`absolute right-0 top-0 p-3 opacity-10 text-${stat.color}-600`}>
                  <stat.icon className="w-16 h-16" />
                </div>
                <div className="relative z-10">
                  <div className={`text-3xl font-bold text-${stat.color}-600 mb-1`}>
                    {isLoading ? '-' : stat.value}
                  </div>
                  <div className={`text-sm font-medium text-${stat.color}-800 flex items-center gap-1`}>
                    {stat.label}
                    {selectedStatus === stat.status && <Filter className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filter Indicator */}
          {selectedStatus && (
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 w-fit">
              <Filter className="w-4 h-4" />
              <span>Menampilkan data: <strong>{selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}</strong></span>
              <button
                onClick={() => setSelectedStatus(null)}
                className="ml-2 text-blue-600 hover:text-blue-800 hover:underline"
              >
                Reset Filter
              </button>
            </div>
          )}

          {/* Attendance Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Peserta</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Instansi & Penempatan</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Waktu</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Keterangan</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                          <p className="text-gray-500 font-medium">Memuat data absensi...</p>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="bg-red-100 p-3 rounded-full">
                            <XCircle className="w-6 h-6 text-red-600" />
                          </div>
                          <h3 className="text-gray-900 font-medium">Terjadi Kesalahan</h3>
                          <p className="text-red-500 text-sm">{error}</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3">
                          <div className="bg-gray-100 p-4 rounded-full">
                            <Search className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-gray-900 font-medium">Tidak ada data ditemukan</h3>
                          <p className="text-gray-500 text-sm max-w-xs mx-auto">
                            Coba ubah filter tanggal, status, atau kata kunci pencarian Anda.
                          </p>
                          {selectedStatus && (
                            <button
                              onClick={() => setSelectedStatus(null)}
                              className="mt-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                              Hapus Filter Status
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                              {getInitials(item.nama)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.nama}</div>
                              <div className="text-xs text-gray-500">ID: {item.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{item.instansi}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Building className="w-3 h-3" /> {item.penempatan}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <span className="font-medium text-green-600">In:</span> {item.checkIn || '--:--'}
                          </div>
                          <div className="text-sm text-gray-900 mt-1">
                            <span className="font-medium text-red-600">Out:</span> {item.checkOut || '--:--'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate" title={item.keterangan}>
                            {item.keterangan || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"
                            title="Edit Absensi"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">Edit Absensi</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Peserta</label>
                <input
                  type="text"
                  value={editingRecord.nama}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Kehadiran</label>
                <select
                  value={editingRecord.status}
                  onChange={(e) => setEditingRecord({ ...editingRecord, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="hadir">Hadir</option>
                  <option value="izin">Izin</option>
                  <option value="sakit">Sakit</option>
                  <option value="alpha">Alpha</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Masuk</label>
                  <input
                    type="time"
                    value={editingRecord.checkIn || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, checkIn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Keluar</label>
                  <input
                    type="time"
                    value={editingRecord.checkOut || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, checkOut: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                <textarea
                  value={editingRecord.keterangan || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, keterangan: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  placeholder="Tambahkan catatan..."
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isSaving}
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;