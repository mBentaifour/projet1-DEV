# files/admin.py
from django.contrib import admin
from .models import File, Folder, SharedLink

@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'file', 'folder', 'uploaded_at')
    list_filter = ('owner', 'uploaded_at', 'folder')
    search_fields = ('file__name', 'owner__username')

@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'owner', 'parent', 'created_at')
    list_filter = ('owner', 'created_at')
    search_fields = ('name', 'owner__username')

@admin.register(SharedLink)
class SharedLinkAdmin(admin.ModelAdmin):
    list_display = ('id', 'file', 'created_at', 'expires_at')
    readonly_fields = ('id',)
