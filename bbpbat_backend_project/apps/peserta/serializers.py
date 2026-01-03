from rest_framework import serializers

# 1. Import model 'Absensi' dari aplikasi bimbingan
from apps.bimbingan.models import Absensi, Laporan
# Mengimpor model dari aplikasi ini
from .models import PesertaProfile, Dokumen, BuktiPembayaran

# Mengimpor serializer dari aplikasi 'users' untuk data pengguna
from apps.users.serializers import UserSerializer


from apps.users.serializers import UserSerializer

class DokumenSerializer(serializers.ModelSerializer):
    """
    Serializer untuk Dokumen. Mengubah status verifikasi ke format yang mudah dibaca frontend.
    """
    # --- PERBAIKAN 1: Gunakan SerializerMethodField ---
    # Ini memungkinkan kita untuk membuat logika kustom untuk sebuah field.
    status_verifikasi = serializers.SerializerMethodField()
    catatan_verifikasi = serializers.CharField(read_only=True) # Pastikan field ini ada

    class Meta:
        model = Dokumen
        # Tambahkan 'catatan_verifikasi' ke dalam fields
        fields = ['id', 'jenis_dokumen', 'file', 'diunggah_pada', 'status_verifikasi', 'catatan_verifikasi']

    def get_status_verifikasi(self, obj):
        """
        Fungsi ini mengubah nilai status dari database (misal: "Telah Diverifikasi")
        menjadi KEY yang konsisten untuk frontend (misal: "DITERIMA").
        """
        if obj.status_verifikasi == 'Telah Diverifikasi':
            return 'DITERIMA'
        elif obj.status_verifikasi == 'Ditolak':
            return 'DITOLAK'
        # Semua nilai lain, termasuk "Menunggu Verifikasi", akan menjadi "MENUNGGU"
        return 'MENUNGGU'


class BuktiPembayaranSerializer(serializers.ModelSerializer):
    """
    Serializer untuk Bukti Pembayaran. Juga mengubah status verifikasi.
    """
    # Terapkan perbaikan yang sama di sini agar konsisten
    status_verifikasi = serializers.SerializerMethodField()

    class Meta:
        model = BuktiPembayaran
        fields = ['id', 'file', 'diunggah_pada', 'status_verifikasi', 'catatan_admin']

    def get_status_verifikasi(self, obj):
        if obj.status_verifikasi == 'Telah Diverifikasi':
            return 'DITERIMA'
        elif obj.status_verifikasi == 'Ditolak':
            return 'DITOLAK'
        return 'MENUNGGU'


class PesertaProfileSerializer(serializers.ModelSerializer):
    """
    Serializer untuk menampilkan data profil peserta secara lengkap.
    Ini menggabungkan data dari model User dan PesertaProfile.
    """
    # ... (Isi serializer ini tidak perlu diubah, biarkan seperti semula)
    user = UserSerializer(read_only=True)
    tipe_peserta = serializers.CharField(source='get_tipe_peserta_display')
    status = serializers.CharField(source='get_status_display')
    penempatan = serializers.StringRelatedField()
    dokumen = DokumenSerializer(many=True, read_only=True)
    pembayaran = BuktiPembayaranSerializer(read_only=True)

    class Meta:
        model = PesertaProfile
        fields = [
            'id', 'user', 'tipe_peserta', 'alamat', 'no_telepon', 'tempat_lahir',
            'tanggal_lahir', 'nama_institusi', 'profil_lengkap', 'dokumen_lengkap',
            'dokumen', 'pembayaran', 'status', 'penempatan', 'tanggal_mulai',
            'tanggal_selesai', 'nama_lengkap', 'email', 'alamat_institusi',
            'email_institusi', 'nomor_induk', 'no_telepon_institusi',
            'nama_pembimbing', 'no_telepon_pembimbing', 'email_pembimbing',
            'rencana_mulai', 'rencana_akhir', 'penempatan_pkl', 'golongan_darah',
            'riwayat_penyakit', 'penanganan_khusus', 'nama_orang_tua',
            'no_telepon_orang_tua',
        ]

# 2. TAMBAHKAN SERIALIZER BARU DI SINI
# =================================================================
#             SERIALIZER UNTUK RIWAYAT ABSENSI PESERTA
# =================================================================

class PesertaAbsensiSerializer(serializers.ModelSerializer):
    """
    Serializer untuk menampilkan riwayat absensi milik peserta yang sedang login.
    Didesain untuk digunakan oleh kalender di dashboard peserta.
    """
    # Frontend mengharapkan 'status' dalam huruf kecil untuk pewarnaan
    status = serializers.CharField(source='get_status_kehadiran_display')

    class Meta:
        model = Absensi
        # Field yang dibutuhkan oleh halaman absensi peserta
        fields = [
            'id',
            'tanggal',
            'status',
            'jam_masuk',
            'jam_keluar',
            'keterangan',
        ]

    # Override representasi untuk mengubah format status
    def to_representation(self, instance):
        """Ubah output JSON agar sesuai dengan frontend."""
        # Panggil implementasi default dulu
        ret = super().to_representation(instance)
        # Ubah nilai 'status' menjadi huruf kecil (e.g., "Hadir" -> "hadir")
        ret['status'] = ret['status'].lower()
        return ret
    
