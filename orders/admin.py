from django.contrib import admin
from .models import Categoria, Subcategoria, Producto, Pedido, PedidoProducto, Factura, Ruta, Entrega, ClienteRuta

class PedidoProductoInline(admin.TabularInline):
    model = PedidoProducto
    extra = 1
@admin.register(Subcategoria)
class SubcategoriaAdmin(admin.ModelAdmin):
    list_display = ("nombre", "categoria")
    search_fields = ("nombre",)
    list_filter = ("categoria",)

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ("nombre",)
    search_fields = ("nombre",)
    list_filter = ("nombre",)
    
@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ("nombre", "precio", "categoria", "subcategoria")
    search_fields = ("nombre", "categoria", "subcategoria")

@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ("id", "cliente", "estado", "fecha_creacion")
    list_filter = ("estado", "fecha_creacion")
    search_fields = ("cliente__username", "direccion_entrega")
    inlines = [PedidoProductoInline]

@admin.register(Factura)
class FacturaAdmin(admin.ModelAdmin):
    list_display = ("id", "pedido", "nombre_vendedor", "nombre_destinatario", "monto_total", "fecha_expedicion")
    search_fields = ("pedido__id", "nombre_vendedor", "nombre_destinatario")

@admin.register(PedidoProducto)
class PedidoProductoAdmin(admin.ModelAdmin):
    list_display = ("pedido", "producto", "cantidad", "precio_unitario")
    search_fields = ("pedido__id", "producto__nombre")

@admin.register(Ruta)
class RutaAdmin(admin.ModelAdmin):
    list_display = ("nombre", "activa")
    search_fields = ("nombre",)

@admin.register(Entrega)
class EntregaAdmin(admin.ModelAdmin):
    list_display = ("pedido", "repartidor", "ruta", "estado", "fecha_asignacion", "fecha_entrega")
    list_filter = ("estado", "ruta")
    search_fields = ("pedido__id", "repartidor__username")

@admin.register(ClienteRuta)
class ClienteRutaAdmin(admin.ModelAdmin):
    list_display = ("cliente", "ruta", "direccion", "latitud", "longitud")
    search_fields = ("cliente__username", "ruta__nombre", "direccion")

# Register your models here.
