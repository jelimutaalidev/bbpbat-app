import React, { useMemo, useState } from 'react';
import {
  FileText,
  Download,
  X,
  Loader2,
  AlertCircle,
  Clock,
  BadgeCheck,
  XCircle,
  UploadCloud,
} from 'lucide-react';
import { uploadDocument } from '../../api/apiService';
import { toast } from 'react-hot-toast';

// =================================================================
// --- PERUBAHAN 1: Sesuaikan Interface dengan data `camelCase` dari MainPage.tsx ---
// =================================================================
interface Dokumen {
  id: number;
  jenisDokumen: string; // dari jenis_dokumen
  file: string;
  statusVerifikasi: 'DITERIMA' | 'DITOLAK' | 'MENUNGGU'; // Sesuai output baru serializer
  catatanVerifikasi: string | null; // dari catatan_verifikasi
  diunggahPada: string; // dari diunggah_pada
}

interface PesertaProfile {
  dokumen: Dokumen[];
  dokumenLengkap: boolean; // dari dokumen_lengkap
}

interface DocumentsProps {
  profileData: PesertaProfile | null;
  onUpdate: () => void;
}

const requiredDocumentsConfig = [
    { id: 'ktp', name: 'KTP', description: 'Kartu Tanda Penduduk yang masih berlaku', required: true, accept: '.pdf,.jpg,.jpeg,.png' },
    { id: 'ktm', name: 'KTM/KTS', description: 'Kartu Tanda Mahasiswa atau Kartu Tanda Siswa', required: true, accept: '.pdf,.jpg,.jpeg,.png' },
    { id: 'kk', name: 'Kartu Keluarga', description: 'Kartu Keluarga terbaru', required: true, accept: '.pdf,.jpg,.jpeg,.png' },
    { id: 'photo', name: 'Pas Photo', description: 'Foto formal ukuran 3x4 atau 4x6', required: true, accept: '.jpg,.jpeg,.png' },
    { id: 'proposal', name: 'Proposal', description: 'Proposal kegiatan PKL/magang', required: true, accept: '.pdf,.doc,.docx' },
    { id: 'nilai', name: 'Format Nilai', description: 'Transkrip nilai atau rapor terbaru', required: true, accept: '.pdf,.jpg,.jpeg,.png' },
    { id: 'sertifikat', name: 'Format Sertifikat', description: 'Template sertifikat dari institusi (jika ada)', required: false, accept: '.pdf,.doc,.docx' },
    { id: 'pernyataan', name: 'Surat Pernyataan', description: 'Surat pernyataan pertanggungjawaban', required: true, accept: '.pdf,.jpg,.jpeg,.png' }
];

