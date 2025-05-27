from django.test import TestCase
from django.contrib.auth.models import User
from orders.models import Producto, Pedido, PedidoProducto, Factura, Categoria, PedidoSerializer, PedidoProductoSerializer, ProductoSerializer
from rest_framework.exceptions import ValidationError as DRFValidationError

class PedidoSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(username='cliente')
        self.categoria = Categoria.objects.create(nombre='Cat')
        self.producto = Producto.objects.create(nombre='Test', precio=10, cantidad=5, disponible=True, categoria=self.categoria)

    def test_direccion_entrega_no_vacia(self):
        data = {'cliente': self.user.id, 'direccion_entrega': '', 'contacto': '123', 'estado': 'pendiente'}
        serializer = PedidoSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('direccion_entrega', serializer.errors)

    def test_contacto_no_vacio(self):
        data = {'cliente': self.user.id, 'direccion_entrega': 'Calle 1', 'contacto': '', 'estado': 'pendiente'}
        serializer = PedidoSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('contacto', serializer.errors)

    def test_estado_invalido(self):
        data = {'cliente': self.user.id, 'direccion_entrega': 'Calle 1', 'contacto': '123', 'estado': 'inexistente'}
        serializer = PedidoSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('estado', serializer.errors)

class PedidoProductoSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(username='cliente')
        self.categoria = Categoria.objects.create(nombre='Cat')
        self.producto = Producto.objects.create(nombre='Test', precio=10, cantidad=5, disponible=True, categoria=self.categoria)
        self.pedido = Pedido.objects.create(cliente=self.user, direccion_entrega='Calle 1', contacto='123', estado='pendiente')

    def test_cantidad_positiva(self):
        data = {'pedido': self.pedido.id, 'producto': self.producto.id, 'cantidad': 0, 'precio_unitario': 10}
        serializer = PedidoProductoSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('cantidad', serializer.errors)

    def test_precio_unitario_positivo(self):
        data = {'pedido': self.pedido.id, 'producto': self.producto.id, 'cantidad': 1, 'precio_unitario': 0}
        serializer = PedidoProductoSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('precio_unitario', serializer.errors)

    def test_producto_disponible(self):
        self.producto.disponible = False
        self.producto.save()
        data = {'pedido': self.pedido.id, 'producto': self.producto.id, 'cantidad': 1, 'precio_unitario': 10}
        serializer = PedidoProductoSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('producto', serializer.errors)

class ProductoSerializerTest(TestCase):
    def setUp(self):
        self.categoria = Categoria.objects.create(nombre='Cat')
    def test_precio_positivo(self):
        data = {'nombre': 'Test', 'precio': -1, 'cantidad': 1, 'disponible': True, 'categoria': self.categoria.id}
        serializer = ProductoSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('precio', serializer.errors)
    def test_nombre_unico(self):
        Producto.objects.create(nombre='Unico', precio=10, cantidad=1, disponible=True, categoria=self.categoria)
        data = {'nombre': 'Unico', 'precio': 10, 'cantidad': 1, 'disponible': True, 'categoria': self.categoria.id}
        serializer = ProductoSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('nombre', serializer.errors)
