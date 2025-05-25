from django.test import TestCase
from django.contrib.auth.models import User
from .models import Ruta, Entrega, ClienteRuta, Pedido, Producto, Categoria
from .models import Orden, OrdenLinea, OrdenCargo, Impuesto

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

class OrdenSignalsTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="cliente_test", password="pass")
        self.categoria = Categoria.objects.create(nombre="TestCat")
        self.producto = Producto.objects.create(nombre="TestProd", precio=100, categoria=self.categoria)
        self.impuesto = Impuesto.objects.create(nombre="IVA", codigo="01", tarifa=13, es_exento=False)
        self.orden = Orden.objects.create(cliente=self.user, tipo="SALON")

    def test_recalculo_al_agregar_linea(self):
        OrdenLinea.objects.create(
            orden=self.orden,
            producto=self.producto,
            cantidad=2,
            unidad_medida="Unid",
            detalle="Prueba",
            precio_unitario=100,
            subtotal=200,
            descuento=0,
            impuesto=self.impuesto,
            total_linea=226  # 13% IVA
        )
        self.orden.refresh_from_db()
        self.assertEqual(float(self.orden.subtotal), 200)
        self.assertEqual(float(self.orden.total_impuestos), 26)
        self.assertEqual(float(self.orden.total_comprobante), 226)

    def test_recalculo_al_modificar_linea(self):
        linea = OrdenLinea.objects.create(
            orden=self.orden,
            producto=self.producto,
            cantidad=1,
            unidad_medida="Unid",
            detalle="Prueba",
            precio_unitario=100,
            subtotal=100,
            descuento=0,
            impuesto=self.impuesto,
            total_linea=113
        )
        linea.cantidad = 3
        linea.subtotal = 300
        linea.total_linea = 339
        linea.save()
        self.orden.refresh_from_db()
        self.assertEqual(float(self.orden.subtotal), 300)
        self.assertEqual(float(self.orden.total_impuestos), 39)
        self.assertEqual(float(self.orden.total_comprobante), 339)

    def test_recalculo_al_eliminar_linea(self):
        linea = OrdenLinea.objects.create(
            orden=self.orden,
            producto=self.producto,
            cantidad=1,
            unidad_medida="Unid",
            detalle="Prueba",
            precio_unitario=100,
            subtotal=100,
            descuento=0,
            impuesto=self.impuesto,
            total_linea=113
        )
        linea.delete()
        self.orden.refresh_from_db()
        self.assertEqual(float(self.orden.subtotal), 0)
        self.assertEqual(float(self.orden.total_impuestos), 0)
        self.assertEqual(float(self.orden.total_comprobante), 0)

    def test_recalculo_al_agregar_cargo(self):
        OrdenLinea.objects.create(
            orden=self.orden,
            producto=self.producto,
            cantidad=1,
            unidad_medida="Unid",
            detalle="Prueba",
            precio_unitario=100,
            subtotal=100,
            descuento=0,
            impuesto=self.impuesto,
            total_linea=113
        )
        OrdenCargo.objects.create(
            orden=self.orden,
            nombre="Servicio",
            tipo="SERVICIO",
            monto=10,
            porcentaje=None,
            es_impuesto=False
        )
        self.orden.refresh_from_db()
        self.assertEqual(float(self.orden.total_otros_cargos), 10)
        self.assertEqual(float(self.orden.total_comprobante), 123)
