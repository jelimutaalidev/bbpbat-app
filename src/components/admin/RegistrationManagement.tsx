// File: src/components/admin/RegistrationManagement.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, Building, Eye, Check, X, Download, Search, 
  AlertCircle, CheckCircle, Loader2 as Loader, Edit, Save, Info
} from 'lucide-react';
import { 
  getNewRegistrations, approveRegistration, rejectRegistration,
  getAdminQuotaData, updateAdminQuota, QuotaData, QuotaUpdateData 
} from '../../api/apiService';
import ApprovalSuccessModal from './ApprovalSuccessModal';
import RejectionSuccessModal from './RejectionSuccessModal';

// ... (Interface Pendaftaran & Modal tidak berubah)
interface Pendaftaran {
  id: number;
  nama_lengkap: string;
  nama_institusi: string;
  no_telepon: string;
  pilihan_penempatan: string;
  tanggal_daftar: string;
  surat_pengajuan: string;
}
type ActionType = 'approve' | 'reject';
interface ConfirmationState { isOpen: boolean; action: ActionType | null; registrationId: number | null; message: string; }
interface ApprovalResultState { isOpen: boolean; email: string; password?: string; phone: string; message: string; }
interface RejectionResultState { isOpen: boolean; name: string; phone: string; message: string; reason: string; }


// =================================================================
// ===== SUB-KOMPONEN BARU UNTUK FITUR MANAJEMEN KUOTA =============
// =================================================================

