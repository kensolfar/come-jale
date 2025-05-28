from django.db import models
from django.contrib.auth.models import User
from .pedido import Pedido

class Ruta(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    activa = models.BooleanField(default=True)
    
    def __str__(self):
        return self.nombre

class Entrega(models.Model):
    pedido = models.OneToOneField(Pedido, on_delete=models.CASCADE)
    repartidor = models.ForeignKey(User, related_name='entregas', on_delete=models.SET_NULL, null=True, blank=True)
    ruta = models.ForeignKey('Ruta', on_delete=models.SET_NULL, null=True, blank=True)
    fecha_asignacion = models.DateTimeField(auto_now_add=True)
    fecha_entrega = models.DateTimeField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=[('pendiente','Pendiente'),('en_ruta','En ruta'),('entregada','Entregada')], default='pendiente')
    ubicacion_actual = models.CharField(max_length=255, blank=True)
    
    def __str__(self):
        return f"Entrega de Pedido #{self.pedido.id} - Estado: {self.estado}"

class ClienteRuta(models.Model):
    cliente = models.ForeignKey(User, related_name='rutas_cliente', on_delete=models.CASCADE)
    ruta = models.ForeignKey(Ruta, related_name='clientes', on_delete=models.CASCADE)
    latitud = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitud = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    direccion = models.CharField(max_length=255, blank=True)
    
    def __str__(self):
        return f"{self.cliente.username} en {self.ruta.nombre}"
