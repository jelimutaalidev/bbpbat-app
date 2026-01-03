from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

# Mengambil model User kustom yang sedang aktif
User = get_user_model()


class UserManagerTests(TestCase):
    """
    Kelompok tes untuk CustomUserManager.
    """

    def test_create_user(self):
        """
        Tes pembuatan pengguna biasa (peserta) berhasil.
        """
        user = User.objects.create_user(
            email='peserta@test.com',
            password='password123',
            nama_lengkap='Peserta Test'
        )
        self.assertEqual(user.email, 'peserta@test.com')
        self.assertEqual(user.nama_lengkap, 'Peserta Test')
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertEqual(user.role, User.Role.PESERTA)  # Cek role default

        # --- PERBAIKAN DI SINI ---
        # Verifikasi bahwa atribut username ada tetapi nilainya None
        self.assertIsNone(user.username)

    def test_create_user_no_email(self):
        """
        Tes error saat membuat pengguna tanpa email.
        """
        with self.assertRaises(ValueError):
            User.objects.create_user(email='', password='password123', nama_lengkap='Test')

    def test_create_superuser(self):
        """
        Tes pembuatan superuser (admin) berhasil.
        """
        admin_user = User.objects.create_superuser(
            email='admin@test.com',
            password='password123',
            nama_lengkap='Admin Test'
        )
        self.assertEqual(admin_user.email, 'admin@test.com')
        self.assertEqual(admin_user.nama_lengkap, 'Admin Test')
        self.assertTrue(admin_user.is_active)
        self.assertTrue(admin_user.is_staff)
        self.assertTrue(admin_user.is_superuser)
        self.assertEqual(admin_user.role, User.Role.ADMIN) # Cek role superuser

    def test_create_superuser_not_staff(self):
        """
        Tes error saat membuat superuser dengan is_staff=False.
        """
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                email='admin@test.com',
                password='password123',
                nama_lengkap='Admin Test',
                is_staff=False
            )

    def test_create_superuser_not_superuser(self):
        """
        Tes error saat membuat superuser dengan is_superuser=False.
        """
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                email='admin@test.com',
                password='password123',
                nama_lengkap='Admin Test',
                is_superuser=False
            )


class UserModelTests(TestCase):
    """
    Kelompok tes untuk model User itu sendiri.
    """

    def test_user_str(self):
        """
        Tes representasi string dari model User.
        """
        user = User.objects.create_user(
            email='peserta@test.com',
            password='password123',
            nama_lengkap='Peserta String Test'
        )
        self.assertEqual(str(user), "Peserta String Test (Peserta)")
        
        admin_user = User.objects.create_superuser(
            email='admin@test.com',
            password='password123',
            nama_lengkap='Admin String Test'
        )
        self.assertEqual(str(admin_user), "Admin String Test (Admin)")
        
    def test_email_is_primary_identifier(self):
        """
        Memastikan bahwa USERNAME_FIELD adalah 'email'.
        """
        self.assertEqual(User.USERNAME_FIELD, 'email')

    def test_required_fields(self):
        """
        Memastikan bahwa nama_lengkap ada di REQUIRED_FIELDS.
        """
        self.assertIn('nama_lengkap', User.REQUIRED_FIELDS)