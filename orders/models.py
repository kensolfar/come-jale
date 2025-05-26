from django.db import models
from django.contrib.auth.models import User
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.contrib import admin

# --- MODELOS BASE ---
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
    cantidad = models.PositiveIntegerField(default=0)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.nombre

# --- MODELOS DE ORDEN Y FACTURACION FLEXIBLE ---
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
    producto = models.ForeignKey('Producto', on_delete=models.PROTECT)
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
    tipo_aplicado = models.CharField(max_length=20, blank=True)  # histórico, opcional
    impuesto = models.ForeignKey('Impuesto', on_delete=models.PROTECT, null=True, blank=True)  # solo si es impuesto

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

# --- OTROS MODELOS Y SERIALIZERS ---
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

# --- SERIALIZERS ---
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class SubcategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subcategoria
        fields = '__all__'

class ProductoSerializer(serializers.ModelSerializer):
    categoria = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all())
    subcategoria = serializers.PrimaryKeyRelatedField(queryset=Subcategoria.objects.all(), allow_null=True, required=False)
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

class ConfiguracionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Configuracion
        fields = '__all__'

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'

class ImpuestoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Impuesto
        fields = '__all__'

class OrdenCargoSerializer(serializers.ModelSerializer):
    orden = serializers.PrimaryKeyRelatedField(queryset=Orden.objects.all(), write_only=True, required=False)
    class Meta:
        model = OrdenCargo
        fields = '__all__'

    def validate(self, data):
        # Validar que el cargo esté permitido para el tipo de orden
        orden = data.get('orden')
        tipo_cargo = data.get('tipo_cargo')
        if orden and tipo_cargo:
            # Buscar el TipoOrden correspondiente
            from .models import TipoOrden
            tipo_orden_obj = TipoOrden.objects.filter(nombre=orden.tipo).first()
            cargos_permitidos = set(tipo_orden_obj.cargos.all()) if tipo_orden_obj else set()
            if tipo_cargo not in cargos_permitidos:
                raise serializers.ValidationError(f"El cargo '{tipo_cargo.nombre}' no está permitido para el tipo de orden '{orden.tipo}'.")
        return data

    def create(self, validated_data):
        tipo_cargo = validated_data['tipo_cargo']
        # Copiar monto y tipo desde el catálogo (TipoCargo)
        # NOTA: Se asume que TipoCargo tiene los campos 'monto' y 'tipo'. Si no existen, debes agregarlos al modelo.
        validated_data['monto_aplicado'] = tipo_cargo.monto
        validated_data['tipo_aplicado'] = tipo_cargo.tipo
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # No permitir cambiar monto_aplicado/tipo_aplicado manualmente
        tipo_cargo = validated_data.get('tipo_cargo', instance.tipo_cargo)
        validated_data['monto_aplicado'] = tipo_cargo.monto
        validated_data['tipo_aplicado'] = tipo_cargo.tipo
        return super().update(instance, validated_data)

class OrdenLineaSerializer(serializers.ModelSerializer):
    orden = serializers.PrimaryKeyRelatedField(queryset=Orden.objects.all(), write_only=True, required=False)
    class Meta:
        model = OrdenLinea
        fields = '__all__'

    def validate(self, data):
        # Validar que el impuesto esté permitido para el tipo de orden
        orden = data.get('orden')
        impuesto = data.get('impuesto')
        if orden and impuesto:
            try:
                # Buscar el TipoOrden correspondiente
                tipo_orden_obj = None
                if hasattr(orden, 'tipo') and hasattr(orden.tipo, 'impuestos'):
                    impuestos_permitidos = set(orden.tipo.impuestos.values_list('id', flat=True))
                else:
                    from .models import TipoOrden
                    tipo_orden_obj = TipoOrden.objects.filter(nombre=orden.tipo).first()
                    impuestos_permitidos = set(tipo_orden_obj.impuestos.values_list('id', flat=True)) if tipo_orden_obj else set()
                if impuesto.id not in impuestos_permitidos:
                    raise serializers.ValidationError(f"El impuesto '{impuesto.nombre}' no está permitido para el tipo de orden '{orden.tipo}'.")
            except Exception as e:
                raise serializers.ValidationError(f"Error de validación de impuesto: {e}")
        return data

