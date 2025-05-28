from django.db import models
from django.contrib.auth.models import User
from .base import Producto

class Pedido(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('preparacion', 'En preparación'),
        ('enviado', 'Enviado'),
        ('entregado', 'Entregado'),
        ('pagado', 'Pagado'),
        ('cancelado', 'Cancelado'),
    ]
    cliente = models.ForeignKey(User, related_name='pedidos_cliente', on_delete=models.CASCADE)
    vendedor = models.ForeignKey(User, related_name='pedidos_vendedor', on_delete=models.SET_NULL, null=True, blank=True)
    repartidor = models.ForeignKey(User, related_name='pedidos_repartidor', on_delete=models.SET_NULL, null=True, blank=True)
    productos = models.ManyToManyField(Producto, through='PedidoProducto')
    direccion_entrega = models.CharField(max_length=255)
    contacto = models.CharField(max_length=100)
    info_adicional = models.TextField(blank=True)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    def clean(self):
        from django.core.exceptions import ValidationError
        if not self.direccion_entrega or not self.direccion_entrega.strip():
            raise ValidationError("La dirección de entrega no puede estar vacía.")
        if not self.contacto or not self.contacto.strip():
            raise ValidationError("El contacto no puede estar vacío.")
        if self.estado not in dict(self.ESTADOS):
            raise ValidationError(f"Estado '{self.estado}' no es válido.")
        if self.pk:
            productos = self.productos.values_list('id', flat=True)
            if len(productos) != len(set(productos)):
                raise ValidationError("No se permiten productos duplicados en el pedido.")
            if self.productos.count() == 0:
                raise ValidationError("Debe agregar al menos un producto al pedido.")
        if self.pk:
            original = Pedido.objects.get(pk=self.pk)
            if original.estado == 'cancelado' and self.estado == 'pagado':
                raise ValidationError("No se puede cambiar de 'cancelado' a 'pagado'.")
    def __str__(self):
        return f"Pedido #{self.id} - {self.cliente.username}"

class PedidoProducto(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    def clean(self):
        from django.core.exceptions import ValidationError
        if self.cantidad <= 0:
            raise ValidationError("La cantidad debe ser mayor a cero.")
        if self.precio_unitario <= 0:
            raise ValidationError("El precio unitario debe ser mayor a cero.")
        if not self.producto.disponible:
            raise ValidationError(f"El producto '{self.producto.nombre}' no está disponible.")
        if self.producto.cantidad < self.cantidad:
            raise ValidationError(f"No hay suficiente stock para '{self.producto.nombre}'. Disponible: {self.producto.cantidad}, solicitado: {self.cantidad}")
        if self.pedido_id and self.producto_id:
            existe = PedidoProducto.objects.filter(pedido_id=self.pedido_id, producto_id=self.producto_id).exclude(pk=self.pk).exists()
            if existe:
                raise ValidationError(f"El producto '{self.producto.nombre}' ya está en el pedido.")
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    def __str__(self):
        return f"{self.producto.nombre} x {self.cantidad}"
