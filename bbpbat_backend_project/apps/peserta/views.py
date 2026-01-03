from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from django.utils import timezone

# Mengimpor model dan serializer dari aplikasi ini
from .models import PesertaProfile, Dokumen, BuktiPembayaran
from apps.pengumuman.models import Pengumuman
from apps.pengumuman.serializers import PengumumanSerializer

from apps.bimbingan.serializers import SertifikatDetailSerializer

from .serializers import (
    PesertaProfileSerializer, 
    PesertaAbsensiSerializer, 
    PengajuanIzinSerializer,
    LaporanPesertaCreateSerializer,
    LaporanPesertaListSerializer,
    AdminBuktiPembayaranSerializer
)
# Mengimpor model dari aplikasi lain
from apps.bimbingan.models import Absensi, Laporan, Sertifikat 
# Mengimpor izin kustom dari aplikasi 'users'
from apps.users.permissions import IsAdminUser, IsPesertaUser


class PesertaAdminViewSet(viewsets.ReadOnlyModelViewSet):
    # ... (Isi viewset ini tidak perlu diubah, biarkan seperti semula)
    permission_classes = [IsAdminUser]
    serializer_class = PesertaProfileSerializer
    def get_queryset(self):
        queryset = PesertaProfile.objects.select_related('user', 'penempatan').all()
        tipe_peserta = self.request.query_params.get('tipe_peserta', None)
        if tipe_peserta:
            queryset = queryset.filter(tipe_peserta=tipe_peserta)
        status_peserta = self.request.query_params.get('status', None)
        if status_peserta:
            status_map = {'active': PesertaProfile.StatusPeserta.AKTIF,'completed': PesertaProfile.StatusPeserta.SELESAI,'graduated': PesertaProfile.StatusPeserta.LULUS,}
            backend_status = status_map.get(status_peserta.lower())
            if backend_status:
                queryset = queryset.filter(status=backend_status)
        return queryset

# ... (Kode PesertaMeAPIView, PesertaMeUpdateAPIView, DokumenUploadAPIView tidak berubah)
class PesertaMeAPIView(generics.RetrieveAPIView):
    serializer_class = PesertaProfileSerializer
    permission_classes = [IsAuthenticated, IsPesertaUser]
    def get_object(self):
        user = self.request.user
        try:
            return PesertaProfile.objects.select_related('user', 'penempatan').get(user=user)
        except PesertaProfile.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Profil peserta tidak ditemukan untuk user ini.")

class PesertaMeUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated, IsPesertaUser]
    
    def patch(self, request):
        user = request.user
        try:
            peserta_profile = PesertaProfile.objects.get(user=user)
        except PesertaProfile.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Profil peserta tidak ditemukan untuk user ini.")
        
        serializer = PesertaProfileSerializer(peserta_profile, data=request.data, partial=True)
        if serializer.is_valid():
            # 1. Simpan dulu data yang diinput oleh peserta (termasuk tanggal rencana)
            peserta_profile = serializer.save()

            # =================================================================
            # LOGIKA "CERDAS" DITAMBAHKAN DI SINI
            # =================================================================
            # 2. Cek jika tanggal resmi belum diisi DAN tanggal rencana sudah diisi
            if not peserta_profile.tanggal_mulai and peserta_profile.rencana_mulai:
                # 2a. Salin tanggal rencana menjadi tanggal resmi
                peserta_profile.tanggal_mulai = peserta_profile.rencana_mulai
                peserta_profile.tanggal_selesai = peserta_profile.rencana_akhir
                
                # 2b. Ubah status peserta menjadi Aktif
                peserta_profile.status = PesertaProfile.StatusPeserta.AKTIF
                
                # 2c. Simpan perubahan penting ini ke database
                peserta_profile.save(update_fields=['tanggal_mulai', 'tanggal_selesai', 'status'])
            # =================================================================

            # 3. Jalankan fungsi update_kelengkapan setelah semua perubahan
            peserta_profile.update_kelengkapan()
            
            # 4. Kirim kembali data profil yang sudah ter-update lengkap
            updated_serializer = PesertaProfileSerializer(peserta_profile)
            return Response(updated_serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        return self.patch(request)

class DokumenUploadAPIView(APIView):
    permission_classes = [IsAuthenticated, IsPesertaUser]
    parser_classes = [MultiPartParser, FormParser]
    def post(self, request, *args, **kwargs):
        user = request.user
        try:
            profil_peserta = PesertaProfile.objects.get(user=user)
        except PesertaProfile.DoesNotExist:
            return Response({"detail": "Profil peserta tidak ditemukan."}, status=status.HTTP_404_NOT_FOUND)
        jenis_dokumen = request.data.get('jenis_dokumen')
        file_obj = request.data.get('file')
        if not jenis_dokumen or not file_obj:
            return Response({"detail": "Kedua field 'jenis_dokumen' dan 'file' wajib diisi."}, status=status.HTTP_400_BAD_REQUEST)
        dokumen, created = Dokumen.objects.update_or_create(profil=profil_peserta, jenis_dokumen=jenis_dokumen, defaults={'file': file_obj})
        profil_peserta.refresh_from_db()
        serializer = PesertaProfileSerializer(profil_peserta)
        return Response(serializer.data, status=status.HTTP_200_OK)


# 👇 2. TAMBAHKAN VIEW BARU DI SINI
# =======================================================================
#             VIEW UNTUK ABSENSI PESERTA (GET & POST)
# =======================================================================
class PesertaAbsensiView(APIView):
    """
    Mengelola absensi untuk peserta yang sedang login.
    - GET: Mengambil seluruh riwayat absensi.
    - POST: Melakukan check-in (absen masuk) untuk hari ini.
    """
    permission_classes = [IsAuthenticated, IsPesertaUser]

    def get_profil(self, user):
        """Fungsi helper untuk mendapatkan profil peserta."""
        try:
            return PesertaProfile.objects.get(user=user)
        except PesertaProfile.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Profil peserta tidak ditemukan.")

    def get(self, request, *args, **kwargs):
        """Mengembalikan riwayat absensi untuk peserta saat ini."""
        profil_peserta = self.get_profil(request.user)
        
        riwayat_absensi = Absensi.objects.filter(
            profil=profil_peserta
        ).order_by('-tanggal')
        
        serializer = PesertaAbsensiSerializer(riwayat_absensi, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        """
        Mencatat absensi (check-in atau check-out) untuk peserta.
        Logika cerdas: jika belum check-in, catat jam masuk.
        Jika sudah check-in tapi belum check-out, catat jam keluar.
        """
        profil_peserta = self.get_profil(request.user)
        hari_ini = timezone.now().date()
        jam_sekarang = timezone.now().time()

        absensi_hari_ini, created = Absensi.objects.get_or_create(
            profil=profil_peserta,
            tanggal=hari_ini,
            defaults={'status_kehadiran': Absensi.StatusKehadiran.ALPHA} # Default-kan Alpha jika dibuat
        )

        # Kasus 1: Check-in (jam masuk belum ada)
        if not absensi_hari_ini.jam_masuk:
            absensi_hari_ini.status_kehadiran = Absensi.StatusKehadiran.HADIR
            absensi_hari_ini.jam_masuk = jam_sekarang
            absensi_hari_ini.save()
            message = f"Absen masuk berhasil dicatat pada pukul {jam_sekarang.strftime('%H:%M')}."
            status_code = status.HTTP_201_CREATED

        # Kasus 2: Check-out (jam masuk sudah ada, jam keluar belum)
        elif not absensi_hari_ini.jam_keluar:
            absensi_hari_ini.jam_keluar = jam_sekarang
            absensi_hari_ini.save()
            message = f"Absen keluar berhasil dicatat pada pukul {jam_sekarang.strftime('%H:%M')}."
            status_code = status.HTTP_200_OK

        # Kasus 3: Sudah lengkap (check-in & check-out sudah ada)
        else:
            return Response(
                {"detail": "Anda sudah menyelesaikan absensi hari ini (masuk dan keluar)."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = PesertaAbsensiSerializer(absensi_hari_ini)
        return Response({
            "detail": message,
            "data": serializer.data
        }, status=status_code)
        
# 👇 2. TAMBAHKAN VIEW BARU DI SINI
# =======================================================================
#           VIEW UNTUK PENGAJUAN IZIN / SAKIT
# =======================================================================
class AjukanIzinView(APIView):
    """
    View untuk peserta mengajukan izin atau sakit.
    Menerima data form termasuk file upload.
    """
    permission_classes = [IsAuthenticated, IsPesertaUser]
    parser_classes = [MultiPartParser, FormParser] # Wajib untuk handle file upload

    def post(self, request, *args, **kwargs):
        # 1. Dapatkan profil peserta yang sedang login
        profil_peserta = get_object_or_404(PesertaProfile, user=request.user)
        
        # 2. Cek apakah sudah ada absensi pada tanggal yang diajukan untuk mencegah duplikasi
        tanggal_pengajuan = request.data.get('tanggal')
        if tanggal_pengajuan and Absensi.objects.filter(profil=profil_peserta, tanggal=tanggal_pengajuan).exists():
            return Response(
                {"detail": "Anda sudah memiliki catatan absensi pada tanggal tersebut."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Validasi data yang masuk menggunakan serializer yang kita buat
        serializer = PengajuanIzinSerializer(data=request.data)
        if serializer.is_valid():
            # 4. Jika valid, simpan ke database dengan menambahkan profil peserta
            # Jam masuk & keluar akan otomatis NULL sesuai definisi model
            serializer.save(profil=profil_peserta)
            return Response({"detail": "Pengajuan izin/sakit berhasil dikirim."}, status=status.HTTP_201_CREATED)
        
        # 5. Jika tidak valid, kembalikan error dari serializer
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# =======================================================================
#           VIEW UNTUK FITUR LAPORAN PESERTA
# =======================================================================
class LaporanPesertaView(APIView):
    """
    Mengelola laporan untuk peserta yang sedang login.
    - GET: Menampilkan daftar laporan yang sudah di-upload.
    - POST: Meng-upload laporan baru.
    """
    permission_classes = [IsAuthenticated, IsPesertaUser]
    # Parser untuk menangani file upload dari form
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, *args, **kwargs):
        """Mengembalikan daftar laporan milik peserta yang sedang login."""
        profil_peserta = get_object_or_404(PesertaProfile, user=request.user)
        
        laporan_peserta = Laporan.objects.filter(profil=profil_peserta).order_by('-disubmit_pada')
        
        # Gunakan serializer 'List' untuk menampilkan data
        serializer = LaporanPesertaListSerializer(laporan_peserta, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        """Membuat (meng-upload) laporan baru."""
        profil_peserta = get_object_or_404(PesertaProfile, user=request.user)
        
        # Gunakan serializer 'Create' untuk validasi data yang masuk
        serializer = LaporanPesertaCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Jika valid, simpan dengan menyertakan profil peserta
            serializer.save(profil=profil_peserta)
            return Response({"detail": "Laporan berhasil diunggah."}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# =======================================================================
#           VIEW UNTUK DATA DASHBOARD PESERTA
# =======================================================================
class PesertaDashboardView(APIView):
    """
    Menyediakan data ringkasan yang terstruktur dan KONTEKSTUAL 
    untuk dashboard peserta.
    """
    permission_classes = [IsAuthenticated, IsPesertaUser]

    def get(self, request, *args, **kwargs):
        profil_peserta = get_object_or_404(PesertaProfile, user=request.user)
        
        hari_ini = timezone.now().date()

        # 1. Total Kehadiran (tidak berubah)
        total_hadir = Absensi.objects.filter(
            profil=profil_peserta, 
            status_kehadiran='HADIR'
        ).count()

        # 2. Status Laporan (tidak berubah)
        laporan_terakhir = Laporan.objects.filter(profil=profil_peserta).order_by('-disubmit_pada').first()
        laporan_status = {
            'sudah_diunggah': bool(laporan_terakhir),
            'tanggal_unggah': laporan_terakhir.disubmit_pada if laporan_terakhir else None,
            'file_url': request.build_absolute_uri(laporan_terakhir.file.url) if laporan_terakhir and laporan_terakhir.file else None,
        }

        # 3. Ketersediaan Sertifikat (tidak berubah)
        sertifikat_tersedia = Sertifikat.objects.filter(profil=profil_peserta).exists()

        # 4. Data Pembimbing (tidak berubah)
        pembimbing_data = None
        if profil_peserta.nama_pembimbing:
            pembimbing_data = {
                'nama_lengkap': profil_peserta.nama_pembimbing,
                'jabatan': 'Pembimbing Institusi',
                'email': profil_peserta.email_pembimbing or '-',
                'telepon': profil_peserta.no_telepon_pembimbing or '-',
                'foto_url': None
            }

        # 5. Daftar Pengumuman Terbaru (tidak berubah)
        pengumuman_list = Pengumuman.objects.filter(
            status=Pengumuman.Status.PUBLISHED, 
            target_peserta__in=['Semua Peserta', profil_peserta.tipe_peserta]
        ).order_by('-dibuat_pada')[:3]
        pengumuman_terbaru = PengumumanSerializer(pengumuman_list, many=True, context={'request': request}).data

        # ===============================================================
        # PENAMBAHAN LOGIKA BARU UNTUK KONTEKS
        # ===============================================================
        # 6. Ambil data status pembayaran (relevan untuk Umum)
        pembayaran = BuktiPembayaran.objects.filter(profil=profil_peserta).first()
        pembayaran_status = {
            'sudah_diunggah': bool(pembayaran),
            'tanggal_unggah': pembayaran.diunggah_pada if pembayaran else None,
            'status_verifikasi': pembayaran.status_verifikasi if pembayaran else None,
            'file_url': request.build_absolute_uri(pembayaran.file.url) if pembayaran and pembayaran.file else None,
        }
        
        # 7. Logika Progres Waktu
        progres_program = {
            'sisa_hari': 0, 'total_hari': 0, 'persentase_selesai': 100
        }
        if profil_peserta.tanggal_mulai and profil_peserta.tanggal_selesai:
            if hari_ini < profil_peserta.tanggal_selesai:
                sisa_hari = (profil_peserta.tanggal_selesai - hari_ini).days
                progres_program['sisa_hari'] = sisa_hari
            
            total_hari = (profil_peserta.tanggal_selesai - profil_peserta.tanggal_mulai).days
            if total_hari > 0:
                hari_berlalu = (hari_ini - profil_peserta.tanggal_mulai).days
                progres_program['total_hari'] = total_hari
                progres_program['persentase_selesai'] = min(round((hari_berlalu / total_hari) * 100), 100)

        # 8. Susun data akhir
        dashboard_data = {
            'tipe_peserta': profil_peserta.tipe_peserta,
            'total_hadir': total_hadir,
            'progres_program': progres_program,
            'sertifikat_tersedia': sertifikat_tersedia,
            'laporan_status': laporan_status,
            'pembayaran_status': pembayaran_status,
            'pembimbing': pembimbing_data,
            'pengumuman_terbaru': pengumuman_terbaru,
        }

        return Response(dashboard_data)
     
class SertifikatPesertaView(APIView):
    """
    Menyediakan data sertifikat untuk peserta yang sedang login.
    Mengembalikan status yang berbeda tergantung pada kondisi kelayakan.
    """
    permission_classes = [IsAuthenticated, IsPesertaUser]

    def get(self, request, *args, **kwargs):
        profil_peserta = get_object_or_404(PesertaProfile, user=request.user)

        # =================================================================
        # KONDISI 1: Sertifikat sudah diterbitkan. Ini prioritas tertinggi.
        # =================================================================
        # Cek dari objek sertifikat yang berelasi, bukan dari status 'Lulus'
        try:
            sertifikat = Sertifikat.objects.get(profil=profil_peserta)
            serializer = SertifikatDetailSerializer(sertifikat, context={'request': request})
            return Response({
                "status": "DITERBITKAN",
                "message": "Sertifikat Anda telah berhasil diterbitkan.",
                "data": serializer.data
            })
        except Sertifikat.DoesNotExist:
            # Jika sertifikat belum ada, lanjutkan ke pengecekan syarat
            pass

        # =================================================================
        # KONDISI 2 & 3 DIGABUNGKAN: Pengecekan semua syarat kelayakan
        # =================================================================
        
        persyaratan = []
        
        # Syarat 1: Periode bimbingan harus selesai
        periode_selesai = (profil_peserta.status == PesertaProfile.StatusPeserta.SELESAI)
        persyaratan.append({
            "deskripsi": "Menyelesaikan periode bimbingan",
            "terpenuhi": periode_selesai
        })

        # Syarat 2: Bergantung pada tipe peserta
        syarat_kedua_terpenuhi = False
        if profil_peserta.tipe_peserta == PesertaProfile.TipePeserta.PELAJAR:
            laporan_terakhir = Laporan.objects.filter(profil=profil_peserta).order_by('-disubmit_pada').first()
            syarat_kedua_terpenuhi = laporan_terakhir and laporan_terakhir.status_review == Laporan.StatusReview.DITERIMA
            persyaratan.append({
                "deskripsi": "Laporan akhir telah direview dan diterima",
                "terpenuhi": syarat_kedua_terpenuhi
            })
        else: # Tipe UMUM
            pembayaran = BuktiPembayaran.objects.filter(profil=profil_peserta).first()
            # Gunakan nilai dari choices di model untuk konsistensi
            syarat_kedua_terpenuhi = pembayaran and pembayaran.status_verifikasi == 'Telah Diverifikasi'
            persyaratan.append({
                "deskripsi": "Bukti pembayaran telah diverifikasi",
                "terpenuhi": syarat_kedua_terpenuhi
            })

        # =================================================================
        # KEPUTUSAN AKHIR: Berdasarkan semua syarat yang telah diperiksa
        # =================================================================

        if periode_selesai and syarat_kedua_terpenuhi:
            # Jika SEMUA syarat terpenuhi
            return Response({
                "status": "MENUNGGU_PENERBITAN",
                "message": "Selamat, Anda telah memenuhi semua persyaratan! Sertifikat Anda sedang menunggu untuk diterbitkan oleh admin."
            })
        else:
            # Jika salah satu atau kedua syarat belum terpenuhi
            return Response({
                "status": "BELUM_MEMENUHI_SYARAT",
                "message": "Anda belum memenuhi semua syarat untuk mendapatkan sertifikat.",
                "data": {"persyaratan": persyaratan}
            })

# =======================================================================
#   VIEWSET UNTUK MANAJEMEN BUKTI PEMBAYARAN OLEH ADMIN
# =======================================================================
class AdminBuktiPembayaranViewSet(viewsets.ModelViewSet):
    """
    ViewSet untuk admin mengelola bukti pembayaran dari semua peserta.
    - list: Menampilkan semua bukti pembayaran yang butuh verifikasi atau sudah diverifikasi.
    - verifikasi (action): Untuk menyetujui atau menolak bukti pembayaran.
    """
    queryset = BuktiPembayaran.objects.select_related('profil__user').all().order_by('-diunggah_pada')
    serializer_class = AdminBuktiPembayaranSerializer
    permission_classes = [IsAuthenticated, IsAdminUser] # Hanya Admin yang bisa akses
    http_method_names = ['get', 'post', 'head', 'options'] # Batasi method yg diizinkan

    def get_queryset(self):
        """Filter berdasarkan status verifikasi jika ada di query params."""
        queryset = super().get_queryset()
        status = self.request.query_params.get('status', None)
        if status:
            # Memungkinkan filter seperti /?status=Menunggu Verifikasi
            queryset = queryset.filter(status_verifikasi=status)
        return queryset

    @action(detail=True, methods=['post'], url_path='verifikasi')
    def verifikasi(self, request, pk=None):
        """
        Action kustom untuk memverifikasi (menerima/menolak) pembayaran.
        Contoh data body: { "status": "Telah Diverifikasi", "catatan": "Pembayaran valid." }
        """
        pembayaran = self.get_object()
        
        status_baru = request.data.get('status')
        catatan = request.data.get('catatan', '') # Catatan bersifat opsional

        # Validasi input status
        valid_statuses = [choice[0] for choice in BuktiPembayaran.STATUS_VERIFIKASI_CHOICES]
        if status_baru not in valid_statuses:
            return Response(
                {"detail": f"Status tidak valid. Gunakan salah satu dari: {', '.join(valid_statuses)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update status dan catatan
        pembayaran.status_verifikasi = status_baru
        pembayaran.catatan_admin = catatan
        pembayaran.save()

        #
        # Di sini Anda bisa menambahkan logika notifikasi email jika diperlukan
        #

        serializer = self.get_serializer(pembayaran)
        return Response({
            "detail": f"Status pembayaran berhasil diubah menjadi '{status_baru}'.",
            "data": serializer.data
        })
        
# =======================================================================
#   VIEW UNTUK PESERTA MENGELOLA BUKTI PEMBAYARANNYA
# =======================================================================
class PesertaPembayaranView(APIView):
    """
    Mengelola bukti pembayaran untuk peserta yang login.
    - GET: Mengambil data pembayaran saat ini (jika ada).
    - POST: Mengunggah atau mengganti bukti pembayaran.
    """
    permission_classes = [IsAuthenticated, IsPesertaUser]
    parser_classes = [MultiPartParser, FormParser] # Wajib untuk file upload

    def get(self, request, *args, **kwargs):
        """Mengembalikan detail bukti pembayaran peserta saat ini."""
        profil_peserta = get_object_or_404(PesertaProfile, user=request.user)
        try:
            pembayaran = profil_peserta.pembayaran
            # Gunakan serializer admin agar datanya konsisten
            serializer = AdminBuktiPembayaranSerializer(pembayaran, context={'request': request})
            return Response(serializer.data)
        except BuktiPembayaran.DoesNotExist:
            return Response(None, status=status.HTTP_200_OK) # Kirim null jika belum ada

    def post(self, request, *args, **kwargs):
        """Membuat atau memperbarui bukti pembayaran."""
        profil_peserta = get_object_or_404(PesertaProfile, user=request.user)
        
        uploaded_file = request.data.get('file')
        
        if not uploaded_file:
            return Response(
                {"detail": "File bukti pembayaran wajib diunggah."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Kode ini sekarang akan berjalan tanpa error
        pembayaran, created = BuktiPembayaran.objects.update_or_create(
            profil=profil_peserta,
            defaults={
                'file': uploaded_file,
                'status_verifikasi': 'Menunggu Verifikasi',
                'catatan_admin': '' # Reset catatan saat upload ulang
            }
        )
        
        serializer = AdminBuktiPembayaranSerializer(pembayaran, context={'request': request})
        response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(serializer.data, status=response_status)