from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import User

class Configuracion(models.Model):
    idioma = models.CharField(max_length=10, choices=[('es', _('Español')), ('en', _('Inglés'))], default='es')
    nombre_restaurante = models.CharField(max_length=255)
    direccion = models.CharField(max_length=255, blank=True)
    telefono = models.CharField(max_length=50, blank=True)
    logo = models.ImageField(upload_to='restaurante/', blank=True, null=True)
    descripcion = models.TextField(blank=True)
    
    def save(self, *args, **kwargs):
        self.pk = 1  # Singleton: siempre id=1
        super().save(*args, **kwargs)
        
    def __str__(self):
        return str(_(f"Configuración de {self.nombre_restaurante}"))
    
    class Meta:
        verbose_name = _('Configuración')
        verbose_name_plural = _('Configuraciones')

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    imagen = models.ImageField(upload_to='usuarios/', blank=True, null=True)
    
    def __str__(self):
        return f"Perfil de {self.user.username}"
