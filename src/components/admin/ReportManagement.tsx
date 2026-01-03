import React, { useState, useEffect, useCallback } from 'react';
import { Users, Building, FileText, Eye, Check, X, Search, Loader2, MessageSquare, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAdminReports, updateAdminReport, ReportUpdateData, BACKEND_URL } from '../../api/apiService';

// 1. Definisikan 'interface' agar sesuai dengan data dari backend
interface Report {
  id: number;
  nama: string;
  instansi: string;
  penempatan: string;
  judul: string;
  deskripsi: string;
  tanggalSubmit: string;
  status: string;
  filename: string;
  fileUrl: string;
  feedback_admin: string;
}

const ReportManagement: React.FC = () => {
  // 2. Ganti data statis dengan state dinamis
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk UI (tidak berubah)
  const [activeTab, setActiveTab] = useState('student');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [feedback, setFeedback] = useState(''); // State baru untuk feedback di modal

  const getFileUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${BACKEND_URL}${path.startsWith('/') ? path.slice(1) : path}`;
  };

  const tabs = [
    { id: 'student', label: 'Pelajar', icon: <Users className="w-4 h-4" /> },
    { id: 'general', label: 'Masyarakat/Dinas', icon: <Building className="w-4 h-4" /> }
  ];

  // 3. Fungsi untuk mengambil data dari API
  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const tipePeserta = activeTab === 'student' ? 'PELAJAR' : 'UMUM';
      const response = await getAdminReports(tipePeserta, statusFilter);
      setReports(response.data);
    } catch (err) {
      console.error("Gagal mengambil data laporan:", err);
      setError("Tidak dapat memuat data laporan. Coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, statusFilter]);

  // 4. useEffect untuk memanggil API saat tab atau filter berubah
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // 5. Logika filter data (sekarang dari state 'reports')
  const filteredData = reports.filter(item => {
    const searchTermLower = searchTerm.toLowerCase();
    return (item.nama.toLowerCase().includes(searchTermLower) ||
      item.instansi.toLowerCase().includes(searchTermLower) ||
      item.judul.toLowerCase().includes(searchTermLower));
  });

  // 6. Fungsi untuk menangani update laporan (menjadi fungsi utama)
  const handleUpdateReport = async (reportId: number, status: 'DITERIMA' | 'DITOLAK' | 'DIREVIEW', feedbackText?: string) => {
    const loadingToast = toast.loading('Memperbarui status laporan...');
    try {
      // Gunakan tipe 'ReportUpdateData' yang sudah kita import
      const payload: ReportUpdateData = {
        status_review: status,
      };
      // Hanya tambahkan feedback_admin jika ada isinya
      if (feedbackText && feedbackText.trim() !== '') {
        payload.feedback_admin = feedbackText;
      }

      await updateAdminReport(reportId, payload);
      toast.success('Status laporan berhasil diperbarui.', { id: loadingToast });
      fetchReports();
      setSelectedReport(null);
    } catch (err: any) {
      const errorMsg = err.response?.data?.feedback_admin?.[0] || 'Gagal memperbarui status.';
      toast.error(errorMsg, { id: loadingToast });
    }
  };

  // Helper UI (tidak berubah)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'baru': return 'bg-blue-100 text-blue-800';
      case 'direview': return 'bg-yellow-100 text-yellow-800';
      case 'diterima': return 'bg-green-100 text-green-800';
      case 'ditolak': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => status.charAt(0).toUpperCase() + status.slice(1);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Laporan</h1>
        <p className="text-gray-600">Kelola dan review laporan PKL peserta bimbingan teknis</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === tab.id
                  ? 'border-gray-800 text-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, instansi, atau judul..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="relative w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-auto bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-3 pr-8 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors appearance-none"
              >
                <option value="all">Semua Status</option>
                <option value="baru">Baru</option>
                <option value="direview">Direview</option>
                <option value="diterima">Diterima</option>
                <option value="ditolak">Ditolak</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="text-center py-20"><Loader2 className="w-8 h-8 mx-auto animate-spin text-gray-500" /></div>
              ) : error ? (
                <div className="text-center py-20 text-red-600">{error}</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peserta</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul Laporan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Submit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.length > 0 ? filteredData.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{report.nama}</div>
                            <div className="text-sm text-gray-500">{report.instansi}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={report.judul}>{report.judul}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(report.tanggalSubmit)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                            {getStatusLabel(report.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setSelectedReport(report); setFeedback(report.feedback_admin); }} className="text-blue-600 hover:text-blue-900 p-1" title="Lihat Detail"><Eye className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="text-center py-12">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900">Tidak ada laporan ditemukan</h3>
                          <p className="text-gray-500">Coba ubah filter atau kata kunci pencarian</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">

            {/* Modal Header */}
            <div className="flex-shrink-0 px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Review Laporan</h3>
                <p className="text-sm text-gray-500 mt-1">Tinjau detail laporan dan berikan feedback</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-grow overflow-y-auto bg-gray-50/50">
              <div className="grid grid-cols-1 md:grid-cols-3 min-h-full">

                {/* Left Column: Participant Info */}
                <div className="p-8 border-r border-gray-100 bg-white md:col-span-1 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Informasi Peserta</h4>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selectedReport.nama}</p>
                          <p className="text-xs text-gray-500">Nama Peserta</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                          <Building className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selectedReport.instansi}</p>
                          <p className="text-xs text-gray-500">Asal Instansi</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selectedReport.penempatan}</p>
                          <p className="text-xs text-gray-500">Unit Penempatan</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Status Terkini</h4>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReport.status)}`}>
                      {getStatusLabel(selectedReport.status)}
                    </span>
                    <p className="text-xs text-gray-500 mt-2">
                      Disubmit pada {formatDate(selectedReport.tanggalSubmit)}
                    </p>
                  </div>
                </div>

                {/* Right Column: Report Details & Action */}
                <div className="p-8 md:col-span-2 space-y-8 bg-gray-50/30">

                  {/* Report Content */}
                  <section>
                    <h4 className="text-lg font-bold text-gray-900 mb-3">{selectedReport.judul}</h4>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">
                        {selectedReport.deskripsi}
                      </p>
                    </div>
                  </section>

                  {/* File Attachment */}
                  <section>
                    <h5 className="text-sm font-semibold text-gray-900 mb-3">Lampiran Dokumen</h5>
                    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{selectedReport.filename}</p>
                          <p className="text-xs text-gray-500">Dokumen Laporan</p>
                        </div>
                      </div>
                      <a
                        href={getFileUrl(selectedReport.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Lihat Dokumen
                      </a>
                    </div>
                  </section>

                  {/* Feedback Section */}
                  <section className="pt-6 border-t border-gray-200">
                    <label htmlFor="feedback" className="block text-sm font-semibold text-gray-900 mb-2">
                      Catatan Review / Feedback
                    </label>
                    <div className="relative">
                      <textarea
                        id="feedback"
                        rows={4}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full p-4 text-sm border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Tuliskan catatan revisi atau alasan penolakan/penerimaan di sini..."
                      />
                      <div className="absolute bottom-3 right-3 text-gray-400">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                    </div>
                  </section>

                </div>
              </div>
            </div>

            {/* Modal Footer (Actions) */}
            <div className="flex-shrink-0 px-8 py-5 bg-white border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => handleUpdateReport(selectedReport.id, 'DIREVIEW', feedback)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 transition-all flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Tandai Direview
              </button>

              <button
                onClick={() => handleUpdateReport(selectedReport.id, 'DITOLAK', feedback)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Tolak Laporan
              </button>

              <button
                onClick={() => handleUpdateReport(selectedReport.id, 'DITERIMA', feedback)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 shadow-sm hover:shadow transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Terima Laporan
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagement;