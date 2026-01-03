# File: apps/bimbingan/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Mengimpor semua view yang kita butuhkan
from .views import (
    PenempatanListView, 
    PendaftaranCreateView, 
    AdminPendaftaranViewSet,
    AdminDashboardStatsView,
    AbsensiAdminViewSet,
    LaporanAdminViewSet,
    AdminSertifikatViewSet,
    PenempatanAdminViewSet 
)

# Router untuk semua ViewSet yang khusus untuk admin
admin_router = DefaultRouter()
admin_router.register(r'pendaftaran', AdminPendaftaranViewSet, basename='admin-pendaftaran')
admin_router.register(r'absensi', AbsensiAdminViewSet, basename='admin-absensi')
admin_router.register(r'laporan', LaporanAdminViewSet, basename='admin-laporan')
admin_router.register(r'sertifikat', AdminSertifikatViewSet, basename='admin-sertifikat')
admin_router.register(r'penempatan', PenempatanAdminViewSet, basename='admin-penempatan')


urlpatterns = [
    # --- URL UNTUK PUBLIK (TIDAK BERUBAH) ---
    path('penempatan/', PenempatanListView.as_view(), name='penempatan-list'),
    path('pendaftaran/', PendaftaranCreateView.as_view(), name='pendaftaran-create'),
    
    # --- URL UNTUK ADMIN ---
    path('admin/dashboard-stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    
    # 3. Semua URL dari admin_router akan ditempatkan di bawah /api/bimbingan/admin/
    # Ini akan menghasilkan URL seperti:
    # /api/bimbingan/admin/pendaftaran/
    # /api/bimbingan/admin/absensi/
    path('admin/', include(admin_router.urls)), 
]