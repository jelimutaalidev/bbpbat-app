// [FRONTEND] src/components/admin/AnnouncementManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Plus, Edit, Trash2, Calendar, Users, Loader2, X, Send, ShieldCheck, FileText, Bell, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  AnnouncementData
} from '../../api/apiService';

// Interface utama tidak berubah, hanya nama yang lebih singkat
interface Announcement extends AnnouncementData {
  id: number;
  penulis: string;
  tanggalBuat: string;
  tanggalPublish: string | null;
}

// Opsi untuk form (dikeluarkan agar lebih rapi)
const FORM_OPTIONS = {
  categories: ['Umum', 'Jadwal', 'Workshop', 'Evaluasi', 'Sertifikat', 'Teknis'],
  targets: ['Semua Peserta', 'PELAJAR', 'UMUM'],
  priorities: [
    { value: 'rendah', label: 'Rendah' },
    { value: 'sedang', label: 'Sedang' },
    { value: 'tinggi', label: 'Tinggi' }
  ],
};

// Helper untuk styling & format
const getStatusProps = (status: string) => status === 'published' 
  ? { text: 'Dipublikasikan', color: 'bg-teal-100 text-teal-800', icon: <ShieldCheck className="w-3 h-3" /> }
  : { text: 'Draft', color: 'bg-amber-100 text-amber-800', icon: <FileText className="w-3 h-3" /> };

const getPriorityProps = (priority: string) => {
    switch (priority) {
      case 'tinggi': return { text: 'Tinggi', color: 'bg-rose-100 text-rose-800' };
      case 'sedang': return { text: 'Sedang', color: 'bg-sky-100 text-sky-800' };
      case 'rendah': return { text: 'Rendah', color: 'bg-indigo-100 text-indigo-800' };
      default: return { text: 'N/A', color: 'bg-slate-100 text-slate-800' };
    }
};

const formatDate = (dateString: string | null) => dateString 
  ? new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) 
  : 'Belum dipublikasi';


// ===== SUB-KOMPONEN UNTUK UI YANG LEBIH BAIK =====

// 1. Kartu Statistik dengan Animasi
const StatCard = ({ icon, title, value, color, isLoading }: { icon: React.ReactNode, title: string, value: number | string, color: string, isLoading: boolean }) => (
    <motion.div
      className={`bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex items-center gap-5`}
      whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-slate-800">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : value}
        </p>
      </div>
    </motion.div>
);

