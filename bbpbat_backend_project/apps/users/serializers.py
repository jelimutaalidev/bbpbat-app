from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer untuk menampilkan data pengguna (User).
    Hanya menampilkan data yang aman untuk diekspos ke frontend.
    """
    class Meta:
        model = User
        # Tentukan field mana saja dari model User yang akan diubah menjadi JSON
        fields = ['id', 'email', 'nama_lengkap', 'role']
        # 'password' tidak pernah dimasukkan di sini demi keamanan

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer ini mengkustomisasi respons token JWT.
    Tujuannya: saat login berhasil, frontend tidak hanya menerima token,
    tetapi juga langsung mendapatkan data dasar pengguna (seperti nama dan peran).
    Ini mengurangi jumlah panggilan API yang diperlukan oleh frontend.
    """
    @classmethod
    def get_token(cls, user):
        # Memanggil metode asli untuk mendapatkan token
        token = super().get_token(user)

        # Menambahkan data kustom ke dalam payload token
        token['nama_lengkap'] = user.nama_lengkap
        token['role'] = user.role
        
        return token

    def validate(self, attrs):
        # Memanggil validasi asli
        data = super().validate(attrs)

        # Menambahkan data pengguna ke dalam respons login
        # Ini akan berada di luar payload token, langsung di body respons
        user_serializer = UserSerializer(self.user)
        data.update(user_serializer.data)
        
        return data