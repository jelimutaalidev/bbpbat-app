from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated
from apps.users.permissions import IsAdminUser, IsPesertaUser
from .models import Pengumuman
from .serializers import PengumumanSerializer

class PengumumanViewSet(viewsets.ModelViewSet):
    """
    ViewSet untuk Admin melakukan operasi CRUD (Create, Read, Update, Delete)
    pada model Pengumuman.
    """
    # Mengamankan endpoint ini agar hanya bisa diakses oleh Admin
    permission_classes = [IsAdminUser]
    
    # Menggunakan serializer yang sudah kita buat
    serializer_class = PengumumanSerializer
    
    # Queryset dasar untuk mengambil semua objek Pengumuman
    # select_related('penulis') digunakan untuk optimasi database,
    # mengambil data penulis dalam satu query.
    queryset = Pengumuman.objects.select_related('penulis').all()

    def get_serializer_context(self):
        """
        Menyuntikkan 'request' object ke dalam serializer context.
        Ini penting agar serializer kita bisa mengakses 'request.user'
        untuk mengetahui siapa penulis pengumumannya.
        """
        return {'request': self.request}

class PengumumanDetailView(generics.RetrieveAPIView):
    """
    API view untuk mengambil detail satu pengumuman.
    Hanya bisa diakses oleh peserta yang sudah login.
    """
    permission_classes = [IsAuthenticated, IsPesertaUser]
    serializer_class = PengumumanSerializer
    queryset = Pengumuman.objects.filter(status=Pengumuman.Status.PUBLISHED)