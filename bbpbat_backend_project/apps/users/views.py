from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import UserSerializer, MyTokenObtainPairSerializer


class MyTokenObtainPairView(TokenObtainPairView):
    """
    View untuk login (mendapatkan token).
    Menggunakan serializer kustom kita (MyTokenObtainPairSerializer) untuk
    menyertakan data pengguna dalam respons token.
    """
    serializer_class = MyTokenObtainPairSerializer


class CurrentUserView(APIView):
    """
    View untuk mendapatkan data pengguna yang saat ini terotentikasi.
    Endpoint ini dilindungi dan hanya bisa diakses setelah login berhasil.
    """
    # Menetapkan bahwa hanya pengguna yang sudah memiliki token (sudah login)
    # yang dapat mengakses view ini.
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Menangani HTTP GET request.
        Mengembalikan data pengguna yang terikat pada token yang dikirim dalam request.
        """
        # `request.user` secara otomatis berisi objek User yang terotentikasi
        # berkat `permission_classes` dan middleware JWT.
        serializer = UserSerializer(request.user)
        return Response(serializer.data)