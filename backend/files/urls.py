# files/urls.py
from django.urls import path, re_path
from .views import (
    FileUploadView,
    FileListView,
    FileDeleteView,
    CreateSharedLinkView,
    SharedFileView,
    FolderContentView, # <-- Importer
    FolderCreateView,   # <-- Importer
    FolderRenameView,
    FolderDeleteView
)

urlpatterns = [
    # Routes pour les fichiers
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('<int:pk>/', FileDeleteView.as_view(), name='file-delete'),
    path('<int:pk>/share/', CreateSharedLinkView.as_view(), name='file-share'),
    path('shared/<uuid:uuid>/', SharedFileView.as_view(), name='shared-file'),

    # Route pour la recherche (on garde l'ancienne vue pour ça)
    path('search/', FileListView.as_view(), name='file-search'),

    # Routes pour les dossiers
    path('folders/create/', FolderCreateView.as_view(), name='folder-create'),
    # Affiche le contenu de la racine
    path('folders/content/', FolderContentView.as_view(), name='folder-content-root'),
    # Affiche le contenu d'un dossier spécifique
    path('folders/content/<int:folder_id>/', FolderContentView.as_view(), name='folder-content-specific'),
    path('folders/<int:pk>/rename/', FolderRenameView.as_view(), name='folder-rename'),
    path('folders/<int:pk>/', FolderDeleteView.as_view(), name='folder-delete'),
]
