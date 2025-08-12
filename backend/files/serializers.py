# backend/files/serializers.py
from rest_framework import serializers
from .models import File

class FileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = ['id', 'file', 'uploaded_at', 'file_url', 'name']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            return request.build_absolute_uri(obj.file.url)
        return None

    def get_name(self, obj):
        return obj.file.name.split('/')[-1]
