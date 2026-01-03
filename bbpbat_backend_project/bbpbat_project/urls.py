"""
URL configuration for bbpbat_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    # --- TAMBAHKAN BLOK INI ---
    # Meneruskan semua URL yang berawalan 'api/auth/' ke file urls.py di dalam 'apps.users'
    path('api/auth/', include('apps.users.urls')),
    
    # Meneruskan semua URL yang berawalan 'api/bimbingan/' ke file urls.py di dalam 'apps.bimbingan'
    path('api/bimbingan/', include('apps.bimbingan.urls')),
    path('api/', include('apps.peserta.urls')),
    path('api/pengumuman/', include('apps.pengumuman.urls')),
]

# 👇 TAMBAHKAN BLOK KONDISIONAL INI DI AKHIR FILE 👇
# Baris ini hanya untuk mode DEVELOPMENT.
# Di production, web server seperti Nginx yang akan menangani ini.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
