# [BACKEND] apps/pengumuman/serializers.py

from rest_framework import serializers
from django.utils import timezone
from .models import Pengumuman

class PengumumanSerializer(serializers.ModelSerializer):
    """
    Serializer untuk operasi CRUD pada model Pengumuman.
    Telah diperbaiki untuk menangani input 'status' dengan benar.
    """
    penulis = serializers.StringRelatedField(read_only=True)
    
    # Ganti nama field agar cocok dengan frontend
    tanggalBuat = serializers.DateTimeField(source='dibuat_pada', read_only=True, format='%Y-%m-%d')
    tanggalPublish = serializers.DateTimeField(source='dipublish_pada', read_only=True, allow_null=True, format='%Y-%m-%d')

    class Meta:
        model = Pengumuman
        fields = [
            'id',
            'judul',
            'konten',
            'penulis',
            'kategori',
            'target_peserta',
            'prioritas',
            'status',
            'tanggalBuat',
            'tanggalPublish'
        ]
        # Hapus 'penulis' dan field tanggal dari sini karena sudah di-set read_only=True di atas
        read_only_fields = ['penulis']

    def to_representation(self, instance):
        """
        Mengubah representasi output ke frontend.
        'status' dan 'prioritas' diubah menjadi huruf kecil.
        """
        ret = super().to_representation(instance)
        # Mengubah format output untuk status dan prioritas
        ret['status'] = instance.status.lower()
        ret['prioritas'] = instance.prioritas.lower()
        # Mengganti nama 'target_peserta' menjadi 'target' di output JSON
        ret['target'] = ret.pop('target_peserta')
        return ret

    def to_internal_value(self, data):
        """
        Mengonversi data dari frontend (input) ke format backend (database).
        """
        # Ubah 'target' dari frontend ke 'target_peserta' untuk disimpan di model
        if 'target' in data:
            data['target_peserta'] = data.pop('target')
            
        # Ubah status dan prioritas dari huruf kecil (jika ada) ke huruf besar
        if 'status' in data and data['status']:
            data['status'] = str(data['status']).upper()
        if 'prioritas' in data and data['prioritas']:
            data['prioritas'] = str(data['prioritas']).upper()
            
        return super().to_internal_value(data)

    def create(self, validated_data):
        """
        Override method 'create' untuk menambahkan logika kustom.
        """
        validated_data['penulis'] = self.context['request'].user
        
        if validated_data.get('status') == 'PUBLISHED':
            validated_data['dipublish_pada'] = timezone.now()
            
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """
        Override method 'update' untuk menambahkan logika kustom.
        """
        # Cek jika status diubah dari DRAFT menjadi PUBLISHED
        if instance.status == 'DRAFT' and validated_data.get('status') == 'PUBLISHED':
            validated_data['dipublish_pada'] = timezone.now()
        
        # Jika status diubah dari PUBLISHED menjadi DRAFT, hapus tanggal publish
        elif instance.status == 'PUBLISHED' and validated_data.get('status') == 'DRAFT':
            validated_data['dipublish_pada'] = None
            
        return super().update(instance, validated_data)