from django.db import models
from django.contrib.auth.models import User
from .base import Producto

class Impuesto(models.Model):
    nombre = models.CharField(max_length=50)
    codigo = models.CharField(max_length=10)
    tarifa = models.DecimalField(max_digits=5, decimal_places=2)
    es_exento = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.nombre} ({self.codigo})"

class Orden(models.Model):
    TIPO_CHOICES = [
        ('SALON', 'Salón'),
        ('LLEVAR', 'Para llevar'),
        ('EXPRESS', 'Express'),
    ]
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('pagada', 'Pagada'),
        ('anulada', 'Anulada'),
        ('entregada', 'Entregada'),
    ]
    cliente = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ordenes')
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='pendiente')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    direccion_entrega = models.CharField(max_length=255, blank=True)
    contacto = models.CharField(max_length=100, blank=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_descuentos = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_impuestos = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_otros_cargos = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_comprobante = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    def __str__(self):
        return f"Orden #{self.id} - {self.cliente.username}"
    
    def calcular_totales(self):
        subtotal = sum(l.cantidad * l.precio_unitario for l in self.lineas.all())
        total_descuentos = sum(l.descuento for l in self.lineas.all())
        total_impuestos = sum((l.total_linea - l.subtotal + l.descuento) for l in self.lineas.all())
        total_otros_cargos = sum(c.monto_aplicado for c in self.cargos.all())
        self.subtotal = subtotal
        self.total_descuentos = total_descuentos
        self.total_impuestos = total_impuestos
        self.total_otros_cargos = total_otros_cargos
        self.total_comprobante = subtotal - total_descuentos + total_impuestos + total_otros_cargos
        self.save()

class OrdenLinea(models.Model):
    orden = models.ForeignKey(Orden, on_delete=models.CASCADE, related_name='lineas')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.PositiveIntegerField()
    unidad_medida = models.CharField(max_length=20, default='Unid')
    detalle = models.CharField(max_length=255)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    descuento = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    impuesto = models.ForeignKey(Impuesto, on_delete=models.PROTECT)
    total_linea = models.DecimalField(max_digits=12, decimal_places=2)
    
    def __str__(self):
        return f"{self.producto.nombre} x {self.cantidad} (Orden {self.orden.id})"

class OrdenCargo(models.Model):
    orden = models.ForeignKey(Orden, on_delete=models.CASCADE, related_name='cargos')
    tipo_cargo = models.ForeignKey('TipoCargo', on_delete=models.PROTECT, null=True, blank=True)
    monto_aplicado = models.DecimalField(max_digits=10, decimal_places=2)
    tipo_aplicado = models.CharField(max_length=20, blank=True)
    impuesto = models.ForeignKey(Impuesto, on_delete=models.PROTECT, null=True, blank=True)
    
    def __str__(self):
        return f"{self.tipo_cargo.nombre} - Orden {self.orden.id}"

class TipoCargo(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True)
    monto = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tipo = models.CharField(max_length=20, default='SERVICIO')
    
    def __str__(self):
        return self.nombre

class TipoOrden(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True)
    cargos = models.ManyToManyField(TipoCargo, related_name='tipos_orden', blank=True)
    impuestos = models.ManyToManyField(Impuesto, related_name='tipos_orden', blank=True)
    
    def __str__(self):
        return self.nombre
