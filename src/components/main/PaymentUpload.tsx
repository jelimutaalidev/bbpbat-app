// src/components/main/PaymentUpload.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { getMyPayment, uploadMyPayment } from '../../api/apiService';
import { 
    CreditCard, Upload, CheckCircle, X, Download, 
    Info, Loader2, Clock, File as FileIcon, Replace 
} from 'lucide-react';

// --- Interface ---
interface PaymentData {
  id: number;
  file: string;
  diunggah_pada: string;
  status_verifikasi: 'Menunggu Verifikasi' | 'Telah Diverifikasi' | 'Ditolak';
  catatan_admin: string | null;
}

// --- Komponen Utama ---
const PaymentUpload: React.FC = () => {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- Logika Inti (Fetching & Uploading Data) ---
  const fetchPaymentData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMyPayment();
      setPaymentData(data);
    } catch (error) {
      toast.error('Gagal memuat status pembayaran.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentData();
  }, [fetchPaymentData]);

  const handleFileUpload = async (file: File) => {
    // Validasi Sisi Klien
    if (file.size > 5 * 1024 * 1024) return toast.error('Ukuran file maksimal 5MB.');
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) return toast.error('Format file harus PDF, JPG, atau PNG.');

    setIsUploading(true);
    const toastId = toast.loading('Mengunggah...');
    try {
      const updatedData = await uploadMyPayment(file);
      setPaymentData(updatedData);
      toast.success('Bukti pembayaran berhasil diunggah!', { id: toastId });
    } catch (error) {
      toast.error('Gagal mengunggah file.', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };
  
  // --- Event Handlers untuk Interaksi UI ---
  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFileUpload(e.target.files[0]);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]);
  };
  
  const handleDragHover = (e: React.DragEvent<HTMLDivElement>, active: boolean) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(active);
  };
  
  // --- Helper Functions untuk Tampilan ---
  const getStatusBadge = (status: PaymentData['status_verifikasi']) => {
    switch (status) {
      case 'Telah Diverifikasi':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" /> Diterima</span>;
      case 'Ditolak':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800"><X className="w-3 h-3" /> Ditolak</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3" /> Menunggu</span>;
    }
  };

  // --- Render ---
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* 1. Header Halaman */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Bukti Pembayaran</h1>
        <p className="text-gray-600">Unggah dan lihat status verifikasi pembayaran Anda.</p>
      </div>

      {/* 2. Informasi Pembayaran Statis */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-800 mb-3">Informasi Pembayaran</h3>
            <div className="space-y-3 text-sm text-blue-700">
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-2">
                <p><strong>Bank:</strong> BNI</p>
                <p><strong>Biaya Pelatihan:</strong> Rp 1.500.000</p>
                <p><strong>No. Rekening:</strong> 1234567890</p>
                <p><strong>Kode Unik:</strong> 001 (contoh)</p>
                <p><strong>Atas Nama:</strong> BBPBAT</p>
                <p><strong>Total Transfer:</strong> <span className="font-semibold">Rp 1.500.001</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bagian Utama: Upload dan Status (Mengikuti Pola Documents.tsx) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              File Bukti Pembayaran
            </h2>
          </div>
          {/* Ganti badge status dengan ikon centang/loading */}
          {paymentData && !isUploading && <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />}
          {isUploading && <Loader2 className="w-6 h-6 text-blue-500 animate-spin flex-shrink-0" />}
        </div>
        
        {paymentData?.status_verifikasi === 'Ditolak' && paymentData.catatan_admin && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
            <strong>Catatan dari Admin:</strong> {paymentData.catatan_admin}
          </div>
        )}
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[120px] flex items-center justify-center">
          {isUploading ? (
            <div className="text-center text-gray-600">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600 mb-2"/>
              <p className="font-medium">Mengunggah...</p>
            </div>
          ) : paymentData ? (
            // Tampilan JIKA SUDAH ADA FILE
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileIcon className="w-8 h-8 text-blue-500 flex-shrink-0"/>
                <div className="overflow-hidden">
                  <p className="font-medium text-gray-800 truncate" title={paymentData.file.split('/').pop()}>
                    {paymentData.file.split('/').pop()}
                  </p>
                  {/* Pindahkan getStatusBadge ke sini */}
                  <div className="mt-1">{getStatusBadge(paymentData.status_verifikasi)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a href={paymentData.file} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-blue-600" title="Download">
                  <Download className="w-5 h-5"/>
                </a>
                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-red-600" title="Ganti File">
                  <Replace className="w-5 h-5"/>
                </button>
              </div>
            </div>
          ) : (
            // Tampilan JIKA BELUM ADA FILE
            <div 
              className="w-full h-full text-center cursor-pointer"
              onDragEnter={(e) => handleDragHover(e, true)}
              onDragLeave={(e) => handleDragHover(e, false)}
              onDragOver={(e) => handleDragHover(e, true)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {dragActive ? (
                <p className="font-semibold text-blue-600">Lepaskan file untuk mengunggah</p>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400"/>
                  <p className="font-medium text-blue-600 hover:text-blue-700">Pilih file untuk diunggah</p>
                  <p className="text-xs text-gray-500 mt-1">atau seret dan lepaskan di sini (Maks. 5MB)</p>
                </>
              )}
            </div>
          )}
        </div>
        {/* Input file yang tersembunyi */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={onFileSelected}
          className="hidden"
          disabled={isUploading}
        />
      </div>
    </div>
  );
};

export default PaymentUpload;