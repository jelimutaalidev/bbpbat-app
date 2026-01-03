from django.contrib import admin
from .models import Penempatan, Pendaftaran, Absensi, Laporan, Sertifikat

admin.site.register(Penempatan)
admin.site.register(Pendaftaran)
admin.site.register(Absensi)
admin.site.register(Laporan)
admin.site.register(Sertifikat)