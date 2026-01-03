from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class Pengumuman(models.Model):
    """
    Model untuk semua pengumuman yang dibuat oleh admin untuk ditampilkan kepada peserta.
    """
    class Prioritas(models.TextChoices):
        TINGGI = "TINGGI", "Tinggi"
        SEDANG = "SEDANG", "Sedang"
        RENDAH = "RENDAH", "Rendah"
        
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        PUBLISHED = "PUBLISHED", "Published"

    judul = models.CharField(_("Judul Pengumuman"), max_length=255)
    konten = models.TextField(_("Isi Pengumuman"))
    penulis = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        limit_choices_to={'role': 'ADMIN'},
        related_name="pengumuman"
    )
    
    kategori = models.CharField(_("Kategori"), max_length=50, default='Umum', help_text="Contoh: Umum, Jadwal, Workshop")
    prioritas = models.CharField(_("Prioritas"), max_length=20, choices=Prioritas.choices, default=Prioritas.SEDANG)
    target_peserta = models.CharField(_("Target Peserta"), max_length=50, default='Semua Peserta', help_text="Contoh: Semua Peserta, Pelajar, Peserta Bioflok")
    status = models.CharField(_("Status"), max_length=20, choices=Status.choices, default=Status.DRAFT)
    dibuat_pada = models.DateTimeField(_("Dibuat Pada"), auto_now_add=True)
    dipublish_pada = models.DateTimeField(_("Dipublish Pada"), null=True, blank=True)

    class Meta:
        verbose_name = "Pengumuman"
        verbose_name_plural = "Pengumuman"
        ordering = ['-dipublish_pada', '-dibuat_pada'] # Urutkan berdasarkan tanggal terbaru

    def __str__(self):
        return self.judul
    