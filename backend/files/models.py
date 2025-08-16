# files/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid

# NOUVEAU MODÈLE : Folder
class Folder(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='folders')
    # Le champ "parent" permet de créer des sous-dossiers.
    # Un dossier sans parent est un dossier racine.
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subfolders')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.owner.username}"


class File(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    # CHAMP AJOUTÉ : Le dossier auquel le fichier appartient.
    # Peut être vide si le fichier est à la racine.
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, null=True, blank=True, related_name='files')

    def __str__(self):
        return f"{self.file.name} - {self.owner.username}"


class SharedLink(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='shared_links')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"Link for {self.file.file.name} ({self.id})"
