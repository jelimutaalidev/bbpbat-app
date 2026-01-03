// src/components/admin/PaymentManagement.tsx

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getPaymentsForAdmin, updatePaymentStatus } from '../../api/apiService';
import { 
    Loader2, CheckCircle, XCircle, Clock, Check, FileText, 
    RefreshCw, Search, ChevronDown, Eye, Download, X
} from 'lucide-react';

// --- Interface ---
interface PesertaInfo {
  id: number;
  nama_lengkap: string;
  email: string;
}

interface Payment {
  id: number;
  profil: PesertaInfo;
  file: string;
  diunggah_pada: string;
  status_verifikasi: 'Menunggu Verifikasi' | 'Telah Diverifikasi' | 'Ditolak';
  catatan_admin: string | null;
}

// --- Komponen Utama ---
const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State untuk UI
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [feedback, setFeedback] = useState('');

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPaymentsForAdmin(statusFilter);
      setPayments(response);
    } catch (err) {
      setError('Tidak dapat memuat data pembayaran.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filteredData = payments.filter(item => 
    item.profil.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.profil.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVerification = async (paymentId: number, newStatus: 'Telah Diverifikasi' | 'Ditolak') => {
    const loadingToast = toast.loading('Memperbarui status...');
    try {
      await updatePaymentStatus(paymentId, newStatus, feedback);
      toast.success('Status pembayaran berhasil diperbarui.', { id: loadingToast });
      fetchPayments();
      setSelectedPayment(null);
      setFeedback('');
    } catch (err) {
      toast.error('Gagal memperbarui status.', { id: loadingToast });
      console.error(err);
    }
  };

  const getStatusBadge = (status: Payment['status_verifikasi']) => {
    const styles = {
      'Telah Diverifikasi': 'bg-green-100 text-green-800',
      'Ditolak': 'bg-red-100 text-red-800',
      'Menunggu Verifikasi': 'bg-yellow-100 text-yellow-800',
    };
    const icons = {
      'Telah Diverifikasi': <CheckCircle className="w-3 h-3" />,
      'Ditolak': <XCircle className="w-3 h-3" />,
      'Menunggu Verifikasi': <Clock className="w-3 h-3" />,
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {icons[status]} {status}
      </span>
    );
  };
  
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Pembayaran</h1>
        <p className="text-gray-600">Verifikasi bukti pembayaran yang diunggah oleh peserta.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="relative w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-52 bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-3 pr-8 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors appearance-none"
              >
                <option value="all">Semua Status</option>
                <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                <option value="Telah Diverifikasi">Diterima</option>
                <option value="Ditolak">Ditolak</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
             <button onClick={fetchPayments} disabled={isLoading} className="p-2.5 text-gray-500 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-lg transition disabled:opacity-50">
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Unggah</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.length > 0 ? filteredData.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{payment.profil.nama_lengkap}</div>
                          <div className="text-sm text-gray-500">{payment.profil.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(payment.diunggah_pada)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(payment.status_verifikasi)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button onClick={() => { setSelectedPayment(payment); setFeedback(payment.catatan_admin || ''); }} className="text-blue-600 hover:text-blue-900 p-1 flex items-center gap-1" title="Kelola Pembayaran">
                            <Eye className="w-4 h-4" /> Kelola
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="text-center py-12">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900">Tidak ada data ditemukan</h3>
                          <p className="text-gray-500">Coba ubah filter atau kata kunci pencarian.</p>
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

      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            
            {/* 1. BAGIAN HEADER BARU: Berisi Judul dan Tombol Tutup (X) */}
            <div className="flex-shrink-0 p-5 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Detail Pembayaran</h3>
              <button 
                onClick={() => setSelectedPayment(null)} 
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100"
                title="Tutup"
              >
                <X size={24} />
              </button>
            </div>

            {/* 2. BAGIAN BODY: Isi detail pembayaran (tidak berubah) */}
            <div className="flex-grow p-6 space-y-4 overflow-y-auto text-sm">
              <p><strong>Nama:</strong> {selectedPayment.profil.nama_lengkap}</p>
              <p><strong>Email:</strong> {selectedPayment.profil.email}</p>
              <p><strong>Tanggal Unggah:</strong> {formatDate(selectedPayment.diunggah_pada)}</p>
              <p className="flex items-center"><strong>Status:</strong> <span className="ml-2">{getStatusBadge(selectedPayment.status_verifikasi)}</span></p>
              <div>
                <label htmlFor="feedback" className="font-semibold text-gray-700 block mb-2">Catatan Admin untuk feedback ketika bukti pembayaran ditolak (Opsional)  </label>
                <textarea
                  id="feedback"
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-2 border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Berikan catatan untuk penolakan atau lainnya..."
                />
              </div>
            </div>
            
            {/* 3. BAGIAN FOOTER: Tombol aksi Anda yang sudah benar */}
            <div className="flex-shrink-0 p-5 bg-gray-50 border-t flex flex-wrap justify-end gap-3">
              <a 
                href={selectedPayment.file} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                <Download className="w-4 h-4" /> Unduh Bukti
              </a>
              <button 
                onClick={() => handleVerification(selectedPayment.id, 'Ditolak')}
                disabled={selectedPayment.status_verifikasi === 'Ditolak'}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium disabled:bg-red-300 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" /> Tolak
              </button>
              <button 
                onClick={() => handleVerification(selectedPayment.id, 'Telah Diverifikasi')}
                disabled={selectedPayment.status_verifikasi === 'Telah Diverifikasi'}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium disabled:bg-green-300 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" /> Setujui
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;