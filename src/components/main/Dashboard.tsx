import React, { useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useDashboard, useAnnouncement } from '../../hooks/useDashboard';
import WelcomeSection from './dashboard/WelcomeSection';
import AttendanceCard from './dashboard/AttendanceCard';
import ProgressCard from './dashboard/ProgressCard';
import CertificateCard from './dashboard/CertificateCard';
import ReportCard from './dashboard/ReportCard';
import PaymentCard from './dashboard/PaymentCard';
import MentorCard from './dashboard/MentorCard';
import AnnouncementList from './dashboard/AnnouncementList';
import AnnouncementModal from './dashboard/AnnouncementModal';
import { UserData } from '../../types/app';

interface DashboardProps {
  userData: Pick<UserData, 'name'>;
  setActiveComponent: (component: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userData, setActiveComponent }) => {
  const { data, loading, error } = useDashboard();
  const {
    selectedAnnouncement,
    loading: modalLoading,
    fetchAnnouncementDetail,
    clearAnnouncement
  } = useAnnouncement();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAnnouncementClick = (id: number) => {
    setIsModalOpen(true);
    fetchAnnouncementDetail(id);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    clearAnnouncement();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg flex items-center justify-center gap-2 border border-red-100">
        <AlertTriangle className="w-6 h-6" /> {error}
      </div>
    );
  }

  if (!data) {
    return <div className="text-center p-8 text-gray-500">Data tidak ditemukan.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <WelcomeSection name={userData.name} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.tipe_peserta === 'PELAJAR' && (
              <AttendanceCard totalHadir={data.total_hadir} />
            )}

            {data.tipe_peserta === 'UMUM' && data.progres_program && (
              <ProgressCard progres={data.progres_program} />
            )}

            <CertificateCard isAvailable={data.sertifikat_tersedia} />
          </div>

          {/* Action Card */}
          {data.tipe_peserta === 'PELAJAR' ? (
            <ReportCard
              laporanStatus={data.laporan_status}
              setActiveComponent={setActiveComponent}
            />
          ) : (
            <PaymentCard
              pembayaranStatus={data.pembayaran_status}
              setActiveComponent={setActiveComponent}
            />
          )}
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-1 space-y-6">
          <MentorCard pembimbing={data.pembimbing} />

          <AnnouncementList
            announcements={data.pengumuman_terbaru}
            onAnnouncementClick={handleAnnouncementClick}
          />
        </div>
      </div>

      <AnnouncementModal
        isOpen={isModalOpen}
        loading={modalLoading}
        announcement={selectedAnnouncement}
        onClose={closeModal}
      />
    </div>
  );
};

export default Dashboard;