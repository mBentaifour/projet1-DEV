# files/views.py
from django.shortcuts import render
from rest_framework import generics, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.http import FileResponse, Http404

from .models import File, Folder, SharedLink
from .serializers import FileSerializer, FolderSerializer, SharedLinkSerializer

# --- VUE MODIFIÉE POUR L'UPLOAD ---
class FileUploadView(generics.CreateAPIView):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        file_obj = request.data.get('file')
        if not file_obj:
            return Response({'error': 'Aucun fichier fourni.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validation de la taille (5 Mo)
        if file_obj.size > 5 * 1024 * 1024: 
            return Response({'error': 'Le fichier est trop volumineux. La taille maximale est de 5 Mo.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validation du type
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.docx']
        file_extension = '.' + file_obj.name.split('.')[-1].lower()
        if file_extension not in allowed_extensions:
            return Response({'error': f"Type de fichier non autorisé. Types autorisés : {', '.join(allowed_extensions)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Le reste est standard
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        # On assigne le propriétaire
        serializer.save(owner=self.request.user)


# --- NOUVELLES VUES POUR LES DOSSIERS ---

class FolderContentView(APIView):
    """
    Affiche le contenu d'un dossier (sous-dossiers et fichiers).
    Si aucun ID de dossier n'est fourni, affiche le contenu de la racine.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, folder_id=None):
        owner = request.user
        
        # Récupère les sous-dossiers
        subfolders = Folder.objects.filter(owner=owner, parent_id=folder_id)
        # Récupère les fichiers dans ce dossier
        files_in_folder = File.objects.filter(owner=owner, folder_id=folder_id)

        # On traduit les données en JSON
        folder_serializer = FolderSerializer(subfolders, many=True)
        file_serializer = FileSerializer(files_in_folder, many=True, context={'request': request})
        
        return Response({
            'folders': folder_serializer.data,
            'files': file_serializer.data
        })

class FolderCreateView(generics.CreateAPIView):
    """
    Crée un nouveau dossier.
    """
    queryset = Folder.objects.all()
    serializer_class = FolderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # On assigne le propriétaire au nouveau dossier
        serializer.save(owner=self.request.user)


# --- ANCIENNES VUES ---

class FileListView(generics.ListAPIView):
    # CETTE VUE N'EST PLUS UTILE, on la garde pour l'instant pour la recherche
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

class CreateSharedLinkView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            file_to_share = File.objects.get(pk=pk, owner=request.user)
        except File.DoesNotExist:
            return Response({'error': 'Fichier non trouvé.'}, status=status.HTTP_404_NOT_FOUND)
        expires_at = timezone.now() + timedelta(days=1)
        shared_link = SharedLink.objects.create(file=file_to_share, expires_at=expires_at)
        link_url = request.build_absolute_uri(f"/api/files/shared/{shared_link.id}/")
        return Response({'shared_link': link_url}, status=status.HTTP_201_CREATED)

class SharedFileView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, uuid):
        try:
            shared_link = SharedLink.objects.get(id=uuid)
        except SharedLink.DoesNotExist:
            raise Http404("Ce lien de partage n'existe pas.")
        if shared_link.is_expired():
            return Response({'error': 'Ce lien a expiré.'}, status=status.HTTP_410_GONE)
        file_handle = shared_link.file.file
        filename = file_handle.name.split('/')[-1]
        response = FileResponse(file_handle, as_attachment=True, filename=filename)
        return response
# ... (à la fin de backend/files/views.py)

class FolderRenameView(generics.UpdateAPIView):
    """
    Permet de renommer un dossier.
    """
    queryset = Folder.objects.all()
    serializer_class = FolderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk' # L'ID du dossier sera passé dans l'URL

    def get_queryset(self):
        # Assure que l'utilisateur ne peut renommer que ses propres dossiers
        return Folder.objects.filter(owner=self.request.user)

# (à ajouter à la fin de votre fichier backend/files/views.py)

class FolderDeleteView(generics.DestroyAPIView):
    """
    Supprime un dossier et tout son contenu (fichiers et sous-dossiers)
    grâce à la suppression en cascade de la base de données.
    """
    queryset = Folder.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk' # L'ID du dossier sera passé dans l'URL

    def get_queryset(self):
        # Sécurité : Assure que l'utilisateur ne peut supprimer que ses propres dossiers.
        return Folder.objects.filter(owner=self.request.user)
