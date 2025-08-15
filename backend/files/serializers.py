# backend/files/serializers.py
from rest_framework import serializers
from .models import File, SharedLink # Assure-toi que SharedLink est bien importé ici

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
        # Prend seulement le nom du fichier, pas le chemin complet
        return obj.file.name.split('/')[-1]

class SharedLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SharedLink
        # On ne va exposer que l'ID unique (le lien lui-même)
        fields = ['id']
