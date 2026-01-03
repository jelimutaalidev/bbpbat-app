import React from 'react';
import { ArrowLeft, GraduationCap, Users, ArrowRight } from 'lucide-react';
import { NavigationState } from '../App';
import { useNavigate } from 'react-router-dom';

interface RegistrationMenuProps {
  onNavigate: (page: NavigationState) => void; // Deprecated
}

const RegistrationMenu: React.FC<RegistrationMenuProps> = () => {
  const navigate = useNavigate();

  const registrationTypes = [
    {
      type: 'student',
      title: 'Daftar sebagai Pelajar',
      description: 'Untuk mahasiswa, siswa, atau pelajar yang ingin mengikuti program bimbingan teknis',
      icon: <GraduationCap className="w-12 h-12 text-blue-600" />,
      features: [
        'Surat rekomendasi dari institusi',
        'Pembimbing dari institusi',
        'Biaya pelatihan ditanggung institusi',
        'Sertifikat untuk keperluan akademik'
      ],
      color: 'border-blue-200 hover:border-blue-300 hover:bg-blue-50'
    },
    {
      type: 'general',
      title: 'Daftar sebagai Umum/Dinas',
      description: 'Untuk masyarakat umum, perusahaan, atau instansi dinas',
      icon: <Users className="w-12 h-12 text-teal-600" />,
      features: [
        'Melengkapi bukti pembayaran',
        'Menyertakan surat rekomendasi (jika dari dinas)',
        'Memiliki komitmen mengikuti pelatihan',
        'Sertifikat kompetensi'
      ],
      color: 'border-teal-200 hover:border-teal-300 hover:bg-teal-50'
    }
  ];

  const handleSelection = (type: string) => {
    if (type === 'student') {
      navigate('/registration/student');
    } else {
      navigate('/registration/general');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Pendaftaran Bimbingan Teknis
            </h1>
            <p className="text-lg text-gray-600">
              Silakan pilih kategori pendaftaran yang sesuai dengan status Anda
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {registrationTypes.map((item) => (
              <div
                key={item.type}
                onClick={() => handleSelection(item.type)}
                className={`bg-white rounded-xl p-8 border-2 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md group ${item.color}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100 group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>

                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {item.description}
                </p>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800 text-sm uppercase tracking-wide">
                    Persyaratan & Fasilitas:
                  </h4>
                  <ul className="space-y-2">
                    {item.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-600 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-blue-50 rounded-lg p-6 border border-blue-100">
            <p className="text-blue-800">
              <strong>Butuh bantuan?</strong> Hubungi layanan pelanggan kami di{' '}
              <a href="#" className="underline hover:text-blue-900">0812-3456-7890</a> atau email ke{' '}
              <a href="#" className="underline hover:text-blue-900">info@bbpbat.go.id</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationMenu;