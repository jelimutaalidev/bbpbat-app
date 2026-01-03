# apps/peserta/models.py

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

class PesertaProfile(models.Model):
    # --- Field kelengkapan profil tambahan ---
    nomor_induk = models.CharField("Nomor Induk Mahasiswa/Siswa", max_length=100, blank=True)
    no_telepon_institusi = models.CharField("No. Telepon Institusi", max_length=30, blank=True)
    nama_pembimbing = models.CharField("Nama Pembimbing", max_length=255, blank=True)
    no_telepon_pembimbing = models.CharField("No. Telepon Pembimbing", max_length=30, blank=True)
    email_pembimbing = models.EmailField("Email Pembimbing", max_length=255, blank=True)
    nama_lengkap = models.CharField("Nama Lengkap", max_length=255, blank=True)
    email = models.EmailField("Email Pribadi", max_length=255, blank=True)
    alamat_institusi = models.CharField("Alamat Institusi", max_length=255, blank=True)
    email_institusi = models.EmailField("Email Institusi", max_length=255, blank=True)
    rencana_mulai = models.DateField("Rencana Mulai PKL", null=True, blank=True)
    rencana_akhir = models.DateField("Rencana Akhir PKL", null=True, blank=True)
    penempatan_pkl = models.CharField("Penempatan PKL", max_length=255, blank=True)
    golongan_darah = models.CharField("Golongan Darah", max_length=5, blank=True)
    riwayat_penyakit = models.TextField("Riwayat Penyakit", blank=True)
    penanganan_khusus = models.TextField("Penanganan Khusus", blank=True)
    nama_orang_tua = models.CharField("Nama Orang Tua/Wali", max_length=255, blank=True)
    no_telepon_orang_tua = models.CharField("No. Telepon Orang Tua/Wali", max_length=20, blank=True)

    class TipePeserta(models.TextChoices):
        PELAJAR = "PELAJAR", "Pelajar/Mahasiswa"
        UMUM = "UMUM", "Masyarakat Umum/Dinas"

    class StatusPeserta(models.TextChoices):
        AKTIF = "AKTIF", "Aktif"
        SELESAI = "SELESAI", "Selesai"
        LULUS = "LULUS", "Lulus"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profil_peserta"
    )
    tipe_peserta = models.CharField(
        _("Tipe Peserta"),
        max_length=50,
        choices=TipePeserta.choices
    )
    
    # --- Informasi Bimbingan ---
    # Menggunakan referensi string untuk menghindari circular import
    penempatan = models.ForeignKey(
        'bimbingan.Penempatan',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="peserta"
    )
    tanggal_mulai = models.DateField(_("Tanggal Mulai"), null=True, blank=True)
    tanggal_selesai = models.DateField(_("Tanggal Selesai"), null=True, blank=True)
    status = models.CharField(
        _("Status Peserta"),
        max_length=50,
        choices=StatusPeserta.choices,
        default=StatusPeserta.AKTIF
    )
    
    # --- Informasi Pribadi ---
    alamat = models.TextField(_("Alamat Lengkap"), blank=True)
    no_telepon = models.CharField(_("No. Telepon/WA"), max_length=20, blank=True)
    tempat_lahir = models.CharField(_("Tempat Lahir"), max_length=100, blank=True)
    tanggal_lahir = models.DateField(_("Tanggal Lahir"), null=True, blank=True)
    
    # --- Informasi Institusi ---
    nama_institusi = models.CharField(_("Nama Institusi"), max_length=255)
    
    # --- Status Kelengkapan ---
    profil_lengkap = models.BooleanField(default=False)
    dokumen_lengkap = models.BooleanField(default=False)

    def update_kelengkapan(self):
        """
        Memperbarui status kelengkapan profil dan dokumen.
        Dipanggil setiap kali ada perubahan pada Dokumen terkait.
        """
        # Cek kelengkapan profil (logika profil tetap sama)
        field_wajib_profil = [
            self.nama_lengkap, self.email, self.alamat, self.no_telepon, self.tempat_lahir, self.tanggal_lahir,
            self.golongan_darah, self.nama_institusi, self.alamat_institusi, self.email_institusi,
            self.rencana_mulai, self.rencana_akhir, self.penempatan_pkl, self.riwayat_penyakit, self.penanganan_khusus
        ]
        self.profil_lengkap = all(bool(f) for f in field_wajib_profil)

        # =================================================================
        # ==== PERBAIKAN 1: Sesuaikan daftar ID dengan frontend ==========
        # =================================================================
        dokumen_wajib = {
            "ktp", "ktm", "kk", "photo", "proposal", "nilai", "pernyataan"
        }

        # =================================================================
        # ==== PERBAIKAN 2: Sederhanakan logika pengecekan ================
        # =================================================================
        dokumen_terupload = set(self.dokumen.values_list('jenis_dokumen', flat=True))
        
        # Cek apakah semua item di 'dokumen_wajib' ada di dalam 'dokumen_terupload'
        self.dokumen_lengkap = dokumen_wajib.issubset(dokumen_terupload)
        
        # Simpan perubahan tanpa memicu rekursi.
        # Fungsi ini dipanggil dari sinyal/save method lain, jadi cukup update field.
        super().save(update_fields=["profil_lengkap", "dokumen_lengkap"])

    class Meta:
        verbose_name = "Profil Peserta"
        verbose_name_plural = "Profil Peserta"

    def __str__(self):
        # Gunakan self.user.get_full_name() atau field lain yang pasti ada di model User
        try:
            return f"Profil untuk {self.user.nama_lengkap or self.user.username}"
        except AttributeError:
            return f"Profil untuk user ID {self.user.id}"


