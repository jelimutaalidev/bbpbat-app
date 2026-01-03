// src/components/main/IzinSakitModal.tsx

import React, { useState, ChangeEvent, useRef } from 'react';
import { format } from 'date-fns';
import { id as indonesiaLocale } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { Loader2, X, UploadCloud, Calendar, FileText } from 'lucide-react';

import { submitLeaveRequest } from '../../api/apiService';

// ... (Interface dan komponen ModalOverlay tidak berubah)
interface IzinSakitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ModalOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-40"
      onClick={onClose}
    ></div>
);

const IzinSakitModal: React.FC<IzinSakitModalProps> = ({ isOpen, onClose, onSuccess }) => {
  // ... (Semua state dan handler tidak berubah)
  const [tanggal] = useState(new Date()); 
  const [status, setStatus] = useState<'IZIN' | 'SAKIT'>('IZIN');
  const [keterangan, setKeterangan] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 2 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 2MB.');
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keterangan.trim()) {
      toast.error('Keterangan wajib diisi.');
      return;
    }
    
    setIsSubmitting(true);
    const loadingToast = toast.loading('Mengirim pengajuan...');

    const formData = new FormData();
    formData.append('tanggal', format(tanggal, 'yyyy-MM-dd'));
    formData.append('status_kehadiran', status);
    formData.append('keterangan', keterangan);
    if (status === 'SAKIT' && file) {
      formData.append('surat_dokter', file);
    }

    try {
      await submitLeaveRequest(formData);
      toast.success('Pengajuan berhasil dikirim.', { id: loadingToast });
      onSuccess();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Gagal mengirim pengajuan.';
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <>
      <ModalOverlay onClose={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
          
          {/* 👇 1. TAMBAHKAN PEMBUNGKUS <form> DI SINI 👇 */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
            {/* Header */}
            <div className="flex-shrink-0 p-5 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Ajukan Izin / Sakit</h2>
              <button 
                type="button" // Set type="button" agar tidak men-submit form
                onClick={onClose} 
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Tutup modal"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Konten Scrollable */}
            <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                {/* ... (semua input field tetap sama) ... */}
                <div>
                    <label className="font-semibold text-gray-700 block mb-2">Tanggal Pengajuan</label>
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 p-3 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <span className="font-medium text-gray-800">
                            {format(tanggal, 'eeee, dd MMMM yyyy', { locale: indonesiaLocale })}
                        </span>
                    </div>
                </div>
                <div>
                    <label className="font-semibold text-gray-700 block mb-2">Jenis Pengajuan</label>
                    <div className="grid grid-cols-2 gap-4">
                        <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${status === 'IZIN' ? 'bg-blue-50 border-blue-500' : 'border-gray-200 hover:border-blue-300'}`}>
                            <input type="radio" name="status" value="IZIN" checked={status === 'IZIN'} onChange={() => setStatus('IZIN')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                            <span className="font-medium">Izin</span>
                        </label>
                        <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${status === 'SAKIT' ? 'bg-blue-50 border-blue-500' : 'border-gray-200 hover:border-blue-300'}`}>
                            <input type="radio" name="status" value="SAKIT" checked={status === 'SAKIT'} onChange={() => setStatus('SAKIT')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                            <span className="font-medium">Sakit</span>
                        </label>
                    </div>
                </div>
                <div>
                    <label htmlFor="keterangan" className="font-semibold text-gray-700 block mb-2">Keterangan (Wajib)</label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-start pl-3.5 pt-3.5">
                            <FileText className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <textarea
                            id="keterangan"
                            rows={4}
                            value={keterangan}
                            onChange={(e) => setKeterangan(e.target.value)}
                            className="w-full rounded-lg border-gray-300 shadow-sm pl-11 pt-3 transition-colors duration-150 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Contoh: Ada keperluan keluarga mendadak."
                        />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        Jelaskan alasan Anda secara singkat dan jelas.
                    </p>
                </div>
                {status === 'SAKIT' && (
                <div>
                    <label className="font-semibold text-gray-700 block mb-2">Upload Surat Dokter (Opsional)</label>
                    <div 
                        className="flex flex-col items-center justify-center w-full p-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                    <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-1 text-sm text-gray-600"><span className="font-semibold">Klik untuk upload</span></p>
                    <p className="text-xs text-gray-500">PDF, PNG, JPG (MAX. 2MB)</p>
                    <input ref={fileInputRef} id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />
                    </div>
                    {fileName && <p className="text-sm text-green-600 font-medium mt-2">File terpilih: {fileName}</p>}
                </div>
                )}
            </div>
            
            {/* Footer */}
            <div className="flex-shrink-0 p-5 bg-gray-50 border-t flex justify-end gap-3">
               <button
                type="button" // Set type="button" agar tidak men-submit form
                onClick={onClose}
                className="bg-white text-gray-700 py-2 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : null}
                Kirim Pengajuan
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default IzinSakitModal;