// src/components/main/UploadReportModal.tsx

import React, { useState, ChangeEvent, useRef } from 'react';
import { format } from 'date-fns';
import { id as indonesiaLocale } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { Loader2, X, UploadCloud, FileText } from 'lucide-react';

import { submitParticipantReport } from '../../api/apiService';

interface UploadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadReportModal: React.FC<UploadReportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) { // Batas 5MB
        toast.error('Ukuran file maksimal 5MB.');
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !deskripsi.trim() || !file) {
      toast.error('Judul, deskripsi, dan file laporan wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Mengunggah laporan...');

    const formData = new FormData();
    formData.append('judul', judul);
    formData.append('deskripsi', deskripsi);
    formData.append('file', file);

    try {
      await submitParticipantReport(formData);
      toast.success('Laporan berhasil diunggah.', { id: loadingToast });
      onSuccess();
    } catch (err: any) {
      // 👇 PERBAIKAN UTAMA DI SINI: LOGIKA ERROR HANDLING YANG LEBIH CERDAS 👇
      let errorMessage = 'Gagal mengunggah laporan.'; // Pesan default

      if (err.response && err.response.data) {
        const errorData = err.response.data;

        // Cek jika ada pesan 'detail' kustom
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        }
        // Cek jika error adalah objek validasi dari DRF
        else if (typeof errorData === 'object') {
          // Ambil field pertama yang error (misal: 'file' atau 'judul')
          const firstErrorKey = Object.keys(errorData)[0];

          if (firstErrorKey && Array.isArray(errorData[firstErrorKey]) && errorData[firstErrorKey].length > 0) {
            // Gabungkan nama field dengan pesan error pertamanya
            const fieldName = firstErrorKey.charAt(0).toUpperCase() + firstErrorKey.slice(1);
            errorMessage = `${fieldName}: ${errorData[firstErrorKey][0]}`;
          }
        }
      }

      toast.error(errorMessage, { id: loadingToast, duration: 5000 }); // Perpanjang durasi toast error
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    // ... JSX tidak ada perubahan ...
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
          <div className="flex-shrink-0 px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Upload Laporan Baru</h2>
              <p className="text-sm text-gray-500 mt-1">Lengkapi form di bawah untuk mengunggah laporan</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-grow px-6 py-6 space-y-6 overflow-y-auto custom-scrollbar">
            <div>
              <label htmlFor="judul" className="text-sm font-semibold text-gray-700 block mb-2">Judul Laporan <span className="text-red-500">*</span></label>
              <input
                id="judul"
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 outline-none text-gray-800 placeholder-gray-400"
                placeholder="Contoh: Laporan Akhir PKL 2024"
              />
            </div>

            <div>
              <label htmlFor="deskripsi" className="text-sm font-semibold text-gray-700 block mb-2">Deskripsi / Ringkasan <span className="text-red-500">*</span></label>
              <textarea
                id="deskripsi"
                rows={4}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 outline-none text-gray-800 placeholder-gray-400 resize-none"
                placeholder="Jelaskan secara singkat isi laporan akhir Anda..."
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">File Laporan <span className="text-red-500">*</span></label>
              <div
                className={`group relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${fileName ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                  }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={`p-4 rounded-full mb-3 transition-colors duration-200 ${fileName ? 'bg-green-100' : 'bg-gray-100 group-hover:bg-blue-100'}`}>
                  {fileName ? (
                    <FileText className="w-8 h-8 text-green-600" />
                  ) : (
                    <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
                  )}
                </div>

                {fileName ? (
                  <div className="text-center">
                    <p className="text-sm font-semibold text-green-700 break-all">{fileName}</p>
                    <p className="text-xs text-green-600 mt-1">Siap untuk diupload</p>
                  </div>
                ) : (
                  <div className="text-center space-y-1">
                    <p className="text-sm text-gray-600 font-medium">
                      <span className="text-blue-600">Klik untuk upload</span> atau drag & drop
                    </p>
                    <p className="text-xs text-gray-400">PDF, DOCX (Maksimal 5MB)</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                />
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 px-6 py-5 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-transparent transition-all duration-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
              {isSubmitting ? 'Mengunggah...' : 'Upload Laporan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadReportModal;