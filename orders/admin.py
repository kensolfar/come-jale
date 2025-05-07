from django.contrib import admin
from .models import Producto, Pedido, PedidoProducto, Factura

class PedidoProductoInline(admin.TabularInline):
    model = PedidoProducto
    extra = 1

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

# PedidoProducto no se registra directamente, solo como inline
# Register your models here.