# =================================================================
#           SERIALIZER UNTUK MENGAJUKAN IZIN/SAKIT
# =================================================================
class PengajuanIzinSerializer(serializers.ModelSerializer):
    """
    Serializer untuk memvalidasi data pengajuan izin/sakit dari peserta.
    Digunakan untuk 'write' operation.
    """
    # Kita perlu eksplisit mendefinisikan status_kehadiran untuk validasi
    status_kehadiran = serializers.ChoiceField(choices=Absensi.StatusKehadiran.choices)

    class Meta:
        model = Absensi
        # Field yang dikirim dari form frontend
        fields = [
            'tanggal', 
            'status_kehadiran', 
            'keterangan', 
            'surat_dokter'
        ]

    def validate(self, data):
        """Validasi kustom untuk data pengajuan."""
        
        # 1. Memastikan status yang diajukan hanya Izin atau Sakit
        status = data.get('status_kehadiran')
        if status not in ['IZIN', 'SAKIT']:
            raise serializers.ValidationError(
                {"status_kehadiran": "Status pengajuan harus 'IZIN' atau 'SAKIT'."}
            )

        # 2. Memastikan keterangan diisi
        if not data.get('keterangan'):
            raise serializers.ValidationError(
                {"keterangan": "Keterangan wajib diisi untuk pengajuan izin atau sakit."}
            )
            
        # 3. (Opsional) Validasi jika status SAKIT, surat_dokter wajib ada.
        #    Untuk saat ini kita biarkan opsional.
        # if status == 'SAKIT' and not data.get('surat_dokter'):
        #     raise serializers.ValidationError(
        #         {"surat_dokter": "Surat dokter wajib diunggah untuk pengajuan sakit."}
        #     )

        return data
    
# =================================================================
#           SERIALIZER UNTUK FITUR LAPORAN PESERTA
# =================================================================

class LaporanPesertaCreateSerializer(serializers.ModelSerializer):
    """
    Serializer untuk UPLOAD laporan baru oleh peserta.
    Hanya berisi field yang dibutuhkan saat membuat.
    """
    class Meta:
        model = Laporan
        fields = ['judul', 'deskripsi', 'file']

    def validate(self, data):
        """Validasi dasar untuk memastikan semua field diisi."""
        if not data.get('judul'):
            raise serializers.ValidationError({"judul": "Judul laporan wajib diisi."})
        if not data.get('deskripsi'):
            raise serializers.ValidationError({"deskripsi": "Deskripsi laporan wajib diisi."})
        if not data.get('file'):
            raise serializers.ValidationError({"file": "File laporan wajib diunggah."})
        return data


class LaporanPesertaListSerializer(serializers.ModelSerializer):
    """
    Serializer untuk MENAMPILKAN riwayat laporan kepada peserta.
    """
    status = serializers.CharField(source='get_status_review_display')
    fileUrl = serializers.URLField(source='file.url', read_only=True)
    filename = serializers.CharField(source='file.name', read_only=True)
    tanggalSubmit = serializers.DateTimeField(source='disubmit_pada', format='%Y-%m-%d')

    class Meta:
        model = Laporan
        fields = [
            'id',
            'judul',
            'deskripsi',
            'tanggalSubmit',
            'status',
            'feedback_admin',
            'fileUrl',
            'filename'
        ]
    
    def to_representation(self, instance):
        """Ubah output JSON agar status menjadi huruf kecil."""
        ret = super().to_representation(instance)
        if ret.get('status'):
            ret['status'] = ret['status'].lower()
        return ret

# =======================================================================
#   SERIALIZER UNTUK HALAMAN MANAJEMEN PEMBAYARAN ADMIN
# =======================================================================
class AdminPesertaInfoSerializer(serializers.ModelSerializer):
    """Serializer simpel untuk menampilkan info peserta di nested view."""
    # Mengambil nama lengkap dari relasi 'user'
    nama_lengkap = serializers.CharField(source='user.nama_lengkap', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = PesertaProfile
        fields = ['id', 'nama_lengkap', 'email', 'tipe_peserta']

class AdminBuktiPembayaranSerializer(serializers.ModelSerializer):
    """
    Serializer untuk menampilkan daftar bukti pembayaran di halaman admin.
    Ini menyertakan detail dari peserta terkait.
    """
    # Nested serializer untuk menampilkan detail peserta
    profil = AdminPesertaInfoSerializer(read_only=True)

    class Meta:
        model = BuktiPembayaran
        fields = [
            'id', 
            'profil', 
            'file', 
            'diunggah_pada', 
            'status_verifikasi',
            'catatan_admin'
        ]
        read_only_fields = ['id', 'profil', 'file', 'diunggah_pada']

class BuktiPembayaranCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuktiPembayaran
        fields = ['file'] # Hanya menerima field file