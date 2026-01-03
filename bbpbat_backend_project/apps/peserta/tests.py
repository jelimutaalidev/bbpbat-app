from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

# Mengimpor model dari aplikasi ini dan aplikasi lain
from .models import PesertaProfile
from apps.bimbingan.models import Pendaftaran, Penempatan

# Mengambil model User kustom yang sedang aktif
User = get_user_model()

class PesertaAdminAPITests(APITestCase):
    """
    Kelompok tes untuk endpoint API manajemen peserta yang hanya bisa diakses Admin.
    """

    @classmethod
    def setUpTestData(cls):
        """
        Metode ini dijalankan sekali untuk seluruh kelas tes.
        Lebih efisien untuk data yang tidak akan diubah oleh tes.
        """
        # 1. Buat user admin dan user biasa
        cls.admin_user = User.objects.create_superuser(
            email='admin@test.com', password='password123', nama_lengkap='Admin Test'
        )
        cls.peserta_user_1 = User.objects.create_user(
            email='pelajar@test.com', password='password123', nama_lengkap='Pelajar Test'
        )
        cls.peserta_user_2 = User.objects.create_user(
            email='umum@test.com', password='password123', nama_lengkap='Umum Test'
        )

        # 2. Buat profil untuk user biasa
        cls.profil_pelajar = PesertaProfile.objects.create(
            user=cls.peserta_user_1,
            tipe_peserta='PELAJAR',
            nama_institusi='Universitas Uji Coba'
        )
        cls.profil_umum = PesertaProfile.objects.create(
            user=cls.peserta_user_2,
            tipe_peserta='UMUM',
            nama_institusi='Dinas Uji Coba'
        )

    def test_security_non_admin_cannot_access(self):
        """
        Tes 1: Memastikan pengguna non-admin (anonim & peserta) GAGAL mengakses.
        """
        url = reverse('admin-peserta-list')

        # Skenario A: Pengguna Anonim (belum login)
        response_anon = self.client.get(url)
        self.assertEqual(response_anon.status_code, status.HTTP_401_UNAUTHORIZED)

        # Skenario B: Pengguna Biasa (sudah login sebagai peserta)
        self.client.force_authenticate(user=self.peserta_user_1)
        response_peserta = self.client.get(url)
        self.assertEqual(response_peserta.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_list_all_peserta(self):
        """
        Tes 2: Memastikan admin BERHASIL mendapatkan daftar semua peserta.
        """
        # Login sebagai admin
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin-peserta-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Harus ada 2 profil peserta yang kita buat di setUpTestData
        self.assertEqual(len(response.data), 2)
        # Cek apakah data user di-nest dengan benar
        self.assertEqual(response.data[0]['user']['nama_lengkap'], 'Pelajar Test')

    def test_admin_can_filter_peserta_by_type(self):
        """
        Tes 3: Memastikan admin BERHASIL memfilter peserta berdasarkan tipenya.
        """
        self.client.force_authenticate(user=self.admin_user)
        base_url = reverse('admin-peserta-list')

        # Skenario A: Filter hanya untuk 'PELAJAR'
        response_pelajar = self.client.get(f"{base_url}?tipe_peserta=PELAJAR")
        self.assertEqual(response_pelajar.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_pelajar.data), 1)
        self.assertEqual(response_pelajar.data[0]['tipe_peserta'], 'Pelajar/Mahasiswa')

        # Skenario B: Filter hanya untuk 'UMUM'
        response_umum = self.client.get(f"{base_url}?tipe_peserta=UMUM")
        self.assertEqual(response_umum.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_umum.data), 1)
        self.assertEqual(response_umum.data[0]['user']['email'], 'umum@test.com')

    def test_admin_can_retrieve_peserta_detail(self):
        """
        Tes 4: Memastikan admin BERHASIL mendapatkan detail satu peserta spesifik.
        """
        self.client.force_authenticate(user=self.admin_user)
        # Menggunakan reverse untuk mendapatkan URL detail dengan Primary Key (pk)
        url = reverse('admin-peserta-detail', kwargs={'pk': self.profil_pelajar.pk})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verifikasi bahwa data yang dikembalikan adalah benar milik profil pelajar
        self.assertEqual(response.data['nama_institusi'], 'Universitas Uji Coba')
        self.assertEqual(response.data['user']['email'], 'pelajar@test.com')

