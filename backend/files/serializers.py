# files/serializers.py
from rest_framework import serializers
from .models import File, Folder, SharedLink # <-- Ajoute Folder ici

# NOUVEAU : Le serializer pour les dossiers
class FolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder
        fields = ['id', 'name', 'parent', 'created_at']


class FileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()

    class Meta:
        model = File
        # On ajoute le champ 'folder' pour savoir où est le fichier
        fields = ['id', 'file', 'uploaded_at', 'file_url', 'name', 'folder']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            return request.build_absolute_uri(obj.file.url)
        return None

    def get_name(self, obj):
        return obj.file.name.split('/')[-1]


class SharedLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SharedLink
        fields = ['id']
