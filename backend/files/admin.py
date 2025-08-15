# files/admin.py
from django.contrib import admin
from .models import File, SharedLink # <-- 1. On importe nos modèles

# 2. On dit à l'admin d'afficher le modèle File
@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'file', 'uploaded_at')
    list_filter = ('owner', 'uploaded_at')
    search_fields = ('file', 'owner__username')

# 3. On dit à l'admin d'afficher le modèle SharedLink
@admin.register(SharedLink)
class SharedLinkAdmin(admin.ModelAdmin):
    list_display = ('id', 'file', 'created_at', 'expires_at', 'is_expired')
    list_filter = ('created_at', 'expires_at')

    # On rend le champ 'id' non-modifiable car il est généré automatiquement
    readonly_fields = ('id',)
