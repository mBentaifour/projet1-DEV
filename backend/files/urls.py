# backend/files/urls.py

from django.urls import path
from .views import (
    FileUploadView,
    FileListView,
    FileDeleteView,
    CreateSharedLinkView,
    SharedFileView
)

urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('', FileListView.as_view(), name='file-list'),
    path('<int:pk>/', FileDeleteView.as_view(), name='file-delete'),

    # Nouvelles routes pour le partage
    path('<int:pk>/share/', CreateSharedLinkView.as_view(), name='file-share'),
    path('shared/<uuid:uuid>/', SharedFileView.as_view(), name='shared-file'),
]
