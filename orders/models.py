from django.db import models
from django.contrib.auth.models import User
from rest_framework import serializers

class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)

    def __str__(self):
        return self.nombre

class Subcategoria(models.Model):
    nombre = models.CharField(max_length=100)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='subcategorias')
    descripcion = models.TextField(blank=True)

    class Meta:
        unique_together = ('nombre', 'categoria')

    def __str__(self):
        return f"{self.nombre} ({self.categoria.nombre})"

class Producto(models.Model):
    nombre = models.CharField(max_length=255)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    descripcion = models.TextField(blank=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='productos')
    subcategoria = models.ForeignKey(Subcategoria, on_delete=models.SET_NULL, null=True, blank=True, related_name='productos')
    imagen = models.ImageField(upload_to='productos/', blank=True, null=True)
    disponible = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.nombre

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

    def __str__(self):
        return f"Pedido #{self.id} - {self.cliente.username}"

class PedidoProducto(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.producto.nombre} x {self.cantidad}"

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

    def __str__(self):
        return f"Factura #{self.id} - Pedido #{self.pedido.id}"

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

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class SubcategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subcategoria
        fields = '__all__'

class ProductoSerializer(serializers.ModelSerializer):
    categoria = CategoriaSerializer(read_only=True)
    subcategoria = SubcategoriaSerializer(read_only=True)
    class Meta:
        model = Producto
        fields = '__all__'

class PedidoProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PedidoProducto
        fields = '__all__'

class PedidoSerializer(serializers.ModelSerializer):
    productos = PedidoProductoSerializer(source='pedidoproducto_set', many=True, read_only=True)
    class Meta:
        model = Pedido
        fields = '__all__'

class FacturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Factura
        fields = '__all__'

class RutaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ruta
        fields = '__all__'

class EntregaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entrega
        fields = '__all__'

class ClienteRutaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClienteRuta
        fields = '__all__'
