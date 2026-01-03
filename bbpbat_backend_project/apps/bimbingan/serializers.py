# File: bbpbat_backend_project/apps/bimbingan/serializers.py

from rest_framework import serializers
from .models import Penempatan, Pendaftaran, Absensi, Laporan, Sertifikat
from apps.peserta.models import PesertaProfile


# --- SERIALIZER UNTUK PUBLIK ---

class PenempatanSerializer(serializers.ModelSerializer):
    sisa_kuota_pelajar = serializers.SerializerMethodField()
    sisa_kuota_umum = serializers.SerializerMethodField()

    class Meta:
        model = Penempatan
        fields = [
            'id', 'nama', 'deskripsi', 'kuota_pelajar', 
            'sisa_kuota_pelajar', 'kuota_umum', 'sisa_kuota_umum'
        ]

    def get_sisa_kuota_pelajar(self, obj):
        # ... (implementasi ada)
        pendaftar_count = Pendaftaran.objects.filter(
            pilihan_penempatan=obj, tipe_peserta='PELAJAR', status__in=['PENDING', 'DISETUJUI']
        ).count()
        return obj.kuota_pelajar - pendaftar_count

    def get_sisa_kuota_umum(self, obj):
        # ... (implementasi ada)
        pendaftar_count = Pendaftaran.objects.filter(
            pilihan_penempatan=obj, tipe_peserta='UMUM', status__in=['PENDING', 'DISETUJUI']
        ).count()
        return obj.kuota_umum - pendaftar_count


class PendaftaranCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pendaftaran
        fields = [
            'email', 'nama_lengkap', 'tipe_peserta', 'nama_institusi',
            'no_telepon', 'nama_pembimbing', 'no_telepon_pembimbing', 'email_pembimbing',  
            'pilihan_penempatan', 'surat_pengajuan'
        ]

    def validate_pilihan_penempatan(self, value):
        # ... (implementasi ada)
        tipe_peserta = self.initial_data.get('tipe_peserta')
        
        if tipe_peserta == 'PELAJAR':
            pendaftar_count = Pendaftaran.objects.filter(
                pilihan_penempatan=value, tipe_peserta='PELAJAR', status__in=['PENDING', 'DISETUJUI']
            ).count()
            if pendaftar_count >= value.kuota_pelajar:
                raise serializers.ValidationError("Kuota untuk pelajar di unit penempatan ini sudah penuh.")
        
        elif tipe_peserta == 'UMUM':
            pendaftar_count = Pendaftaran.objects.filter(
                pilihan_penempatan=value, tipe_peserta='UMUM', status__in=['PENDING', 'DISETUJUI']
            ).count()
            if pendaftar_count >= value.kuota_umum:
                raise serializers.ValidationError("Kuota untuk umum di unit penempatan ini sudah penuh.")

        return value


# --- SERIALIZER UNTUK KEBUTUHAN ADMIN ---

class PendaftaranAdminSerializer(serializers.ModelSerializer):
    pilihan_penempatan = serializers.StringRelatedField()
    status = serializers.CharField(source='get_status_display')
    tipe_peserta = serializers.CharField(source='get_tipe_peserta_display')

    class Meta:
        model = Pendaftaran
        fields = [
            'id', 'email', 'nama_lengkap', 'tipe_peserta', 'nama_institusi',
            'no_telepon', 'nama_pembimbing', 'no_telepon_pembimbing', 'email_pembimbing',
            'pilihan_penempatan', 'surat_pengajuan', 'status',
            'tanggal_daftar'
        ]

# =================================================================
#               SERIALIZER UNTUK MANAJEMEN ABSENSI
# =================================================================

class AbsensiSerializer(serializers.ModelSerializer):
    """
    Serializer untuk menampilkan data absensi secara lengkap kepada Admin.
    Menggabungkan data dari model Absensi dan PesertaProfile.
    """
    # Mengambil data dari relasi (ForeignKey) menggunakan notasi 'source'.
    # DRF akan secara otomatis menelusuri relasi: obj.profil.user.nama_lengkap
    nama = serializers.CharField(source='profil.user.nama_lengkap', read_only=True)
    instansi = serializers.CharField(source='profil.nama_institusi', read_only=True)
    penempatan = serializers.CharField(source='profil.penempatan.nama', read_only=True)

    # Mengganti nama field agar sesuai dengan frontend (checkIn, checkOut, status)
    checkIn = serializers.TimeField(source='jam_masuk', required=False, format='%H:%M', allow_null=True)
    checkOut = serializers.TimeField(source='jam_keluar', required=False, format='%H:%M', allow_null=True)
    
    # Frontend mengharapkan status dalam huruf kecil (e.g., 'hadir')
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = Absensi
        # Daftar field yang akan dikirim ke frontend, sesuai permintaan Anda.
        fields = [
            'id',
            'nama',
            'instansi',
            'penempatan',
            'checkIn',
            'checkOut',
            'status',
            'keterangan',
        ]
        
    def get_status(self, obj):
      # obj adalah instance Absensi. obj.status_kehadiran berisi 'HADIR', 'SAKIT', dll.
      # Kita ubah menjadi huruf kecil agar sesuai dengan helper di frontend.
      return obj.status_kehadiran.lower() if obj.status_kehadiran else None
  
# =================================================================
#                 SERIALIZER UNTUK MANAJEMEN LAPORAN
# =================================================================

