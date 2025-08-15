# backend/files/views.py

from django.shortcuts import render
from rest_framework import generics, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.http import FileResponse, Http404

from .models import File, SharedLink
from .serializers import FileSerializer, SharedLinkSerializer

class FileUploadView(generics.CreateAPIView):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class FileListView(generics.ListAPIView):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = [filters.SearchFilter]
    search_fields = ['file']

    def get_serializer_context(self):
        return {'request': self.request}

    def get_queryset(self):
        return File.objects.filter(owner=self.request.user)

class FileDeleteView(generics.DestroyAPIView):
    queryset = File.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return File.objects.filter(owner=self.request.user)


# --- NOUVELLES VUES POUR LE PARTAGE ---

class CreateSharedLinkView(APIView):
    """
    Crée un lien de partage pour un fichier.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            # On vérifie que le fichier existe ET qu'il appartient bien à l'utilisateur connecté
            file_to_share = File.objects.get(pk=pk, owner=request.user)
        except File.DoesNotExist:
            return Response({'error': 'Fichier non trouvé.'}, status=status.HTTP_404_NOT_FOUND)

        # On crée un lien qui expire dans 24 heures
        expires_at = timezone.now() + timedelta(days=1)
        shared_link = SharedLink.objects.create(file=file_to_share, expires_at=expires_at)

        # On construit l'URL complète du lien de partage
        link_url = request.build_absolute_uri(f"/api/files/shared/{shared_link.id}/")

        return Response({'shared_link': link_url}, status=status.HTTP_201_CREATED)


class SharedFileView(APIView):
    """
    Permet à n'importe qui de télécharger un fichier via un lien de partage valide.
    """
    permission_classes = [permissions.AllowAny] # Pas besoin d'être connecté

    def get(self, request, uuid):
        try:
            shared_link = SharedLink.objects.get(id=uuid)
        except SharedLink.DoesNotExist:
            raise Http404("Ce lien de partage n'existe pas.")

        # On vérifie si le lien a expiré
        if shared_link.is_expired():
            return Response({'error': 'Ce lien a expiré.'}, status=status.HTTP_410_GONE)

        # Si tout est bon, on envoie le fichier en téléchargement
        file_handle = shared_link.file.file
        # Prend le nom du fichier sans le chemin 'uploads/'
        filename = file_handle.name.split('/')[-1]
        response = FileResponse(file_handle, as_attachment=True, filename=filename)
        return response
