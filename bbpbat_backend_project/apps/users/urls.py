from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

# Mengimpor view yang telah kita buat
from .views import MyTokenObtainPairView, CurrentUserView

urlpatterns = [
    # URL untuk login (method: POST)
    # Frontend akan mengirim email dan password ke sini.
    # Jika berhasil, view akan mengembalikan access token, refresh token, dan data user.
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),

    # URL untuk memperbarui access token (method: POST)
    # Frontend akan mengirim refresh token ke sini untuk mendapatkan access token baru
    # tanpa harus login ulang.
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # URL untuk mendapatkan data pengguna yang sedang login (method: GET)
    # Frontend akan memanggil ini setelah login berhasil untuk mendapatkan
    # detail pengguna yang terotentikasi.
    path('me/', CurrentUserView.as_view(), name='current_user'),
]