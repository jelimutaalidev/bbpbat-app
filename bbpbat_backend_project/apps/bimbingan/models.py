# File: apps/bimbingan/models.py

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

# Mengimpor model dari aplikasi lain untuk membuat relasi
# Kita asumsikan 'apps.peserta.models' akan ada, meskipun kita belum membuatnya.
# Jika Anda menjalankan makemigrations sekarang, ini mungkin error. Itu normal.
from apps.peserta.models import PesertaProfile

class Penempatan(models.Model):
    """
    Model untuk mengelola semua unit penempatan yang tersedia beserta kuotanya.
    Ini menjadi sumber data utama (single source of truth) untuk kuota pendaftaran.
    """
    nama = models.CharField(_("Nama Unit Penempatan"), max_length=255, unique=True)
    kuota_pelajar = models.PositiveIntegerField(_("Kuota Pelajar"), default=10)
    kuota_umum = models.PositiveIntegerField(_("Kuota Umum/Dinas"), default=5)
    deskripsi = models.TextField(_("Deskripsi Singkat"), blank=True)

    class Meta:
        verbose_name = "Unit Penempatan"
        verbose_name_plural = "Unit Penempatan"
        ordering = ['nama']

    def __str__(self):
        return self.nama

class Pendaftaran(models.Model):
    """
    Mencatat setiap pengajuan pendaftaran baru yang masuk ke sistem.
    Data di sini bersifat sementara hingga admin menyetujui dan membuatkan akun User.
    """
    class Status(models.TextChoices):
        PENDING = "PENDING", "Menunggu Persetujuan"
        DISETUJUI = "DISETUJUI", "Disetujui"
        DITOLAK = "DITOLAK", "Ditolak"

    # Informasi pendaftar
    email = models.EmailField(_("Email Pendaftar"), unique=True, help_text="Pastikan email aktif untuk notifikasi.")
    nama_lengkap = models.CharField(_("Nama Lengkap"), max_length=255)
    tipe_peserta = models.CharField(_("Tipe Peserta"), max_length=50, choices=PesertaProfile.TipePeserta.choices)
    nama_institusi = models.CharField(_("Nama Institusi"), max_length=255)
    no_telepon = models.CharField(_("No. Telepon/WA"), max_length=20)
    
    # Informasi Pembimbing (Baru)
    nama_pembimbing = models.CharField(_("Nama Pembimbing"), max_length=255, blank=True)
    no_telepon_pembimbing = models.CharField(_("No. Telepon Pembimbing"), max_length=20, blank=True)
    email_pembimbing = models.EmailField(_("Email Pembimbing"), blank=True)
    
    # Informasi pendaftaran
    pilihan_penempatan = models.ForeignKey(Penempatan, on_delete=models.SET_NULL, null=True, related_name="pendaftaran")
    surat_pengajuan = models.FileField(_("Surat Pengajuan"), upload_to='surat_pengajuan/')
    status = models.CharField(_("Status Pendaftaran"), max_length=50, choices=Status.choices, default=Status.PENDING)
    
    # Relasi ke akun User yang dibuat setelah disetujui
    user_terkait = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, help_text="Akun pengguna yang dibuat setelah pendaftaran disetujui.")
    
    tanggal_daftar = models.DateTimeField(_("Tanggal Daftar"), auto_now_add=True)

    class Meta:
        verbose_name = "Pendaftaran"
        verbose_name_plural = "Data Pendaftaran"
        ordering = ['-tanggal_daftar']

    def __str__(self):
        return f"Pendaftaran: {self.nama_lengkap} ({self.get_status_display()})"


