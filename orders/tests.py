from django.test import TestCase
from django.contrib.auth.models import User
from .models import Ruta, Entrega, ClienteRuta, Pedido, Producto

class RutaModelTest(TestCase):
    def test_creacion_ruta(self):
        ruta = Ruta.objects.create(nombre="Ruta 1", descripcion="Centro", activa=True)
        self.assertEqual(ruta.nombre, "Ruta 1")
        self.assertTrue(ruta.activa)

class ClienteRutaModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="cliente1", password="pass")
        self.ruta = Ruta.objects.create(nombre="Ruta 2")

    def test_creacion_clienteruta(self):
        cr = ClienteRuta.objects.create(cliente=self.user, ruta=self.ruta, latitud=19.4326, longitud=-99.1332, direccion="CDMX")
        self.assertEqual(cr.cliente.username, "cliente1")
        self.assertEqual(cr.ruta.nombre, "Ruta 2")
        self.assertEqual(float(cr.latitud), 19.4326)
        self.assertEqual(float(cr.longitud), -99.1332)
        self.assertEqual(cr.direccion, "CDMX")

class EntregaModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="repartidor1", password="pass")
        self.cliente = User.objects.create_user(username="cliente2", password="pass")
        self.ruta = Ruta.objects.create(nombre="Ruta 3")
        self.producto = Producto.objects.create(nombre="TestProd", precio=10)
        self.pedido = Pedido.objects.create(cliente=self.cliente, direccion_entrega="Calle 1", contacto="123", estado="pendiente")

    def test_creacion_entrega(self):
        entrega = Entrega.objects.create(pedido=self.pedido, repartidor=self.user, ruta=self.ruta, estado="pendiente")
        self.assertEqual(entrega.pedido, self.pedido)
        self.assertEqual(entrega.repartidor, self.user)
        self.assertEqual(entrega.ruta, self.ruta)
        self.assertEqual(entrega.estado, "pendiente")
        self.assertIsNone(entrega.fecha_entrega)
