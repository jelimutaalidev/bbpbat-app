import React from 'react';
import { ArrowLeft, Fish, Target, Users, BookOpen, Award, Calendar, MapPin, Clock, CheckCircle, HelpCircle, Phone, Mail } from 'lucide-react';
import { NavigationState } from '../App';
import { useNavigate } from 'react-router-dom';

interface InfoPageProps {
  onNavigate: (page: NavigationState) => void; // Deprecated
}

const InfoPage: React.FC<InfoPageProps> = () => {
  const navigate = useNavigate();

  const programs = [
    {
      title: 'Budidaya Ikan Air Tawar',
      description: 'Teknik budidaya ikan mas, nila, lele, dan ikan air tawar lainnya',
      duration: '5 Hari',
      participants: '20-30 Orang',
      icon: <Fish className="w-8 h-8 text-blue-600" />
    },
    {
      title: 'Manajemen Kualitas Air',
      description: 'Pengelolaan kualitas air untuk budidaya ikan yang optimal',
      duration: '3 Hari',
      participants: '15-25 Orang',
      icon: <Target className="w-8 h-8 text-teal-600" />
    },
    {
      title: 'Teknologi Pakan Ikan',
      description: 'Formulasi dan pembuatan pakan ikan berkualitas tinggi',
      duration: '4 Hari',
      participants: '20-30 Orang',
      icon: <BookOpen className="w-8 h-8 text-orange-600" />
    },
    {
      title: 'Pengolahan Hasil Perikanan',
      description: 'Teknik pengolahan dan pengemasan produk perikanan',
      duration: '3 Hari',
      participants: '15-20 Orang',
      icon: <Award className="w-8 h-8 text-green-600" />
    }
  ];

  const benefits = [
    'Sertifikat resmi dari BBPBAT',
    'Materi pelatihan terkini dan praktis',
    'Instruktur berpengalaman',
    'Praktek langsung di lapangan',
    'Networking dengan sesama peserta',
    'Konsultasi lanjutan pasca pelatihan'
  ];

  const requirements = [
    'Minimal pendidikan SMA/sederajat',
    'Memiliki minat di bidang perikanan',
    'Mengisi formulir pendaftaran lengkap',
    'Menyertakan surat rekomendasi (untuk pelajar)',
    'Melunasi biaya pelatihan (untuk umum)',
    'Mengikuti seluruh rangkaian kegiatan'
  ];

  const faqs = [
    {
      question: "Apa saja persyaratan pendaftaran?",
      answer: "Untuk pelajar/mahasiswa: Surat pengantar dari sekolah/kampus, proposal kegiatan, dan pas foto. Untuk umum: KTP dan surat permohonan."
    },
    {
      question: "Berapa lama durasi kegiatan?",
      answer: "Durasi PKL/Magang minimal 1 bulan dan maksimal 3 bulan. Untuk pelatihan umum menyesuaikan dengan paket yang dipilih (3-7 hari)."
    },
    {
      question: "Apakah disediakan penginapan?",
      answer: "Ya, BBPBAT menyediakan asrama bagi peserta dengan fasilitas standar (tempat tidur, lemari, kamar mandi luar)."
    },
    {
      question: "Bagaimana dengan konsumsi?",
      answer: "Peserta mendapatkan makan 3x sehari selama kegiatan berlangsung."
    }
  ];

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

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                <Fish className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Bimbingan Teknis Perikanan
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Balai Besar Perikanan Budidaya Air Tawar
            </p>
            <p className="text-lg opacity-80 max-w-3xl mx-auto">
              Program pelatihan komprehensif untuk meningkatkan kemampuan dan pengetahuan
              di bidang perikanan budidaya air tawar dengan standar nasional.
            </p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Tentang BBPBAT
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Balai Besar Perikanan Budidaya Air Tawar (BBPBAT) adalah unit pelaksana teknis
                di lingkungan Kementerian Kelautan dan Perikanan yang bertugas melaksanakan
                penelitian, pengembangan, dan pelayanan teknis di bidang perikanan budidaya air tawar.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">1000+</h3>
                <p className="text-gray-600">Peserta Terlatih</p>
              </div>
              <div className="text-center">
                <div className="bg-teal-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">50+</h3>
                <p className="text-gray-600">Program Pelatihan</p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">25+</h3>
                <p className="text-gray-600">Tahun Pengalaman</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">100%</h3>
                <p className="text-gray-600">Tersertifikasi</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Programs Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Program Bimbingan Teknis
              </h2>
              <p className="text-lg text-gray-600">
                Berbagai program pelatihan yang dirancang untuk meningkatkan kompetensi di bidang perikanan
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {programs.map((program, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      {program.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{program.title}</h3>
                      <p className="text-gray-600 mb-4">{program.description}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {program.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {program.participants}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits & Requirements */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Keunggulan Program
                </h3>
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="bg-green-100 rounded-full p-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Persyaratan Peserta
                </h3>
                <div className="space-y-3">
                  {requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="bg-blue-100 rounded-full p-1">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-gray-700">{requirement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Pertanyaan Umum (FAQ)
              </h2>
              <p className="text-lg text-gray-600">
                Jawaban untuk pertanyaan yang sering diajukan
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 ml-8">{faq.answer}</p>
                </div>
              ))}
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

              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-8 text-white shadow-lg flex flex-col justify-center text-center">
                <h3 className="font-bold text-2xl mb-4">Siap Mendaftar?</h3>
                <p className="text-blue-100 mb-8">
                  Segera daftarkan diri Anda atau kelompok untuk mengikuti kegiatan di BBPBAT.
                </p>
                <button
                  onClick={() => navigate('/registration')}
                  className="bg-white text-blue-600 py-3 px-8 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 inline-flex items-center justify-center gap-2 mx-auto"
                >
                  <Calendar className="w-4 h-4" />
                  Daftar Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;