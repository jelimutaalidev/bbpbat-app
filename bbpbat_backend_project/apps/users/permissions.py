from rest_framework.permissions import BasePermission

class IsAdminUser(BasePermission):
    """
    Izin kustom (Custom Permission) untuk hanya memperbolehkan akses 
    kepada pengguna dengan peran (role) sebagai ADMIN.
    """
    def has_permission(self, request, view):
        """
        Mengembalikan `True` jika pengguna terotentikasi dan memiliki peran ADMIN,
        selain itu mengembalikan `False`.
        """
        # Cek apakah pengguna sudah login DAN perannya adalah ADMIN
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')

class IsPesertaUser(BasePermission):
    """
    Izin kustom untuk hanya memperbolehkan akses 
    kepada pengguna dengan peran sebagai PESERTA.
    """
    def has_permission(self, request, view):
        """
        Mengembalikan `True` jika pengguna terotentikasi dan memiliki peran PESERTA,
        selain itu mengembalikan `False`.
        """
        # Cek apakah pengguna sudah login DAN perannya adalah PESERTA
        return bool(request.user and request.user.is_authenticated and request.user.role == 'PESERTA')