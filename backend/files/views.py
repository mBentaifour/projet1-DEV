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

# --- VUE MODIFIÉE AVEC LA VALIDATION ---
class FileUploadView(generics.CreateAPIView):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]

    # On redéfinit la méthode create pour ajouter notre logique de validation
    def create(self, request, *args, **kwargs):
        file_obj = request.data.get('file')

        # --- 1. Validation de la taille du fichier ---
        # 5 * 1024 * 1024 = 5 MB en bytes
        if file_obj.size > 5 * 1024 * 1024: 
            return Response({
                'error': 'Le fichier est trop volumineux. La taille maximale est de 5 Mo.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # --- 2. Validation du type de fichier ---
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.docx']
        # On récupère l'extension en minuscules pour être sûr
        file_extension = '.' + file_obj.name.split('.')[-1].lower()

        if file_extension not in allowed_extensions:
            return Response({
                'error': f"Type de fichier non autorisé. Types autorisés : {', '.join(allowed_extensions)}"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Si tout est bon, on continue le processus normal de DRF
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

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


# --- VUES POUR LE PARTAGE ---

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
