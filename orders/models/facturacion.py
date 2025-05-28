from django.db import models
from .pedido import Pedido

class Factura(models.Model):
    pedido = models.OneToOneField(Pedido, on_delete=models.CASCADE)
    nombre_vendedor = models.CharField(max_length=255)
    domicilio_vendedor = models.CharField(max_length=255)
    nombre_destinatario = models.CharField(max_length=255)
    domicilio_destinatario = models.CharField(max_length=255)
    descripcion_mercancias = models.TextField()
    tipo_embalaje = models.CharField(max_length=100, blank=True)
    marcas = models.CharField(max_length=100, blank=True)
    numeros = models.CharField(max_length=100, blank=True)
    clases = models.CharField(max_length=100, blank=True)
    cantidades = models.CharField(max_length=100, blank=True)
    termino_comercial = models.CharField(max_length=100, blank=True)
    fletes = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    seguro = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    lugar_expedicion = models.CharField(max_length=255)
    fecha_expedicion = models.DateField(auto_now_add=True)
    metodo_pago = models.CharField(max_length=100)
    monto_total = models.DecimalField(max_digits=12, decimal_places=2)

    def clean(self):
        from django.core.exceptions import ValidationError
        total = sum(pp.cantidad * pp.precio_unitario for pp in self.pedido.pedidoproducto_set.all())
        if self.monto_total != total:
            raise ValidationError("El monto total de la factura debe coincidir con el total del pedido.")

    def __str__(self):
        return f"Factura #{self.id} - Pedido #{self.pedido.id}"