class Absensi(models.Model):
    """ Mencatat kehadiran harian setiap peserta. """
    class StatusKehadiran(models.TextChoices):
        HADIR = "HADIR", "Hadir"
        IZIN = "IZIN", "Izin"
        SAKIT = "SAKIT", "Sakit"
        ALPHA = "ALPHA", "Alpha"

    profil = models.ForeignKey(PesertaProfile, on_delete=models.CASCADE, related_name='absensi')
    tanggal = models.DateField(_("Tanggal Absensi"))
    jam_masuk = models.TimeField(_("Jam Masuk"), null=True, blank=True)
    jam_keluar = models.TimeField(_("Jam Keluar"), null=True, blank=True)
    status_kehadiran = models.CharField(_("Status Kehadiran"), max_length=20, choices=StatusKehadiran.choices)
    
    # 👇 UBAH FIELD DI BAWAH INI
    # Dari CharField menjadi TextField untuk alasan yang lebih panjang
    keterangan = models.TextField(_("Keterangan"), blank=True, help_text="Alasan untuk izin atau sakit")

    # 👇 TAMBAHKAN FIELD BARU DI BAWAH INI
    surat_dokter = models.FileField(_("Surat Dokter"), upload_to='surat_dokter/', blank=True, null=True, help_text="Upload surat dokter jika status sakit")


    class Meta:
        verbose_name = "Absensi"
        verbose_name_plural = "Data Absensi"
        unique_together = ('profil', 'tanggal') # Satu absensi per hari untuk setiap peserta
        ordering = ['-tanggal']

    # 👇 Saya tambahkan __str__ untuk representasi objek yang lebih baik di admin (Opsional tapi direkomendasikan)
    def __str__(self):
        return f"{self.profil.user.nama_lengkap} - {self.tanggal} ({self.get_status_kehadiran_display()})"


class Laporan(models.Model):
    """ Mengelola pengumpulan laporan (harian/akhir) dari peserta. """
    class StatusReview(models.TextChoices):
        BARU = "BARU", "Baru"
        DIREVIEW = "DIREVIEW", "Direview"
        DITERIMA = "DITERIMA", "Diterima"
        DITOLAK = "DITOLAK", "Ditolak"

    profil = models.ForeignKey(PesertaProfile, on_delete=models.CASCADE, related_name='laporan')
    judul = models.CharField(_("Judul Laporan"), max_length=255)
    
    deskripsi = models.TextField(
        _("Deskripsi/Ringkasan Laporan"), 
        help_text="Ringkasan singkat mengenai isi laporan.",
        blank=True  # <-- Tambahkan ini untuk mengizinkan field kosong di form
    )
    
    file = models.FileField(_("File Laporan"), upload_to='laporan_peserta/')
    status_review = models.CharField(_("Status Review"), max_length=50, choices=StatusReview.choices, default=StatusReview.BARU)
    feedback_admin = models.TextField(_("Feedback dari Admin"), blank=True)
    disubmit_pada = models.DateTimeField(_("Tanggal Submit"), auto_now_add=True)

    class Meta:
        verbose_name = "Laporan Peserta"
        verbose_name_plural = "Laporan Peserta"
        ordering = ['-disubmit_pada']

    # 👇 Saya tambahkan __str__ untuk representasi objek yang lebih baik (Opsional)
    def __str__(self):
        return f"Laporan '{self.judul}' oleh {self.profil.user.nama_lengkap}"


class Sertifikat(models.Model):
    """ Mengelola sertifikat yang diterbitkan untuk peserta yang telah lulus. """
    
    # TAMBAHKAN ENUM UNTUK TEMPLATE
    class TemplateType(models.TextChoices):
        PELAJAR = "PELAJAR", "Template Pelajar/Mahasiswa"
        UMUM = "UMUM", "Template Umum/Dinas"

    profil = models.OneToOneField(PesertaProfile, on_delete=models.CASCADE, related_name='sertifikat')
    nomor_sertifikat = models.CharField(_("Nomor Sertifikat"), max_length=100, unique=True)
    file_sertifikat = models.FileField(_("File Sertifikat"), upload_to='sertifikat/')
    
    # UBAH FIELD INI
    tanggal_terbit = models.DateField(_("Tanggal Terbit"), auto_now_add=True)
    
    nilai_akhir = models.DecimalField(_("Nilai Akhir"), max_digits=5, decimal_places=2, null=True, blank=True)
    
    # TAMBAHKAN FIELD BARU INI
    template_digunakan = models.CharField(
        _("Template yang Digunakan"),
        max_length=20,
        choices=TemplateType.choices,
        blank=True # Akan diisi otomatis oleh sistem
    )

    class Meta:
        verbose_name = "Sertifikat"
        verbose_name_plural = "Sertifikat"
        # TAMBAHKAN ORDERING
        ordering = ['-tanggal_terbit']

    def __str__(self):
        # Sedikit perbaikan untuk mencegah error jika user belum ada nama lengkap
        try:
            nama = self.profil.user.nama_lengkap or self.profil.user.email
            return f"Sertifikat: {self.nomor_sertifikat} - {nama}"
        except (AttributeError, PesertaProfile.DoesNotExist):
            return f"Sertifikat {self.nomor_sertifikat}"