const QuotaProgressBar: React.FC<{ filled: number; total: number }> = ({ filled, total }) => {
  const percentage = total > 0 ? (filled / total) * 100 : 0;
  let barColor = 'bg-sky-500';
  if (percentage >= 90) barColor = 'bg-red-500';
  else if (percentage >= 70) barColor = 'bg-yellow-500';

  return (
    <div>
      <div className="flex justify-between items-center mb-1 text-sm">
        <p className="font-semibold text-gray-800">Terisi: <span className="font-bold">{filled}</span> dari {total}</p>
        <p className="font-medium text-gray-500">{Math.round(percentage)}%</p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div className={`${barColor} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const QuotaCard: React.FC<{ unit: QuotaData; onEdit: (unit: QuotaData) => void }> = ({ unit, onEdit }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-indigo-300 flex flex-col">
    <div className="p-5 border-b"><h3 className="text-lg font-bold text-gray-900 truncate">{unit.nama}</h3></div>
    <div className="p-5 grid grid-cols-1 gap-5 flex-grow">
      <div className="space-y-3"><div className="flex items-center gap-2"><Users className="w-5 h-5 text-gray-500" /><h4 className="font-semibold text-gray-700">Pelajar/Mahasiswa</h4></div><QuotaProgressBar filled={unit.kuota_pelajar_terisi} total={unit.kuota_pelajar} /></div>
      <div className="space-y-3"><div className="flex items-center gap-2"><Building className="w-5 h-5 text-gray-500" /><h4 className="font-semibold text-gray-700">Umum/Dinas</h4></div><QuotaProgressBar filled={unit.kuota_umum_terisi} total={unit.kuota_umum} /></div>
    </div>
    <div className="bg-gray-50/75 p-3 text-right"><button onClick={() => onEdit(unit)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gray-800 rounded-lg shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-transform hover:scale-105"><Edit className="w-4 h-4" />Ubah Kuota</button></div>
  </div>
);

const EditQuotaModal: React.FC<{ unit: QuotaData; onClose: () => void; onSave: (id: number, data: QuotaUpdateData) => Promise<void>; }> = ({ unit, onClose, onSave }) => {
  const [kuotaPelajar, setKuotaPelajar] = useState(unit.kuota_pelajar);
  const [kuotaUmum, setKuotaUmum] = useState(unit.kuota_umum);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(unit.id, { kuota_pelajar: kuotaPelajar, kuota_umum: kuotaUmum });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-center">
            <div><h3 className="text-xl font-bold text-gray-900">Ubah Kuota</h3><p className="text-sm text-gray-500">{unit.nama}</p></div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1"><X className="w-6 h-6" /></button>
        </div>
        <div className="p-6 space-y-4">
            <div><label htmlFor="kuota-pelajar" className="block text-sm font-medium text-gray-700 mb-1">Kuota Pelajar/Mahasiswa</label><input id="kuota-pelajar" type="number" min="0" value={kuotaPelajar} onChange={(e) => setKuotaPelajar(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"/></div>
            <div><label htmlFor="kuota-umum" className="block text-sm font-medium text-gray-700 mb-1">Kuota Umum/Dinas</label><input id="kuota-umum" type="number" min="0" value={kuotaUmum} onChange={(e) => setKuotaUmum(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"/></div>
        </div>
        <div className="bg-gray-50 p-4 flex justify-end gap-3 rounded-b-2xl">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg hover:bg-gray-100">Batal</button>
            <button onClick={handleSave} disabled={isSaving} className="flex items-center justify-center gap-2 w-40 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400">
                {isSaving ? <Loader className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>}
                <span>{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
            </button>
        </div>
      </div>
    </div>
  );
};


// =================================================================
// ===== KOMPONEN UTAMA DENGAN LOGIKA TAB YANG SUDAH DIGABUNGKAN =====
// =================================================================
const RegistrationManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('new-registrations');
  const [activeSubTab, setActiveSubTab] = useState<'PELAJAR' | 'UMUM'>('PELAJAR');
  
  // State untuk tab "Pendaftaran Baru"
  const [registrations, setRegistrations] = useState<Pendaftaran[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(true);
  const [errorRegistrations, setErrorRegistrations] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<Pendaftaran | null>(null);
  
  // State untuk tab "Kuota Pendaftar"
  const [quotaData, setQuotaData] = useState<QuotaData[]>([]);
  const [loadingQuota, setLoadingQuota] = useState(true);
  const [errorQuota, setErrorQuota] = useState<string | null>(null);
  const [editingUnit, setEditingUnit] = useState<QuotaData | null>(null);

  // State untuk modal konfirmasi & hasil
  const [confirmation, setConfirmation] = useState<ConfirmationState>({ isOpen: false, action: null, registrationId: null, message: '' });
  const [approvalResult, setApprovalResult] = useState<ApprovalResultState | null>(null);
  const [rejectionResult, setRejectionResult] = useState<RejectionResultState | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch data untuk "Pendaftaran Baru"
  const fetchRegistrations = useCallback(async () => {
    setLoadingRegistrations(true); setErrorRegistrations(null);
    try {
      const response = await getNewRegistrations(activeSubTab);
      setRegistrations(response.data);
    } catch (err) { setErrorRegistrations("Gagal memuat data pendaftaran.");
    } finally { setLoadingRegistrations(false); }
  }, [activeSubTab]);

  // Fetch data untuk "Kuota Pendaftar"
  const fetchQuotaData = useCallback(async () => {
    setLoadingQuota(true); setErrorQuota(null);
    try {
        const response = await getAdminQuotaData();
        setQuotaData(response.data);
    } catch(err) { setErrorQuota("Gagal memuat data kuota.");
    } finally { setLoadingQuota(false); }
  }, []);

  useEffect(() => {
    if (activeTab === 'new-registrations') {
      fetchRegistrations();
    } else if (activeTab === 'quota-management') {
      fetchQuotaData();
    }
  }, [activeTab, fetchRegistrations, fetchQuotaData]);
  
  const handleSaveQuota = async (id: number, data: QuotaUpdateData) => {
    try {
      const response = await updateAdminQuota(id, data);
      setQuotaData(currentData => currentData.map(unit => (unit.id === id ? response.data : unit)));
      setEditingUnit(null);
    } catch (err) { alert("Gagal menyimpan perubahan. Silakan coba lagi."); }
  };

  // ... (semua fungsi handle lainnya tidak berubah)
  const openConfirmation = (action: ActionType, regId: number) => { const msg = action === 'approve' ? 'Yakin ingin menyetujui pendaftaran ini?' : 'Yakin ingin menolak pendaftaran ini?'; setConfirmation({ isOpen: true, action, registrationId: regId, message: msg }); };
  const handleConfirmAction = async () => { if (!confirmation.action || !confirmation.registrationId) return; const { action, registrationId } = confirmation; const reg = registrations.find(r => r.id === registrationId); if (!reg) return; try { if (action === 'approve') { const res = await approveRegistration(registrationId); setApprovalResult({ isOpen: true, message: res.data.message, email: res.data.email, password: res.data.password_sementara, phone: reg.no_telepon }); } else { const reason = rejectionReason || "Tidak memenuhi syarat."; const res = await rejectRegistration(registrationId, reason); setRejectionResult({ isOpen: true, message: res.data.message, name: reg.nama_lengkap, phone: reg.no_telepon, reason }); } setConfirmation({ isOpen: false, action: null, registrationId: null, message: '' }); setRejectionReason(''); if (selectedRegistration?.id === registrationId) setSelectedRegistration(null); } catch (err) { alert(`Terjadi kesalahan.`); setConfirmation({ isOpen: false, action: null, registrationId: null, message: '' }); } };
  const handleCloseSuccessModal = () => { setApprovalResult(null); fetchRegistrations(); };
  const handleCloseRejectionModal = () => { setRejectionResult(null); fetchRegistrations(); };
  const filteredRegistrations = useMemo(() => registrations.filter(reg => reg.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) || reg.nama_institusi.toLowerCase().includes(searchTerm.toLowerCase())), [registrations, searchTerm]);

  
  const renderNewRegistrations = () => {
    if (loadingRegistrations) { return <div className="flex justify-center items-center p-12"><Loader className="w-8 h-8 animate-spin text-gray-400" /></div>; }
    if (errorRegistrations) { return <div className="text-center p-8 text-red-600 flex items-center justify-center gap-2"><AlertCircle className="w-5 h-5" /> {errorRegistrations}</div>; }
    return ( <div className="space-y-6"><div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" placeholder="Cari nama atau instansi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" /></div><div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"><div className="overflow-x-auto"><table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendaftar</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instansi</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penempatan</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{filteredRegistrations.length > 0 ? filteredRegistrations.map((reg) => ( <tr key={reg.id} className="hover:bg-gray-50"><td className="px-6 py-4"><div><div className="text-sm font-medium text-gray-900">{reg.nama_lengkap}</div><div className="text-sm text-gray-500">{reg.no_telepon}</div></div></td><td className="px-6 py-4"><div className="text-sm text-gray-900">{reg.nama_institusi}</div></td><td className="px-6 py-4"><div className="text-sm text-gray-900">{reg.pilihan_penempatan}</div></td><td className="px-6 py-4"><div className="text-sm text-gray-900">{new Date(reg.tanggal_daftar).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</div></td><td className="px-6 py-4 text-sm font-medium"><div className="flex items-center gap-2"><button onClick={() => setSelectedRegistration(reg)} className="text-blue-600 hover:text-blue-900 p-1" title="Lihat Detail"><Eye className="w-4 h-4" /></button><button onClick={() => openConfirmation('approve', reg.id)} className="text-green-600 hover:text-green-900 p-1" title="Setujui"><Check className="w-4 h-4" /></button><button onClick={() => openConfirmation('reject', reg.id)} className="text-red-600 hover:text-red-900 p-1" title="Tolak"><X className="w-4 h-4" /></button><a href={reg.surat_pengajuan} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 p-1" title="Unduh Berkas"><Download className="w-4 h-4" /></a></div></td></tr> )) : ( <tr><td colSpan={5} className="text-center py-12 text-gray-500">Tidak ada pendaftaran baru.</td></tr> )}</tbody></table></div></div></div> );
  };

  const renderQuotaManagement = () => {
    if (loadingQuota) { return <div className="text-center p-12"><Loader className="w-10 h-10 mx-auto animate-spin text-gray-400" /></div>; }
    if (errorQuota) { return <div className="bg-red-50 text-red-700 p-6 rounded-lg flex items-center gap-3"><AlertCircle /> {errorQuota}</div>; }
    if(quotaData.length === 0) { return <div className="bg-gray-50 text-gray-600 p-6 rounded-lg flex items-center gap-3"><Info /> Belum ada data unit penempatan.</div>;}
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {quotaData.map(unit => (
          <QuotaCard key={unit.id} unit={unit} onEdit={setEditingUnit} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-800">Manajemen Pendaftaran</h1><p className="text-gray-600">Kelola pendaftaran dan kuota peserta bimbingan teknis</p></div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button onClick={() => setActiveTab('new-registrations')} className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'new-registrations' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}><Users className="w-4 h-4" /> Pendaftaran Baru</button>
            <button onClick={() => setActiveTab('quota-management')} className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'quota-management' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}><Building className="w-4 h-4" /> Kuota Pendaftar</button>
          </nav>
        </div>
        
        {activeTab === 'new-registrations' && (
            <div className="border-b border-gray-200 bg-gray-50">
                <nav className="flex space-x-8 px-6">
                    <button onClick={() => setActiveSubTab('PELAJAR')} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeSubTab === 'PELAJAR' ? 'border-gray-800 text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Pelajar</button>
                    <button onClick={() => setActiveSubTab('UMUM')} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeSubTab === 'UMUM' ? 'border-gray-800 text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Masyarakat/Dinas</button>
                </nav>
            </div>
        )}

        <div className="p-6">
          {activeTab === 'new-registrations' ? renderNewRegistrations() : renderQuotaManagement()}
        </div>
      </div>
      
      {/* Semua Modal dirender di akhir */}
      {selectedRegistration && ( <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"><div className="flex items-center justify-between mb-6"><h3 className="text-lg font-semibold text-gray-800">Detail Pendaftaran</h3><button onClick={() => setSelectedRegistration(null)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button></div><div className="space-y-4"><div className="grid md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700">Nama Lengkap</label><p className="mt-1 text-sm text-gray-900">{selectedRegistration.nama_lengkap}</p></div><div><label className="block text-sm font-medium text-gray-700">Instansi</label><p className="mt-1 text-sm text-gray-900">{selectedRegistration.nama_institusi}</p></div><div><label className="block text-sm font-medium text-gray-700">Nomor WhatsApp</label><p className="mt-1 text-sm text-gray-900">{selectedRegistration.no_telepon}</p></div><div><label className="block text-sm font-medium text-gray-700">Pilihan Penempatan</label><p className="mt-1 text-sm text-gray-900">{selectedRegistration.pilihan_penempatan}</p></div></div><div className="flex gap-4 pt-4"><button onClick={() => openConfirmation('approve', selectedRegistration.id)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"><CheckCircle className="w-4 h-4" />Setujui Pendaftaran</button><button onClick={() => openConfirmation('reject', selectedRegistration.id)} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"><X className="w-4 h-4" />Tolak Pendaftaran</button></div></div></div></div> )}
      {confirmation.isOpen && ( <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-6 max-w-md w-full mx-4"><h3 className="text-lg font-semibold text-gray-800 mb-4">Konfirmasi Tindakan</h3><p className="text-gray-600 mb-4">{confirmation.message}</p>{confirmation.action === 'reject' && ( <div className="mb-4"><label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">Alasan Penolakan (Opsional)</label><textarea id="rejectionReason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" rows={3} placeholder="Contoh: Kuota sudah penuh."></textarea></div> )}<div className="flex justify-end gap-4 mt-6"><button onClick={() => setConfirmation({ isOpen: false, action: null, registrationId: null, message: '' })} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Batal</button><button onClick={handleConfirmAction} className={`px-4 py-2 text-white rounded-lg ${ confirmation.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700' }`}>Ya, Lanjutkan</button></div></div></div> )}
      {approvalResult?.isOpen && ( <ApprovalSuccessModal data={approvalResult} onClose={handleCloseSuccessModal} /> )}
      {rejectionResult?.isOpen && ( <RejectionSuccessModal data={rejectionResult} onClose={handleCloseRejectionModal} /> )}
      {editingUnit && ( <EditQuotaModal unit={editingUnit} onClose={() => setEditingUnit(null)} onSave={handleSaveQuota} /> )}

    </div>
  );
};

export default RegistrationManagement;