class Dokumen(models.Model):
    profil = models.ForeignKey(
        PesertaProfile,
        on_delete=models.CASCADE,
        related_name='dokumen'
    )
    jenis_dokumen = models.CharField(max_length=100, help_text="Contoh: ktp, proposal, pernyataan")
    file = models.FileField(upload_to='dokumen_peserta/')
    diunggah_pada = models.DateTimeField(auto_now_add=True)
    status_verifikasi = models.CharField(max_length=50, default="Telah Diverifikasi")

    def save(self, *args, **kwargs):
        """
        Override save untuk memanggil update kelengkapan profil terkait.
        """
        super().save(*args, **kwargs)
        if self.profil:
            self.profil.update_kelengkapan()

    def delete(self, *args, **kwargs):
        """
        Override delete untuk memanggil update kelengkapan profil terkait.
        """
        profil_terkait = self.profil
        super().delete(*args, **kwargs)
        if profil_terkait:
            profil_terkait.update_kelengkapan()

    class Meta:
        verbose_name = "Dokumen Peserta"
        verbose_name_plural = "Dokumen Peserta"
        # Memastikan setiap peserta hanya bisa upload satu jenis dokumen yang sama
        unique_together = ('profil', 'jenis_dokumen')

    def __str__(self):
        try:
            return f"{self.jenis_dokumen} - {self.profil.user.nama_lengkap or self.profil.user.username}"
        except AttributeError:
            return f"{self.jenis_dokumen} - Profil ID {self.profil.id}"

class BuktiPembayaran(models.Model):
    # 1. Definisikan pilihan status sebagai variabel di level Class.
    #    Ini membuatnya bisa diakses dari mana saja (termasuk dari view).
    STATUS_VERIFIKASI_CHOICES = [
        ('Menunggu Verifikasi', 'Menunggu Verifikasi'),
        ('Telah Diverifikasi', 'Telah Diverifikasi'),
        ('Ditolak', 'Ditolak'),
    ]

    profil = models.OneToOneField(
        PesertaProfile,
        on_delete=models.CASCADE,
        related_name='pembayaran',
        # limit_choices_to tetap dipertahankan, ini sudah benar
        limit_choices_to={'tipe_peserta': 'UMUM'}
    )
    file = models.FileField(upload_to='bukti_pembayaran/')
    
    # 2. Terapkan 'choices' ke field status_verifikasi.
    status_verifikasi = models.CharField(
        max_length=50,
        choices=STATUS_VERIFIKASI_CHOICES, # <-- Terapkan choices di sini
        default='Menunggu Verifikasi'
    )
    diunggah_pada = models.DateTimeField(auto_now_add=True)
    catatan_admin = models.TextField(blank=True, null=True, verbose_name="Catatan dari Admin")

    # --- TIDAK ADA PERUBAHAN DI BAWAH INI ---
    class Meta:
        verbose_name = "Bukti Pembayaran"
        verbose_name_plural = "Bukti Pembayaran"

    def __str__(self):
        try:
            return f"Pembayaran untuk {self.profil.user.nama_lengkap or self.profil.user.username}"
        except AttributeError:
            return f"Pembayaran untuk Profil ID {self.profil.id}"
        