class OrdenSerializer(serializers.ModelSerializer):
    lineas = OrdenLineaSerializer(many=True, read_only=True)
    cargos = OrdenCargoSerializer(many=True, read_only=True)
    class Meta:
        model = Orden
        fields = '__all__'

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        # Asegura que cargos e impuestos siempre sean listas (vacías si corresponde)
        rep['cargos'] = list(instance.cargos.values_list('id', flat=True))
        rep['impuestos'] = list(instance.impuestos.values_list('id', flat=True))
        return rep

class TipoOrdenSerializer(serializers.ModelSerializer):
    cargos = serializers.PrimaryKeyRelatedField(queryset=TipoCargo.objects.all(), many=True, required=True)
    impuestos = serializers.PrimaryKeyRelatedField(queryset=Impuesto.objects.all(), many=True, required=True)

    class Meta:
        model = TipoOrden
        fields = '__all__'
        extra_kwargs = {'nombre': {'required': True}}

    def validate(self, data):
        # Rechazar campos extra
        allowed = set(self.fields.keys())
        extra = set(self.initial_data.keys()) - allowed
        if extra:
            raise serializers.ValidationError({k: 'Campo no permitido.' for k in extra})
        return data

    def validate_cargos(self, value):
        # No permitir duplicados
        if len(value) != len(set(value)):
            raise serializers.ValidationError("No se permiten cargos duplicados.")
        return value

    def validate_impuestos(self, value):
        if len(value) != len(set(value)):
            raise serializers.ValidationError("No se permiten impuestos duplicados.")
        return value

    def update(self, instance, validated_data):
        cargos = validated_data.pop('cargos', None)
        impuestos = validated_data.pop('impuestos', None)
        instance = super().update(instance, validated_data)
        if cargos is not None:
            instance.cargos.set(cargos)
        if impuestos is not None:
            instance.impuestos.set(impuestos)
        return instance

class TipoCargoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoCargo
        fields = '__all__'

# --- ADMIN ---
class OrdenCargoInline(admin.TabularInline):
    model = OrdenCargo
    extra = 1

class OrdenLineaInline(admin.TabularInline):
    model = OrdenLinea
    extra = 1

@admin.register(Orden)
class OrdenAdmin(admin.ModelAdmin):
    list_display = ('id', 'cliente', 'tipo', 'estado', 'fecha_creacion', 'total_comprobante')
    inlines = [OrdenLineaInline, OrdenCargoInline]
    search_fields = ('cliente__username',)
    list_filter = ('tipo', 'estado')

@admin.register(OrdenLinea)
class OrdenLineaAdmin(admin.ModelAdmin):
    list_display = ('id', 'orden', 'producto', 'cantidad', 'precio_unitario', 'total_linea')
    search_fields = ('orden__id', 'producto__nombre')

@admin.register(OrdenCargo)
class OrdenCargoAdmin(admin.ModelAdmin):
    list_display = ('id', 'orden', 'tipo_cargo', 'monto_aplicado', 'tipo_aplicado', 'impuesto')
    search_fields = ('orden__id', 'tipo_cargo__nombre')
    list_filter = ('tipo_cargo', 'impuesto')

@admin.register(Impuesto)
class ImpuestoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'codigo', 'tarifa', 'es_exento')
    search_fields = ('nombre', 'codigo')
    list_filter = ('es_exento',)

# Elimina el registro de Factura aquí para evitar el error de AlreadyRegistered
# El registro de Factura debe estar solo en admin.py o solo aquí, pero no en ambos.

# --- SEÑALES PARA RECALCULAR TOTALES DE ORDEN ---
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

@receiver([post_save, post_delete], sender=OrdenLinea)
def recalcular_totales_orden_linea(sender, instance, **kwargs):
    orden = instance.orden
    if orden:
        orden.calcular_totales()

@receiver([post_save, post_delete], sender=OrdenCargo)
def recalcular_totales_orden_cargo(sender, instance, **kwargs):
    orden = instance.orden
    if orden:
        orden.calcular_totales()
