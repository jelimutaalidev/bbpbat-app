from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _

# --- TAMBAHKAN KELAS INI ---
class CustomUserManager(BaseUserManager):
    """
    Manager kustom untuk model User kita yang tidak menggunakan username.
    """
    def create_user(self, email, password, **extra_fields):
        """
        Membuat dan menyimpan User dengan email dan password yang diberikan.
        """
        if not email:
            raise ValueError(_('Alamat email wajib diisi'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        """
        Membuat dan menyimpan SuperUser dengan email dan password yang diberikan.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'ADMIN') # Otomatis set role sebagai ADMIN

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser harus memiliki is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser harus memiliki is_superuser=True.'))
            
        return self.create_user(email, password, **extra_fields)


# --- MODEL USER ANDA ---
class User(AbstractUser):
    """
    Model Pengguna Kustom untuk sistem BBPBAT.
    """
    # Hapus username karena kita tidak menggunakannya
    username = None

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        PESERTA = "PESERTA", "Peserta"
        
    first_name = None
    last_name = None
    nama_lengkap = models.CharField(_("Nama Lengkap"), max_length=255)
    email = models.EmailField(_("Alamat Email"), unique=True, help_text="Akan digunakan untuk login.")
    role = models.CharField(_("Peran Pengguna"), max_length=50, choices=Role.choices, default=Role.PESERTA)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nama_lengkap']

    # --- TAMBAHKAN BARIS INI UNTUK MENGHUBUNGKAN MANAGER ---
    objects = CustomUserManager()

    def __str__(self):
        return f"{self.nama_lengkap} ({self.get_role_display()})"