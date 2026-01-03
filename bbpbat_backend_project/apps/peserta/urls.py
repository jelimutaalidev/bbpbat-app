# bbpbat_backend_project/apps/peserta/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PesertaAdminViewSet, 
    PesertaMeAPIView, 
    PesertaMeUpdateAPIView,
    DokumenUploadAPIView,
    PesertaAbsensiView,
    AjukanIzinView, 
    LaporanPesertaView,
    PesertaDashboardView,
    SertifikatPesertaView,
    AdminBuktiPembayaranViewSet,
    PesertaPembayaranView
)

# Router untuk endpoint yang diakses oleh ADMIN
admin_router = DefaultRouter()
admin_router.register(r'peserta', PesertaAdminViewSet, basename='admin-peserta')
admin_router.register(r'pembayaran', AdminBuktiPembayaranViewSet, basename='admin-pembayaran')

# Router untuk endpoint yang diakses oleh PESERTA (jika ada yang pakai ViewSet)
# Saat ini tidak ada, jadi kita biarkan kosong.

# Daftarkan semua URL di sini
urlpatterns = [
    # Semua URL admin sekarang ada di bawah /admin/
    # Menghasilkan: /api/admin/peserta/ dan /api/admin/pembayaran/
    path('admin/', include(admin_router.urls)),
    
    # Semua URL peserta sekarang ada di bawah /peserta/
    # Menghasilkan: /api/peserta/me/, /api/peserta/absensi/, dll.
    path('peserta/me/', PesertaMeAPIView.as_view(), name='peserta-me'),
    path('peserta/me/update/', PesertaMeUpdateAPIView.as_view(), name='peserta-me-update'),
    path('peserta/dokumen/upload/', DokumenUploadAPIView.as_view(), name='peserta-dokumen-upload'),
    path('peserta/absensi/', PesertaAbsensiView.as_view(), name='peserta-absensi'),
    path('peserta/ajukan-izin/', AjukanIzinView.as_view(), name='peserta-ajukan-izin'),
    path('peserta/laporan/', LaporanPesertaView.as_view(), name='peserta-laporan'),
    path('peserta/pembayaran/', PesertaPembayaranView.as_view(), name='peserta-pembayaran'),
    path('peserta/dashboard/', PesertaDashboardView.as_view(), name='peserta-dashboard'),
    path('peserta/sertifikat/', SertifikatPesertaView.as_view(), name='peserta-sertifikat'),
]