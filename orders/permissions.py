from rest_framework import permissions
from django.contrib.auth.models import Group

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.groups.filter(name='Administrador').exists()

class IsVendedor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.groups.filter(name='Vendedor').exists()

class IsRepartidor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.groups.filter(name='Repartidor').exists()

class IsCliente(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.groups.filter(name='Cliente').exists()

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.groups.filter(name='Administrador').exists()

class IsAdminOrVendedorOrCliente(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return (
            user and user.is_authenticated and (
                user.groups.filter(name='Administrador').exists() or
                user.groups.filter(name='Vendedor').exists() or
                user.groups.filter(name='Cliente').exists()
            )
        )
