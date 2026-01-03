from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PengumumanViewSet, PengumumanDetailView

# Membuat router untuk ViewSet
router = DefaultRouter()
router.register(r'manage', PengumumanViewSet, basename='pengumuman-admin')

# URL patterns untuk aplikasi 'pengumuman'
urlpatterns = [
    # 👇 2. Daftarkan URL detail untuk peserta
    # URL ini akan cocok dengan format: /api/pengumuman/1/, /api/pengumuman/2/, dst.
    path('<int:pk>/', PengumumanDetailView.as_view(), name='pengumuman-detail'),
    
    # 👇 3. Pindahkan URL router ke bawah dengan prefix 'manage'
    # URL ini akan cocok dengan format: /api/pengumuman/manage/
    path('', include(router.urls)),
]