import React from 'react';
import { ArrowLeft, CheckCircle, Clock, FileText } from 'lucide-react';
import { NavigationState } from '../App';
import { useNavigate } from 'react-router-dom';

interface HomePageProps {
  onNavigate: (page: NavigationState) => void; // Deprecated
}

const HomePage: React.FC<HomePageProps> = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Pendaftaran Berhasil!</h1>
        <p className="text-gray-600 mb-8 text-lg">
          Terima kasih telah mendaftar. Data Anda telah kami terima dan sedang dalam proses verifikasi.
        </p>

        <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Langkah Selanjutnya:
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-blue-800">
              <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
              <span>Tunggu email konfirmasi dari tim admin kami (maksimal 3x24 jam kerja).</span>
            </li>
            <li className="flex items-start gap-3 text-blue-800">
              <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
              <span>Jika diterima, Anda akan mendapatkan akun untuk login ke sistem.</span>
            </li>
            <li className="flex items-start gap-3 text-blue-800">
              <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
              <span>Lengkapi berkas administrasi lainnya melalui dashboard peserta.</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
          >
            <FileText className="w-4 h-4" />
            Cek Status Pendaftaran
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;