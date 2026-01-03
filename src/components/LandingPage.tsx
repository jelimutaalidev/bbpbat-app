import React from 'react';
import { Fish, Calendar, MapPin, Phone, Mail, Facebook, Instagram, Twitter, ArrowRight, Users, BookOpen, Award, LogIn, Shield } from 'lucide-react';
import { NavigationState } from '../App';
import { useNavigate } from 'react-router-dom';

interface LandingPageProps {
  onNavigate: (page: NavigationState) => void; // Deprecated
}

const LandingPage: React.FC<LandingPageProps> = () => {
  const navigate = useNavigate();
  const registrationPeriods = [
    { month: 'Mei 2025', status: 'closed', color: 'bg-red-100 text-red-800' },
    { month: 'Juni 2025', status: 'open', color: 'bg-green-100 text-green-800' },
    { month: 'Juli 2025', status: 'upcoming', color: 'bg-yellow-100 text-yellow-800' },
    { month: 'Agustus 2025', status: 'upcoming', color: 'bg-gray-100 text-gray-600' },
  ];

  const features = [
    {
      icon: <BookOpen className="w-8 h-8 text-blue-600" />,
      title: 'Pelatihan Berkualitas',
      description: 'Program pelatihan komprehensif dengan instruktur berpengalaman'
    },
    {
      icon: <Users className="w-8 h-8 text-teal-600" />,
      title: 'Komunitas Aktif',
      description: 'Bergabung dengan komunitas peternak ikan air tawar yang dinamis'
    },
    {
      icon: <Award className="w-8 h-8 text-orange-600" />,
      title: 'Sertifikasi Resmi',
      description: 'Dapatkan sertifikat resmi yang diakui industri'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header with Login Buttons */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Fish className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-800">BBPBAT</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Log In Peserta
              </button>
              <button
                onClick={() => navigate('/admin/login')}
                className="bg-gray-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors duration-200 flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                <Fish className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              WEB BIMTEK BBPBAT
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Balai Besar Perikanan Budidaya Air Tawar
            </p>
            <p className="text-lg md:text-xl mb-12 opacity-80 max-w-3xl mx-auto">
              Platform digital untuk mengatur seluruh kegiatan bimbingan teknis di lingkungan BBPBAT,
              mulai dari pendaftaran, absensi, laporan akhir, hingga penerbitan sertifikat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/info')}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                Info Selengkapnya
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/registration')}
                className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-200"
              >
                Ajukan Pendaftaran
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-100 transition-colors duration-200">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Registration Periods */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              Periode Pendaftaran Bimtek
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {registrationPeriods.map((period, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-800">{period.month}</h3>
                  </div>
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${period.color}`}>
                    {period.status === 'closed' && 'Ditutup'}
                    {period.status === 'open' && 'Dibuka'}
                    {period.status === 'upcoming' && 'Akan Dibuka'}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <button
                onClick={() => navigate('/registration')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 inline-flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Ajukan Pendaftaran
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              Hubungi Kami
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-lg p-8">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">Informasi Kontak</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Telepon</p>
                      <p className="text-gray-600">+62 123 456 789</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Email</p>
                      <p className="text-gray-600">info@bbpbat.go.id</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <MapPin className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Alamat</p>
                      <p className="text-gray-600">
                        Jl. Perikanan No. 123, Sukabumi,<br />
                        Jawa Barat 43114, Indonesia
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-8">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">Media Sosial</h3>
                <div className="grid grid-cols-2 gap-4">
                  <a href="#" className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow duration-200">
                    <Facebook className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-800">Facebook</p>
                  </a>
                  <a href="#" className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow duration-200">
                    <Instagram className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-800">Instagram</p>
                  </a>
                  <a href="#" className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow duration-200">
                    <Twitter className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-800">Twitter</p>
                  </a>
                  <a href="#" className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow duration-200">
                    <Phone className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-800">WhatsApp</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;