// 2. Kartu Pengumuman Individual dengan Animasi
const AnnouncementCard = ({ ann, onEdit, onDelete, onPublish }: { ann: Announcement, onEdit: () => void, onDelete: () => void, onPublish: () => void }) => {
    const status = getStatusProps(ann.status);
    const priority = getPriorityProps(ann.prioritas);

    return (
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
        >
            <div className="flex items-start justify-between gap-4">
                {/* Konten Utama */}
                <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-2 mb-3">
                        <h3 className="text-xl font-bold text-slate-800">{ann.judul}</h3>
                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>{status.icon}{status.text}</span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${priority.color}`}>{priority.text}</span>
                    </div>
                    <p className="text-slate-600 mb-4 line-clamp-2">{ann.konten}</p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 font-medium">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /><span>{formatDate(ann.tanggalBuat)}</span></div>
                        <div className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" /><span>{ann.target}</span></div>
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                    {ann.status === 'draft' && (
                         <motion.button onClick={onPublish} whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} className="flex items-center gap-2 bg-teal-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors" title="Publikasikan">
                            <Send className="w-4 h-4"/>
                            <span>Publish</span>
                         </motion.button>
                    )}
                    <motion.button onClick={onEdit} whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} className="bg-slate-100 p-2 rounded-full text-slate-600 hover:bg-slate-200 hover:text-indigo-600 transition-colors" title="Edit"><Edit className="w-5 h-5" /></motion.button>
                    <motion.button onClick={onDelete} whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} className="bg-slate-100 p-2 rounded-full text-slate-600 hover:bg-slate-200 hover:text-rose-600 transition-colors" title="Hapus"><Trash2 className="w-5 h-5" /></motion.button>
                </div>
            </div>
        </motion.div>
    );
};

// 3. Modal Form yang lebih modern
const AnnouncementModal = ({ show, onClose, onSubmit, formData, setFormData, isEditing }: { show: boolean, onClose: () => void, onSubmit: (e: React.FormEvent) => void, formData: AnnouncementData, setFormData: React.Dispatch<React.SetStateAction<AnnouncementData>>, isEditing: boolean }) => (
    <AnimatePresence>
        {show && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 30 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-6 flex-shrink-0">
                        <h3 className="text-2xl font-bold text-slate-800">{isEditing ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}</h3>
                        <motion.button onClick={onClose} whileHover={{scale: 1.2, rotate: 90}} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></motion.button>
                    </div>
                    <form onSubmit={onSubmit} className="space-y-5 overflow-y-auto flex-grow pr-2">
                        {/* Judul & Konten */}
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">Judul</label>
                            <input type="text" value={formData.judul} onChange={(e) => setFormData(p => ({ ...p, judul: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" required/>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">Konten</label>
                            <textarea value={formData.konten} onChange={(e) => setFormData(p => ({ ...p, konten: e.target.value }))} rows={5} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" required/>
                        </div>
                        
                        {/* Opsi dalam Grid */}
                        <div className="grid md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Kategori</label>
                                <select value={formData.kategori} onChange={(e) => setFormData(p => ({ ...p, kategori: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" required>
                                    {FORM_OPTIONS.categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Target</label>
                                <select value={formData.target} onChange={(e) => setFormData(p => ({ ...p, target: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" required>
                                    {FORM_OPTIONS.targets.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Prioritas</label>
                                <select value={formData.prioritas} onChange={(e) => setFormData(p => ({ ...p, prioritas: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                                    {FORM_OPTIONS.priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Status</label>
                                <select value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                                    <option value="draft">Simpan sebagai Draft</option>
                                    <option value="published">Publikasikan Langsung</option>
                                </select>
                            </div>
                        </div>

                        {/* Tombol Aksi Form */}
                        <div className="flex gap-4 pt-4 flex-shrink-0">
                            <motion.button type="submit" whileHover={{scale: 1.05}} whileTap={{scale: 0.95}} className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                                {isEditing ? 'Update Pengumuman' : 'Simpan & Buat'}
                            </motion.button>
                            <motion.button type="button" onClick={onClose} whileHover={{scale: 1.05}} whileTap={{scale: 0.95}} className="bg-slate-200 text-slate-700 px-8 py-2.5 rounded-lg font-bold hover:bg-slate-300 transition-colors">
                                Batal
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

// ===== KOMPONEN UTAMA =====
const AnnouncementManagement: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [formData, setFormData] = useState<AnnouncementData>({
        judul: '', konten: '', kategori: 'Umum', target: 'Semua Peserta', prioritas: 'sedang', status: 'draft'
    });

    const fetchAnnouncements = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getAnnouncements();
            // Urutkan: published dulu, baru draft. Di dalamnya, urutkan berdasarkan tanggal terbaru.
            const sortedData = response.data.sort((a: Announcement, b: Announcement) => {
                if (a.status === 'published' && b.status === 'draft') return -1;
                if (a.status === 'draft' && b.status === 'published') return 1;
                const dateA = a.tanggalPublish || a.tanggalBuat;
                const dateB = b.tanggalPublish || b.tanggalBuat;
                return new Date(dateB).getTime() - new Date(dateA).getTime();
            });
            setAnnouncements(sortedData);
        } catch (err) {
            setError("Gagal memuat data pengumuman.");
            console.error(err);
            toast.error("Gagal memuat data pengumuman.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    const resetForm = () => {
        setShowForm(false);
        setEditingAnnouncement(null);
        setFormData({
            judul: '', konten: '', kategori: 'Umum', target: 'Semua Peserta', prioritas: 'sedang', status: 'draft'
        });
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isEditing = !!editingAnnouncement;
        const action = isEditing ? 'Memperbarui' : 'Membuat';
        const toastId = toast.loading(`${action} pengumuman...`);
        
        try {
            if (isEditing) {
                await updateAnnouncement(editingAnnouncement.id, formData);
            } else {
                await createAnnouncement(formData);
            }
            toast.success(`Pengumuman berhasil di${isEditing ? 'perbarui' : 'buat'}!`, { id: toastId, icon: <CheckCircle className="text-green-500" /> });
            resetForm();
            fetchAnnouncements();
        } catch (err) {
            toast.error(`Gagal ${action.toLowerCase()} pengumuman.`, { id: toastId });
        }
    };

    const handleEdit = (ann: Announcement) => {
        setEditingAnnouncement(ann);
        setFormData({
            judul: ann.judul, konten: ann.konten, kategori: ann.kategori,
            target: ann.target, prioritas: ann.prioritas, status: ann.status,
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        // Menggunakan konfirmasi custom, bukan window.confirm
        const confirmed = await new Promise(resolve => {
            toast(
                (t) => (
                    <div className='flex flex-col gap-4'>
                        <p className='font-bold'>Apakah Anda yakin?</p>
                        <p>Pengumuman ini akan dihapus secara permanen.</p>
                        <div className='flex gap-2'>
                            <button className='bg-red-500 text-white px-4 py-1 rounded-md' onClick={() => {toast.dismiss(t.id); resolve(true);}}>
                                Ya, Hapus
                            </button>
                            <button className='bg-slate-200 px-4 py-1 rounded-md' onClick={() => {toast.dismiss(t.id); resolve(false);}}>
                                Batal
                            </button>
                        </div>
                    </div>
                ),
                { duration: 6000 }
            );
        });

        if (confirmed) {
            const toastId = toast.loading('Menghapus pengumuman...');
            try {
                await deleteAnnouncement(id);
                toast.success('Pengumuman berhasil dihapus.', { id: toastId });
                fetchAnnouncements();
            } catch (err) {
                toast.error('Gagal menghapus pengumuman.', { id: toastId });
            }
        }
    };
    
    const handlePublish = async (announcement: Announcement) => {
        const toastId = toast.loading('Memublikasikan pengumuman...');
        try {
            const updatedData = { ...announcement, status: 'published' };
            await updateAnnouncement(announcement.id, updatedData);
            toast.success('Pengumuman berhasil dipublikasikan.', { id: toastId });
            fetchAnnouncements();
        } catch (err) {
            toast.error('Gagal memublikasikan pengumuman.', { id: toastId });
        }
    };

    const stats = {
        total: announcements.length,
        published: announcements.filter(a => a.status === 'published').length,
        draft: announcements.filter(a => a.status === 'draft').length,
        highPriority: announcements.filter(a => a.prioritas === 'tinggi').length,
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
            <Toaster position="top-center" toastOptions={{ style: { borderRadius: '12px', background: '#333', color: '#fff' } }}/>

            {/* Header */}
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-slate-800">Manajemen Pengumuman</h1>
                    <p className="text-slate-500 mt-1">Kelola dan publikasikan informasi penting untuk semua peserta.</p>
                </div>
                <motion.button
                    onClick={() => { setShowForm(true); setEditingAnnouncement(null); }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 sm:mt-0 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Buat Baru
                </motion.button>
            </header>

            {/* Statistics Grid */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.1 } }
                }}
            >
                <motion.div variants={{hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }}}>
                    <StatCard icon={<Megaphone className="w-7 h-7 text-sky-600" />} title="Total Pengumuman" value={stats.total} color="bg-sky-100" isLoading={isLoading} />
                </motion.div>
                <motion.div variants={{hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }}}>
                    <StatCard icon={<ShieldCheck className="w-7 h-7 text-teal-600" />} title="Dipublikasikan" value={stats.published} color="bg-teal-100" isLoading={isLoading} />
                </motion.div>
                <motion.div variants={{hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }}}>
                    <StatCard icon={<FileText className="w-7 h-7 text-amber-600" />} title="Draft" value={stats.draft} color="bg-amber-100" isLoading={isLoading} />
                </motion.div>
                <motion.div variants={{hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }}}>
                    <StatCard icon={<Bell className="w-7 h-7 text-rose-600" />} title="Prioritas Tinggi" value={stats.highPriority} color="bg-rose-100" isLoading={isLoading} />
                </motion.div>
            </motion.div>

            {/* Announcements List */}
            <main className="space-y-6">
                <AnimatePresence>
                    {isLoading ? (
                        <div className="text-center p-20"><Loader2 className="w-12 h-12 mx-auto animate-spin text-indigo-500" /></div>
                    ) : error ? (
                        <div className="text-center p-20 text-rose-600 bg-rose-50 rounded-xl">{error}</div>
                    ) : (
                        announcements.map((ann) => (
                            <AnnouncementCard 
                                key={ann.id} 
                                ann={ann}
                                onEdit={() => handleEdit(ann)}
                                onDelete={() => handleDelete(ann.id)}
                                onPublish={() => handlePublish(ann)}
                            />
                        ))
                    )}
                </AnimatePresence>
            </main>

            <AnnouncementModal 
                show={showForm} 
                onClose={resetForm} 
                onSubmit={handleSubmit}
                formData={formData}
                setFormData={setFormData}
                isEditing={!!editingAnnouncement}
            />
        </div>
    );
};

export default AnnouncementManagement;