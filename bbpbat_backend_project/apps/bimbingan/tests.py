import os
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Penempatan, Pendaftaran
from apps.peserta.models import PesertaProfile

# Mengambil model User kustom yang sedang aktif
User = get_user_model()

# KELAS TES LAMA UNTUK API PUBLIK (TIDAK DIUBAH)
class BimbinganAPITests(APITestCase):
    """
    Kelompok tes untuk endpoint API publik (pendaftaran).
    """
    def setUp(self):
        self.penempatan1 = Penempatan.objects.create(nama="BIOFLOK NILA", kuota_pelajar=2, kuota_umum=1)
        self.penempatan2 = Penempatan.objects.create(nama="LAB KESEHATAN IKAN", kuota_pelajar=5, kuota_umum=3)

    # ... (tes-tes lama Anda dari 'test_list_penempatan' hingga 'test_create_pendaftaran_quota_full' tetap di sini) ...
    def test_list_penempatan(self):
        url = reverse('daftar-penempatan')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['nama'], 'BIOFLOK NILA')

    def test_sisa_kuota_calculation(self):
        Pendaftaran.objects.create(
            email="pelajar1@test.com", nama_lengkap="Pelajar Satu", tipe_peserta="PELAJAR",
            nama_institusi="Univ Test", no_telepon="123", pilihan_penempatan=self.penempatan1,
            surat_pengajuan=SimpleUploadedFile("surat.pdf", b"file_content", content_type="application/pdf")
        )
        url = reverse('daftar-penempatan')
        response = self.client.get(url)
        bioflok_data = next(item for item in response.data if item["nama"] == "BIOFLOK NILA")
        self.assertEqual(bioflok_data['sisa_kuota_pelajar'], 1)
        self.assertEqual(bioflok_data['sisa_kuota_umum'], 1)

    def test_create_pendaftaran_success(self):
        url = reverse('buat-pendaftaran')
        dummy_file = SimpleUploadedFile("surat_pengajuan.pdf", b"file", content_type="application/pdf")
        data = {
            "email": "calonpeserta@test.com", "nama_lengkap": "Calon Peserta Baru",
            "tipe_peserta": "PELAJAR", "nama_institusi": "Universitas Koding",
            "no_telepon": "08123456789", "pilihan_penempatan": self.penempatan2.id,
            "surat_pengajuan": dummy_file,
        }
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Pendaftaran.objects.count(), 1)
        self.assertEqual(response.data['message'], "Pendaftaran berhasil diajukan. Silakan tunggu verifikasi dari admin.")

    def test_create_pendaftaran_quota_full(self):
        Pendaftaran.objects.create(
            email="umum1@test.com", nama_lengkap="Umum Satu", tipe_peserta="UMUM",
            nama_institusi="Dinas Test", no_telepon="111", pilihan_penempatan=self.penempatan1,
            surat_pengajuan=SimpleUploadedFile("surat1.pdf", b"file", content_type="application/pdf")
        )
        url = reverse('buat-pendaftaran')
        dummy_file = SimpleUploadedFile("surat2.pdf", b"file", content_type="application/pdf")
        data = {
            "email": "umum2@test.com", "nama_lengkap": "Umum Dua", "tipe_peserta": "UMUM",
            "nama_institusi": "Dinas Test 2", "no_telepon": "222",
            "pilihan_penempatan": self.penempatan1.id, "surat_pengajuan": dummy_file,
        }
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Kuota untuk umum di unit penempatan ini sudah penuh.", str(response.data))
        self.assertEqual(Pendaftaran.objects.count(), 1)


# --- KELAS TES BARU UNTUK API ADMIN ---

class AdminBimbinganAPITests(APITestCase):
    """
    Kelompok tes untuk endpoint API yang hanya bisa diakses oleh Admin.
    """

    def setUp(self):
        """ Menyiapkan user admin, user peserta, dan data pendaftaran. """
        self.admin_user = User.objects.create_superuser(
            email='admin@test.com', password='password123', nama_lengkap='Admin Test'
        )
        self.peserta_user = User.objects.create_user(
            email='peserta@test.com', password='password123', nama_lengkap='Peserta Test'
        )
        self.penempatan = Penempatan.objects.create(nama="TEST UNIT", kuota_pelajar=1)
        self.pendaftaran_pending = Pendaftaran.objects.create(
            email="calon@test.com", nama_lengkap="Calon Peserta", tipe_peserta="PELAJAR",
            nama_institusi="Univ Calon", no_telepon="12345", pilihan_penempatan=self.penempatan
        )

    def test_admin_can_list_pending_pendaftaran(self):
        """ Tes 1: Admin berhasil melihat daftar pendaftaran yang pending. """
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin-pendaftaran-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1) # Hanya ada 1 yang pending
        self.assertEqual(response.data[0]['nama_lengkap'], 'Calon Peserta')

    def test_non_admin_cannot_access_admin_endpoints(self):
        """ Tes 2: Pengguna biasa (peserta) & anonim GAGAL mengakses endpoint admin. """
        url = reverse('admin-pendaftaran-list')

        # Coba sebagai pengguna anonim (belum login)
        response_anon = self.client.get(url)
        self.assertEqual(response_anon.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Coba sebagai pengguna biasa (peserta)
        self.client.force_authenticate(user=self.peserta_user)
        response_peserta = self.client.get(url)
        self.assertEqual(response_peserta.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_approve_pendaftaran(self):
        """ Tes 3: Admin berhasil menyetujui pendaftaran. """
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin-pendaftaran-approve', kwargs={'pk': self.pendaftaran_pending.pk})
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Refresh data pendaftaran dari database
        self.pendaftaran_pending.refresh_from_db()
        self.assertEqual(self.pendaftaran_pending.status, Pendaftaran.Status.DISETUJUI)
        
        # Verifikasi bahwa User dan PesertaProfile baru telah dibuat
        self.assertTrue(User.objects.filter(email="calon@test.com").exists())
        self.assertTrue(PesertaProfile.objects.filter(user__email="calon@test.com").exists())
        
        # Verifikasi pesan sukses
        self.assertEqual(response.data['message'], "Pendaftaran berhasil disetujui.")
        self.assertIn('password_sementara', response.data)

    def test_admin_can_reject_pendaftaran(self):
        """ Tes 4: Admin berhasil menolak pendaftaran. """
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin-pendaftaran-reject', kwargs={'pk': self.pendaftaran_pending.pk})
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.pendaftaran_pending.refresh_from_db()
        self.assertEqual(self.pendaftaran_pending.status, Pendaftaran.Status.DITOLAK)
        
        # Pastikan tidak ada User atau Profil yang dibuat
        self.assertFalse(User.objects.filter(email="calon@test.com").exists())
        self.assertEqual(response.data['message'], "Pendaftaran telah ditolak.")