class LaporanAdminSerializer(serializers.ModelSerializer):
    """
    Serializer untuk MENAMPILKAN daftar laporan kepada Admin.
    Kaya akan data relasi untuk ditampilkan di tabel.
    """
    # Mengambil data dari relasi (read-only)
    nama = serializers.CharField(source='profil.user.nama_lengkap', read_only=True)
    instansi = serializers.CharField(source='profil.nama_institusi', read_only=True)
    penempatan = serializers.CharField(source='profil.penempatan.nama', read_only=True)
    
    # Mengganti nama field agar konsisten dengan frontend
    tanggalSubmit = serializers.DateTimeField(source='disubmit_pada', format='%Y-%m-%d', read_only=True)
    filename = serializers.CharField(source='file.name', read_only=True)
    fileUrl = serializers.URLField(source='file.url', read_only=True)
    
    # Mengubah status menjadi huruf kecil
    status = serializers.CharField(source='get_status_review_display', read_only=True)

    class Meta:
        model = Laporan
        fields = [
            'id',
            'nama',
            'instansi',
            'penempatan',
            'judul',
            'deskripsi',
            'tanggalSubmit',
            'status',
            'filename',
            'fileUrl', # Menambahkan URL agar bisa diunduh
            'feedback_admin',
        ]

    def to_representation(self, instance):
        """Ubah output JSON agar status menjadi huruf kecil."""
        ret = super().to_representation(instance)
        # Mengubah nilai status dari "Diterima" -> "diterima"
        if ret.get('status'):
            ret['status'] = ret['status'].lower()
        return ret


class LaporanAdminUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer untuk MEMPERBARUI laporan oleh Admin.
    Hanya berisi field yang boleh diubah oleh admin.
    """
    class Meta:
        model = Laporan
        fields = ['status_review', 'feedback_admin']

    def validate(self, data):
        """
        Aturan bisnis: Jika laporan ditolak, feedback wajib diisi.
        """
        status_review = data.get('status_review')
        feedback_admin = data.get('feedback_admin')

        if status_review == 'DITOLAK' and not feedback_admin:
            raise serializers.ValidationError({
                "feedback_admin": "Feedback wajib diisi jika laporan ditolak."
            })
        return data
    
class PesertaSertifikatSerializer(serializers.ModelSerializer):
    """
    Serializer untuk menampilkan daftar peserta yang memenuhi syarat untuk mendapatkan sertifikat.
    """
    nama = serializers.CharField(source='user.nama_lengkap', read_only=True)
    institusi = serializers.CharField(source='nama_institusi', read_only=True)
    
    # TAMBAHKAN FIELD-FIELD INI UNTUK MENDUKUNG UI
    penempatan = serializers.CharField(source='penempatan.nama', read_only=True, default='N/A')
    tanggal_mulai = serializers.DateField()
    tanggal_selesai = serializers.DateField()

    class Meta:
        model = PesertaProfile
        fields = [
            'id', 
            'nama', 
            'institusi',
            'tipe_peserta', # Dibutuhkan untuk filter tab di frontend
            'penempatan',
            'tanggal_mulai',
            'tanggal_selesai',
        ]

class SertifikatDetailSerializer(serializers.ModelSerializer):
    """
    Serializer untuk menampilkan detail sertifikat yang sudah dibuat sebagai respons API.
    """
    peserta = PesertaSertifikatSerializer(source='profil', read_only=True)
    file_url = serializers.URLField(source='file_sertifikat.url', read_only=True)
    
    class Meta:
        model = Sertifikat
        fields = [
            'id', 
            'nomor_sertifikat', 
            'file_sertifikat', # Nama file
            'file_url',        # URL untuk download
            'tanggal_terbit', 
            'nilai_akhir', 
            'template_digunakan', 
            'peserta'
        ]
        
# =================================================================
# ===== TAMBAHKAN DUA SERIALIZER BARU DI BAWAH INI UNTUK KUOTA ====
# =================================================================

class PenempatanAdminSerializer(serializers.ModelSerializer):
    """
    Serializer untuk MENAMPILKAN data kuota kepada Admin.
    Diperkaya dengan data kuota yang terisi untuk progress bar di UI.
    """
    kuota_pelajar_terisi = serializers.SerializerMethodField()
    kuota_umum_terisi = serializers.SerializerMethodField()

    class Meta:
        model = Penempatan
        fields = [
            'id',
            'nama',
            'deskripsi',
            'kuota_pelajar',
            'kuota_pelajar_terisi',
            'kuota_umum',
            'kuota_umum_terisi',
        ]

    def get_kuota_pelajar_terisi(self, obj):
        """ Menghitung pendaftar Pelajar yang sudah diterima atau masih pending. """
        return Pendaftaran.objects.filter(
            pilihan_penempatan=obj,
            tipe_peserta='PELAJAR',
            status__in=[Pendaftaran.Status.PENDING, Pendaftaran.Status.DISETUJUI]
        ).count()

    def get_kuota_umum_terisi(self, obj):
        """ Menghitung pendaftar Umum yang sudah diterima atau masih pending. """
        return Pendaftaran.objects.filter(
            pilihan_penempatan=obj,
            tipe_peserta='UMUM',
            status__in=[Pendaftaran.Status.PENDING, Pendaftaran.Status.DISETUJUI]
        ).count()


class PenempatanUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer untuk MENGUBAH data kuota oleh Admin.
    Hanya mengizinkan perubahan pada field kuota saja.
    """
    class Meta:
        model = Penempatan
        fields = ['kuota_pelajar', 'kuota_umum']

    def validate_kuota_pelajar(self, value):
        if value < 0:
            raise serializers.ValidationError("Kuota tidak boleh bernilai negatif.")
        return value

    def validate_kuota_umum(self, value):
        if value < 0:
            raise serializers.ValidationError("Kuota tidak boleh bernilai negatif.")
        return value