// =================================================================
// --- PERUBAHAN 2: Sesuaikan Badge dengan nilai status yang baru ---
// =================================================================
const StatusBadge: React.FC<{ status: Dokumen['statusVerifikasi'] }> = ({ status }) => {
  const statusConfig = {
    DITERIMA: { text: 'Diterima', icon: <BadgeCheck className="w-4 h-4" />, color: 'text-green-700 bg-green-100' },
    MENUNGGU: { text: 'Menunggu Verifikasi', icon: <Clock className="w-4 h-4" />, color: 'text-yellow-700 bg-yellow-100' },
    DITOLAK: { text: 'Ditolak', icon: <XCircle className="w-4 h-4" />, color: 'text-red-700 bg-red-100' },
  };
  const config = status ? statusConfig[status] : null;
  if (!config) return null;

  return (
    <div className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full ${config.color}`}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
};

const Documents: React.FC<DocumentsProps> = ({ profileData, onUpdate }) => {
  const [uploadingStatus, setUploadingStatus] = useState<Record<string, 'uploading' | 'error' | null>>({});

  const uploadedDocumentsMap = useMemo(() => {
    if (!profileData?.dokumen) return new Map<string, Dokumen>();
    // --- PERUBAHAN 3: Gunakan `doc.jenisDokumen` (camelCase) ---
    return new Map(profileData.dokumen.map(doc => [doc.jenisDokumen, doc]));
  }, [profileData]);

  // Logika upload dan hapus tidak berubah
  const handleFileUpload = async (documentId: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file tidak boleh melebihi 5MB.');
      return;
    }
    setUploadingStatus(prev => ({ ...prev, [documentId]: 'uploading' }));
    try {
      await uploadDocument(documentId, file);
      toast.success('Dokumen berhasil diunggah!');
      onUpdate();
    } catch (error) {
      toast.error('Gagal mengunggah dokumen. Silakan coba lagi.');
    } finally {
      setTimeout(() => setUploadingStatus(prev => ({ ...prev, [documentId]: null })), 3000);
    }
  };
  
  const handleFileRemove = async (documentId: string) => {
    toast.error('Fitur hapus dokumen sedang dalam pengembangan.');
  };

  const requiredDocsCount = requiredDocumentsConfig.filter(doc => doc.required).length;
  const uploadedRequiredCount = requiredDocumentsConfig.filter(doc => {
      const uploadedDoc = uploadedDocumentsMap.get(doc.id);
      // --- PERUBAHAN 4: Gunakan `uploadedDoc.statusVerifikasi` (camelCase) ---
      return doc.required && uploadedDoc && uploadedDoc.statusVerifikasi !== 'DITOLAK';
    }).length;

  return (
    <div className="space-y-8">
      {/* Header & Progress Bar */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Berkas Dokumen</h1>
        <p className="mt-1 text-md text-gray-600">Lengkapi dan kelola semua dokumen yang diperlukan untuk program bimbingan Anda.</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Progres Kelengkapan Berkas</h2>
          <span className="text-sm font-bold text-gray-700">{uploadedRequiredCount}/{requiredDocsCount}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(uploadedRequiredCount / requiredDocsCount) * 100}%` }} />
        </div>
        <p className="text-sm text-gray-600 mt-3">
          {uploadedRequiredCount === requiredDocsCount ? '✅ Luar biasa! Semua dokumen wajib telah diunggah.' : `Anda perlu mengunggah ${requiredDocsCount - uploadedRequiredCount} dokumen wajib lagi.`}
        </p>
      </div>

      {/* Grid Dokumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {requiredDocumentsConfig.map((docConfig) => {
          const uploadedFile = uploadedDocumentsMap.get(docConfig.id);
          const status = uploadingStatus[docConfig.id];
          
          const getCardBorderColor = () => {
            if (uploadedFile) {
              // --- PERUBAHAN 5: Gunakan `uploadedFile.statusVerifikasi` (camelCase) ---
              switch (uploadedFile.statusVerifikasi) {
                case 'DITERIMA': return 'border-green-400';
                case 'DITOLAK': return 'border-red-400';
                case 'MENUNGGU': return 'border-yellow-400';
                default: return 'border-gray-200';
              }
            }
            return 'border-gray-200';
          };

          return (
            <div key={docConfig.id} className={`bg-white rounded-xl shadow-sm border-2 ${getCardBorderColor()} p-6 flex flex-col justify-between transition-colors`}>
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800">{docConfig.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{docConfig.description}</p>
                  </div>
                  {uploadedFile && status !== 'uploading' && <StatusBadge status={uploadedFile.statusVerifikasi} />}
                  {status === 'uploading' && <Loader2 className="w-6 h-6 text-blue-500 animate-spin flex-shrink-0" />}
                </div>

                {uploadedFile?.statusVerifikasi === 'DITOLAK' && uploadedFile.catatanVerifikasi && (
                  <div className="mb-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    {/* --- PERUBAHAN 6: Gunakan `uploadedFile.catatanVerifikasi` (camelCase) --- */}
                    <p className="text-sm text-red-700">{uploadedFile.catatanVerifikasi}</p>
                  </div>
                )}
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[120px] flex items-center justify-center">
                  {status === 'uploading' ? (
                     <div className="text-center text-gray-600"><Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600 mb-2"/><p>Mengunggah...</p></div>
                  ) : uploadedFile ? (
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className="w-8 h-8 text-blue-500 flex-shrink-0"/>
                        <p className="font-medium text-gray-800 truncate" title={new URL(uploadedFile.file).pathname.split('/').pop() || 'file'}>
                          {new URL(uploadedFile.file).pathname.split('/').pop() || 'file'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={uploadedFile.file} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-blue-600" title="Download"><Download className="w-5 h-5"/></a>
                        <button onClick={() => handleFileRemove(docConfig.id)} className="p-2 text-gray-500 hover:text-red-600" title="Hapus"><X className="w-5 h-5"/></button>
                      </div>
                    </div>
                  ) : (
                     <div className="text-center">
                       <input type="file" accept={docConfig.accept} onChange={(e) => e.target.files?.[0] && handleFileUpload(docConfig.id, e.target.files[0])} className="hidden" id={`upload-${docConfig.id}`} />
                       <label htmlFor={`upload-${docConfig.id}`} className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex flex-col items-center gap-2"><UploadCloud className="w-8 h-8 text-gray-400" /><span>Pilih file untuk diunggah</span></label>
                       <p className="text-xs text-gray-500 mt-1">Maks. 5MB</p>
                     </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Documents;