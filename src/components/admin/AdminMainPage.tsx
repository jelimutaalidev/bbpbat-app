import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Award,
  Megaphone,
  LogOut,
  Menu,
  X,
  Shield,
  UserPlus,
  UserCheck,
  DollarSign
} from 'lucide-react'
// Hapus import NavigationState jika tidak digunakan di tempat lain
// import { NavigationState } from '../../App'; 
import AdminDashboard from './AdminDashboard'
import RegistrationManagement from './RegistrationManagement'
import ParticipantManagement from './ParticipantManagement'
import AttendanceManagement from './AttendanceManagement'
import ReportManagement from './ReportManagement'
import CertificateManagement from './CertificateManagement'
import AnnouncementManagement from './AnnouncementManagement'
import PaymentManagement from './PaymentManagement'

interface AdminMainPageProps {
  // onNavigate tidak lagi diperlukan di sini karena navigasi dikelola secara internal
  onLogout: () => void
}

const AdminMainPage: React.FC<AdminMainPageProps> = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // menuItems tidak perlu properti 'component' lagi, karena kita akan handle rendering di bawah
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'registrations', label: 'Manajemen Pendaftaran', icon: <UserPlus className="w-5 h-5" /> },
    { id: 'participants', label: 'Manajemen Peserta', icon: <Users className="w-5 h-5" /> },
    { id: 'attendance', label: 'Manajemen Absensi', icon: <UserCheck className="w-5 h-5" /> },
    { id: 'reports', label: 'Manajemen Laporan', icon: <FileText className="w-5 h-5" /> },
    { id: 'payments', label: 'Manajemen Pembayaran', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'certificates', label: 'Manajemen Sertifikat', icon: <Award className="w-5 h-5" /> },
    { id: 'announcements', label: 'Pengumuman', icon: <Megaphone className="w-5 h-5" /> },
  ]

  const handleMenuClick = (menuId: string) => {
    setActiveMenu(menuId)
    setSidebarOpen(false) // Menutup sidebar saat menu di-klik di mobile
  }

  // Fungsi untuk merender komponen yang aktif
  const renderActiveComponent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <AdminDashboard onNavigate={handleMenuClick} />
      case 'registrations':
        return <RegistrationManagement />
      case 'participants':
        return <ParticipantManagement />
      case 'attendance':
        return <AttendanceManagement />
      case 'reports':
        return <ReportManagement />
      case 'payments':
        return <PaymentManagement />
      case 'certificates':
        return <CertificateManagement />
      case 'announcements':
        return <AnnouncementManagement />
      default:
        return <AdminDashboard onNavigate={handleMenuClick} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-gray-800">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-white" />
            <span className="text-xl font-bold text-white">Admin BBPBAT</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                    activeMenu === item.id
                      ? 'bg-gray-800 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-lg font-bold text-gray-800">Admin BBPBAT</span>
            <div className="w-6"></div> {/* Spacer */}
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {renderActiveComponent()}
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default AdminMainPage