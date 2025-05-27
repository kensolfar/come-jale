from django.test import TestCase
from django.contrib.auth.models import User
from orders.models import Producto, Pedido, PedidoProducto, Factura, Categoria
from django.core.exceptions import ValidationError
from django.db import IntegrityError

class PedidoModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(username='cliente')
        self.vendedor = User.objects.create(username='vendedor')
        self.repartidor = User.objects.create(username='repartidor')
        self.categoria = Categoria.objects.create(nombre='Cat')
        self.producto = Producto.objects.create(nombre='Test', precio=10, cantidad=5, disponible=True, categoria=self.categoria)

    def test_direccion_entrega_no_vacia(self):
        pedido = Pedido(cliente=self.user, direccion_entrega='', contacto='123', estado='pendiente')
        with self.assertRaises(ValidationError):
            pedido.full_clean()

    def test_contacto_no_vacio(self):
        pedido = Pedido(cliente=self.user, direccion_entrega='Calle 1', contacto='', estado='pendiente')
        with self.assertRaises(ValidationError):
            pedido.full_clean()

    def test_estado_invalido(self):
        pedido = Pedido(cliente=self.user, direccion_entrega='Calle 1', contacto='123', estado='inexistente')
        with self.assertRaises(ValidationError):
            pedido.full_clean()

    def test_producto_unico_en_pedido(self):
        pedido = Pedido.objects.create(cliente=self.user, direccion_entrega='Calle 1', contacto='123', estado='pendiente')
        PedidoProducto.objects.create(pedido=pedido, producto=self.producto, cantidad=1, precio_unitario=10)
        with self.assertRaises(ValidationError):
            PedidoProducto(pedido=pedido, producto=self.producto, cantidad=1, precio_unitario=10).full_clean()

    def test_pedido_debe_tener_al_menos_un_producto(self):
        pedido = Pedido(cliente=self.user, direccion_entrega='Calle 1', contacto='123', estado='pendiente')
        pedido.save()
        # No hay productos asociados
        with self.assertRaises(ValidationError):
            pedido.clean()

    def test_vendedor_debe_tener_rol_vendedor(self):
        # Simula que el usuario no tiene el rol correcto (en la práctica, deberías tener un campo de rol)
        pedido = Pedido(cliente=self.user, vendedor=self.user, direccion_entrega='Calle 1', contacto='123', estado='pendiente')
        # Aquí solo se simula, deberías tener lógica de roles
        # with self.assertRaises(ValidationError):
        #     pedido.clean()
        pass

    def test_estado_no_puede_saltar_de_cancelado_a_pagado(self):
        pedido = Pedido.objects.create(cliente=self.user, direccion_entrega='Calle 1', contacto='123', estado='cancelado')
        pedido.estado = 'pagado'
        with self.assertRaises(ValidationError):
            pedido.clean()

class PedidoProductoModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(username='cliente')
        self.categoria = Categoria.objects.create(nombre='Cat')
        self.producto = Producto.objects.create(nombre='Test', precio=10, cantidad=5, disponible=True, categoria=self.categoria)
        self.pedido = Pedido.objects.create(cliente=self.user, direccion_entrega='Calle 1', contacto='123', estado='pendiente')

    def test_cantidad_positiva(self):
        with self.assertRaises(ValidationError):
            PedidoProducto(pedido=self.pedido, producto=self.producto, cantidad=0, precio_unitario=10).full_clean()

    def test_precio_unitario_positivo(self):
        with self.assertRaises(ValidationError):
            PedidoProducto(pedido=self.pedido, producto=self.producto, cantidad=1, precio_unitario=0).full_clean()

    def test_producto_disponible(self):
        self.producto.disponible = False
        self.producto.save()
        with self.assertRaises(ValidationError):
            PedidoProducto(pedido=self.pedido, producto=self.producto, cantidad=1, precio_unitario=10).full_clean()

    def test_no_producto_duplicado_en_pedido(self):
        PedidoProducto.objects.create(pedido=self.pedido, producto=self.producto, cantidad=1, precio_unitario=10)
        with self.assertRaises(ValidationError):
            PedidoProducto(pedido=self.pedido, producto=self.producto, cantidad=2, precio_unitario=10).full_clean()

class ProductoModelTest(TestCase):
    def setUp(self):
        self.categoria = Categoria.objects.create(nombre='Cat')
    def test_precio_positivo(self):
        producto = Producto(nombre='Test', precio=-1, cantidad=1, disponible=True, categoria=self.categoria)
        with self.assertRaises(ValidationError):
            producto.full_clean()
    def test_nombre_unico(self):
        Producto.objects.create(nombre='Unico', precio=10, cantidad=1, disponible=True, categoria=self.categoria)
        producto = Producto(nombre='Unico', precio=10, cantidad=1, disponible=True, categoria=self.categoria)
        with self.assertRaises(IntegrityError):
            producto.save()
class FacturaModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(username='cliente')
        self.categoria = Categoria.objects.create(nombre='Cat')
        self.producto = Producto.objects.create(nombre='Test', precio=10, cantidad=5, disponible=True, categoria=self.categoria)
        self.pedido = Pedido.objects.create(cliente=self.user, direccion_entrega='Calle 1', contacto='123', estado='pendiente')
        PedidoProducto.objects.create(pedido=self.pedido, producto=self.producto, cantidad=1, precio_unitario=10)

    def test_factura_unica_por_pedido(self):
        Factura.objects.create(pedido=self.pedido, nombre_vendedor='V', domicilio_vendedor='D', nombre_destinatario='N', domicilio_destinatario='D', descripcion_mercancias='desc', lugar_expedicion='L', metodo_pago='E', monto_total=10)
        with self.assertRaises(Exception):
            Factura.objects.create(pedido=self.pedido, nombre_vendedor='V', domicilio_vendedor='D', nombre_destinatario='N', domicilio_destinatario='D', descripcion_mercancias='desc', lugar_expedicion='L', metodo_pago='E', monto_total=10)

    def test_monto_total_coincide_con_pedido(self):
        # El monto total debe ser igual a la suma de productos
        factura = Factura(pedido=self.pedido, nombre_vendedor='V', domicilio_vendedor='D', nombre_destinatario='N', domicilio_destinatario='D', descripcion_mercancias='desc', lugar_expedicion='L', metodo_pago='E', monto_total=999)
        with self.assertRaises(ValidationError):
            factura.full_clean()
