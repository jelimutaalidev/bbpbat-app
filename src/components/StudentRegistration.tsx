import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { NavigationState } from '../App';
// 1. Import fungsi API yang relevan
import { getPlacementOptions, submitRegistration } from '../api/apiService';
import { useNavigate } from 'react-router-dom';

interface StudentRegistrationProps {
  onNavigate: (page: NavigationState) => void; // Deprecated
}

// 2. Definisikan tipe data untuk state placementOptions agar sesuai dengan respons API
interface PlacementOption {
  id: number;
  nama: string;
  sisa_kuota_pelajar: number;
}

const StudentRegistration: React.FC<StudentRegistrationProps> = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama: '',
    instansi: '',
    nomerWA: '',
    // Tambahkan field email yang dibutuhkan oleh backend
    email: '',
    pembimbing: '',
    nomerWAPembimbing: '',
    pilihanPenempatan: '', // Ini akan menyimpan ID penempatan
    suratPengajuan: null as File | null
  });

  // 3. State baru untuk menyimpan data dinamis dari API
  const [placementOptions, setPlacementOptions] = useState<PlacementOption[]>([]);
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 4. useEffect untuk mengambil data penempatan saat komponen pertama kali dimuat
  useEffect(() => {
    const fetchPlacements = async () => {
      try {
        const response = await getPlacementOptions();
        setPlacementOptions(response.data);
      } catch (error) {
        console.error("Gagal mengambil data penempatan:", error);
        setErrors({ general: 'Gagal memuat data penempatan. Coba muat ulang halaman.' });
      }
    };

    fetchPlacements();
  }, []); // Array kosong berarti efek ini hanya berjalan sekali

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, suratPengajuan: file }));
      if (errors.suratPengajuan) {
        setErrors(prev => ({ ...prev, suratPengajuan: undefined }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nama.trim()) newErrors.nama = 'Nama wajib diisi';
    if (!formData.instansi.trim()) newErrors.instansi = 'Instansi wajib diisi';
    if (!formData.nomerWA.trim()) newErrors.nomerWA = 'Nomor WhatsApp wajib diisi';
    if (!formData.pembimbing.trim()) newErrors.pembimbing = 'Nama pembimbing wajib diisi';
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!formData.pilihanPenempatan) newErrors.pilihanPenempatan = 'Pilihan penempatan wajib dipilih';
    if (!formData.suratPengajuan) newErrors.suratPengajuan = 'Surat pengajuan wajib diunggah';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 5. handleSubmit diubah untuk mengirim data ke API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    // Membuat objek FormData untuk mengirim file dan data teks bersamaan
    const submissionData = new FormData();
    submissionData.append('nama_lengkap', formData.nama);
    submissionData.append('nama_institusi', formData.instansi);
    submissionData.append('no_telepon', formData.nomerWA);
    submissionData.append('email', formData.email);
    submissionData.append('pilihan_penempatan', formData.pilihanPenempatan);
    submissionData.append('tipe_peserta', 'PELAJAR'); // Hardcode tipe peserta
    submissionData.append('nama_pembimbing', formData.pembimbing);
    submissionData.append('no_telepon_pembimbing', formData.nomerWAPembimbing);

    if (formData.suratPengajuan) {
      submissionData.append('surat_pengajuan', formData.suratPengajuan);
    }

    try {
      const response = await submitRegistration(submissionData);
      alert(response.data.message); // Tampilkan pesan sukses dari backend
      navigate('/home');
    } catch (error: any) {
      console.error("Pendaftaran gagal:", error);
      if (error.response && error.response.data) {
        // Menampilkan error validasi dari backend (misal: kuota penuh, email sudah ada)
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, suratPengajuan: null }));
  };

  const getQuotaText = (sisaKuota: number) => {
    if (sisaKuota <= 0) return 'kuota penuh';
    if (sisaKuota <= 2) return `sisa kuota ${sisaKuota}`;
    return `tersedia`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/registration')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Menu Pendaftaran
          </button>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Pendaftaran Pelajar</h1>
            <p className="text-gray-600">Lengkapi formulir di bawah ini untuk mendaftar sebagai pelajar</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-red-700">{errors.general}</p>
                  </div>
                </div>
              )}
              {/* Tambahkan input untuk email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Aktif *</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.email ? 'border-red-300' : 'border-gray-300'}`} placeholder="Untuk notifikasi pendaftaran" />
                {errors.email && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.email}</p>}
              </div>
              {/* ... (Input lain tidak berubah, hanya sesuaikan error handling jika perlu) ... */}
              <div>
                <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap *</label>
                <input type="text" id="nama" name="nama" value={formData.nama} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.nama ? 'border-red-300' : 'border-gray-300'}`} placeholder="Masukkan nama lengkap Anda" />
                {errors.nama && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.nama}</p>}
              </div>
              <div>
                <label htmlFor="instansi" className="block text-sm font-medium text-gray-700 mb-2">Instansi/Sekolah/Universitas *</label>
                <input type="text" id="instansi" name="instansi" value={formData.instansi} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.instansi ? 'border-red-300' : 'border-gray-300'}`} placeholder="Masukkan nama instansi Anda" />
                {errors.instansi && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.instansi}</p>}
              </div>
              <div>
                <label htmlFor="nomerWA" className="block text-sm font-medium text-gray-700 mb-2">Nomor WhatsApp *</label>
                <input type="tel" id="nomerWA" name="nomerWA" value={formData.nomerWA} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.nomerWA ? 'border-red-300' : 'border-gray-300'}`} placeholder="Contoh: 081234567890" />
                {errors.nomerWA && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.nomerWA}</p>}
              </div>
              <div>
                <label htmlFor="pembimbing" className="block text-sm font-medium text-gray-700 mb-2">Nama Pembimbing *</label>
                <input type="text" id="pembimbing" name="pembimbing" value={formData.pembimbing} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.pembimbing ? 'border-red-300' : 'border-gray-300'}`} placeholder="Masukkan nama pembimbing dari instansi" />
                {errors.pembimbing && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.pembimbing}</p>}
              </div>
              {/* 6. Dropdown Pilihan Penempatan sekarang dinamis */}
              <div>
                <label htmlFor="pilihanPenempatan" className="block text-sm font-medium text-gray-700 mb-2">Pilihan Penempatan *</label>
                <select id="pilihanPenempatan" name="pilihanPenempatan" value={formData.pilihanPenempatan} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.pilihanPenempatan ? 'border-red-300' : 'border-gray-300'}`}>
                  <option value="">Pilih unit penempatan</option>
                  {placementOptions.map((option) => (
                    <option key={option.id} value={option.id} disabled={option.sisa_kuota_pelajar <= 0}>
                      {option.nama} ({getQuotaText(option.sisa_kuota_pelajar)})
                    </option>
                  ))}
                </select>
                {errors.pilihanPenempatan && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{Array.isArray(errors.pilihanPenempatan) ? errors.pilihanPenempatan[0] : errors.pilihanPenempatan}</p>}
              </div>
              {/* ... (sisa form tidak berubah) ... */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Surat Pengajuan Pendaftaran *</label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors relative ${errors.suratPengajuan ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'}`}>
                  {formData.suratPengajuan ? (
                    <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-gray-700">{formData.suratPengajuan.name}</span>
                      </div>
                      <button type="button" onClick={removeFile} className="text-red-600 hover:text-red-700"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-2">Klik untuk mengunggah atau drag & drop</p>
                      <p className="text-xs text-gray-500">Format yang didukung: PDF, DOC, DOCX (Maksimal 5MB)</p>
                      <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                  )}
                </div>
                {errors.suratPengajuan && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.suratPengajuan}</p>}
              </div>
              <div className="pt-6">
                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2">
                  {isSubmitting ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Mengirim Pendaftaran...</>) : ('Ajukan Pendaftaran')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegistration;