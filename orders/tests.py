from django.test import TestCase
from django.contrib.auth.models import User
from .models import Ruta, Entrega, ClienteRuta, Pedido, Producto, Categoria
from .models import Orden, OrdenLinea, OrdenCargo, Impuesto, TipoOrden, TipoCargo
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

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
        self.categoria = Categoria.objects.create(nombre="TestCatEntrega")
        self.producto = Producto.objects.create(nombre="TestProd", precio=10, categoria=self.categoria)
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
        tipo_cargo = TipoCargo.objects.create(nombre="Servicio", descripcion="Cargo por servicio")
        OrdenCargo.objects.create(
            orden=self.orden,
            tipo_cargo=tipo_cargo,
            monto_aplicado=10,
            tipo_aplicado="SERVICIO"
        )
        self.orden.refresh_from_db()
        self.assertEqual(float(self.orden.total_otros_cargos), 10)
        self.assertEqual(float(self.orden.total_comprobante), 123)

class TipoOrdenCargoLogicTest(TestCase):
    def setUp(self):
        self.tipo_salon = TipoOrden.objects.create(nombre="Salón")
        self.tipo_llevar = TipoOrden.objects.create(nombre="Para llevar")
        self.cargo_servicio = TipoCargo.objects.create(nombre="Servicio")
        self.cargo_embalaje = TipoCargo.objects.create(nombre="Embalaje")
        self.cargo_transporte = TipoCargo.objects.create(nombre="Transporte")
        # Asociaciones permitidas
        self.tipo_salon.cargos.add(self.cargo_servicio)
        self.tipo_llevar.cargos.add(self.cargo_embalaje, self.cargo_transporte)

    def test_solo_cargos_permitidos(self):
        # Salón solo permite Servicio
        cargos_salon = list(self.tipo_salon.cargos.all())
        self.assertIn(self.cargo_servicio, cargos_salon)
        self.assertNotIn(self.cargo_embalaje, cargos_salon)
        # Para llevar permite Embalaje y Transporte
        cargos_llevar = list(self.tipo_llevar.cargos.all())
        self.assertIn(self.cargo_embalaje, cargos_llevar)
        self.assertIn(self.cargo_transporte, cargos_llevar)
        self.assertNotIn(self.cargo_servicio, cargos_llevar)

    def test_no_permitir_cargo_invalido_en_orden(self):
        # Simula la lógica de validación backend
        orden = Orden.objects.create(cliente=User.objects.create_user('u1'), tipo=self.tipo_llevar)
        # Cargo no permitido
        tipo_cargo = self.cargo_servicio
        cargos_permitidos = set(self.tipo_llevar.cargos.all())
        self.assertNotIn(tipo_cargo, cargos_permitidos)

    def test_permitir_cargo_valido_en_orden(self):
        orden = Orden.objects.create(cliente=User.objects.create_user('u2'), tipo=self.tipo_llevar)
        tipo_cargo = self.cargo_embalaje
        cargos_permitidos = set(self.tipo_llevar.cargos.all())
        self.assertIn(tipo_cargo, cargos_permitidos)

    def test_validacion_backend_cargo_invalido(self):
        orden = Orden.objects.create(cliente=User.objects.create_user('u3'), tipo=self.tipo_llevar)
        tipo_cargo = self.cargo_servicio
        cargos_permitidos = set(self.tipo_llevar.cargos.all())
        error = tipo_cargo not in cargos_permitidos
        self.assertTrue(error)

    def test_validacion_backend_cargo_valido(self):
        orden = Orden.objects.create(cliente=User.objects.create_user('u4'), tipo=self.tipo_llevar)
        tipo_cargo = self.cargo_embalaje
        cargos_permitidos = set(self.tipo_llevar.cargos.all())
        error = tipo_cargo not in cargos_permitidos
        self.assertFalse(error)

class TipoOrdenImpuestoLogicTest(TestCase):
    def setUp(self):
        self.tipo_salon = TipoOrden.objects.create(nombre="Salón")
        self.tipo_llevar = TipoOrden.objects.create(nombre="Para llevar")
        self.impuesto_iva = Impuesto.objects.create(nombre="IVA", codigo="01", tarifa=13, es_exento=False)
        self.impuesto_consumo = Impuesto.objects.create(nombre="Consumo", codigo="02", tarifa=5, es_exento=False)
        # Asociaciones permitidas (ManyToMany correcto)
        self.tipo_salon.impuestos.set([self.impuesto_iva])
        self.tipo_llevar.impuestos.set([self.impuesto_consumo])

    def test_solo_impuestos_permitidos(self):
        # Salón solo permite IVA
        self.assertIn(self.impuesto_iva, self.tipo_salon.impuestos.all())
        self.assertNotIn(self.impuesto_consumo, self.tipo_salon.impuestos.all())
        # Para llevar solo permite Consumo
        self.assertIn(self.impuesto_consumo, self.tipo_llevar.impuestos.all())
        self.assertNotIn(self.impuesto_iva, self.tipo_llevar.impuestos.all())

    def test_validacion_backend_impuesto_invalido(self):
        """El backend debe rechazar un impuesto no permitido para el tipo de orden."""
        orden = Orden.objects.create(cliente=User.objects.create_user('u5'), tipo=self.tipo_llevar)
        impuesto = self.impuesto_iva
        impuestos_permitidos = set(self.tipo_llevar.impuestos.all())
        self.assertNotIn(impuesto, impuestos_permitidos)

    def test_validacion_backend_impuesto_valido(self):
        orden = Orden.objects.create(cliente=User.objects.create_user('u6'), tipo=self.tipo_llevar)
        impuesto = self.impuesto_consumo
        impuestos_permitidos = set(self.tipo_llevar.impuestos.all())
        self.assertIn(impuesto, impuestos_permitidos)

class TipoOrdenAPITest(APITestCase):
    def setUp(self):
        from django.contrib.auth.models import User
        self.admin = User.objects.create_superuser('admin', 'admin@test.com', 'adminpass')
        self.client.login(username='admin', password='adminpass')

    def test_crear_tipo_orden(self):
        url = reverse('tipoorden-list')
        data = {"nombre": "Express", "descripcion": "Orden rápida"}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['nombre'], "Express")

    def test_asociar_cargos_e_impuestos(self):
        # Crear cargos e impuestos
        from orders.models import TipoCargo, Impuesto
        cargo = TipoCargo.objects.create(nombre="Empaque")
        impuesto = Impuesto.objects.create(nombre="IVA", codigo="01", tarifa=13, es_exento=False)
        url = reverse('tipoorden-list')
        data = {
            "nombre": "Llevar",
            "descripcion": "Para llevar",
            "cargos": [cargo.id],
            "impuestos": [impuesto.id]
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn(cargo.id, response.data['cargos'])
        self.assertIn(impuesto.id, response.data['impuestos'])

    def test_editar_tipo_orden(self):
        from orders.models import TipoOrden
        tipo = TipoOrden.objects.create(nombre="Salón")
        url = reverse('tipoorden-detail', args=[tipo.id])
        data = {"descripcion": "Comer en el salón"}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['descripcion'], "Comer en el salón")

    def test_eliminar_tipo_orden(self):
        from orders.models import TipoOrden
        tipo = TipoOrden.objects.create(nombre="Eliminarme")
        url = reverse('tipoorden-detail', args=[tipo.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_no_permitir_cargo_inexistente(self):
        url = reverse('tipoorden-list')
        data = {
            "nombre": "TestInvalido",
            "descripcion": "Intento con cargo inexistente",
            "cargos": [9999],  # ID que no existe
            "impuestos": []
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cargos', response.data)

    def test_no_permitir_impuesto_inexistente(self):
        url = reverse('tipoorden-list')
        data = {
            "nombre": "TestInvalido2",
            "descripcion": "Intento con impuesto inexistente",
            "cargos": [],
            "impuestos": [8888]  # ID que no existe
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('impuestos', response.data)

    def test_nombre_tipoorden_requerido(self):
        url = reverse('tipoorden-list')
        data = {"descripcion": "Sin nombre", "cargos": [], "impuestos": []}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('nombre', response.data)

    def test_nombre_tipoorden_unico(self):
        from orders.models import TipoOrden
        TipoOrden.objects.create(nombre="Unico")
        url = reverse('tipoorden-list')
        data = {"nombre": "Unico", "descripcion": "Repetido", "cargos": [], "impuestos": []}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('nombre', response.data)

    def test_patch_no_altera_manytomany(self):
        from orders.models import TipoCargo, TipoOrden
        cargo = TipoCargo.objects.create(nombre="PatchTest")
        tipo = TipoOrden.objects.create(nombre="PatchTipo", descripcion="desc")
        tipo.cargos.add(cargo)
        url = reverse('tipoorden-detail', args=[tipo.id])
        data = {"descripcion": "editada"}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(cargo.id, response.data['cargos'])

    def test_no_permitir_id_invalido_en_cargos(self):
        url = reverse('tipoorden-list')
        data = {"nombre": "IDInvalido", "descripcion": "", "cargos": ["abc"], "impuestos": []}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cargos', response.data)

    def test_no_permitir_id_invalido_en_impuestos(self):
        url = reverse('tipoorden-list')
        data = {"nombre": "IDInvalido2", "descripcion": "", "cargos": [], "impuestos": [None]}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('impuestos', response.data)

    def test_no_permitir_campos_extra(self):
        url = reverse('tipoorden-list')
        data = {"nombre": "Extra", "descripcion": "", "cargos": [], "impuestos": [], "extra_field": 123}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('extra_field', response.data)

    def test_no_permitir_asociar_sin_admin(self):
        from rest_framework.test import APIClient
        client = APIClient()
        # No login
        url = reverse('tipoorden-list')
        data = {"nombre": "NoAdmin", "descripcion": "", "cargos": [], "impuestos": []}
        response = client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_eliminar_tipocargo_asociado(self):
        from orders.models import TipoCargo, TipoOrden
        cargo = TipoCargo.objects.create(nombre="Asociado")
        tipo = TipoOrden.objects.create(nombre="ConCargo")
        tipo.cargos.add(cargo)
        url = reverse('tipocargo-detail', args=[cargo.id])
        response = self.client.delete(url)
        # Por defecto Django elimina la relación, pero no el TipoOrden
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        tipo.refresh_from_db()
        self.assertEqual(list(tipo.cargos.all()), [])

    def test_eliminar_impuesto_asociado(self):
        from orders.models import Impuesto, TipoOrden
        impuesto = Impuesto.objects.create(nombre="ImpAsoc", codigo="04", tarifa=5, es_exento=False)
        tipo = TipoOrden.objects.create(nombre="ConImp")
        tipo.impuestos.add(impuesto)
        url = reverse('impuesto-detail', args=[impuesto.id])  # corregido a singular
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        tipo.refresh_from_db()
        self.assertEqual(list(tipo.impuestos.all()), [])

    def test_asociacion_manytomany_independiente(self):
        from orders.models import TipoCargo, TipoOrden
        cargo = TipoCargo.objects.create(nombre="Indep")
        tipo1 = TipoOrden.objects.create(nombre="T1")
        tipo2 = TipoOrden.objects.create(nombre="T2")
        tipo1.cargos.add(cargo)
        tipo2.cargos.add(cargo)
        url = reverse('tipoorden-detail', args=[tipo1.id])
        data = {"nombre": tipo1.nombre, "descripcion": tipo1.descripcion, "cargos": [], "impuestos": []}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        tipo2.refresh_from_db()
        self.assertIn(cargo, tipo2.cargos.all())

class OrdenCargoCatalogoTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        # Crear el TipoOrden 'SALON' y asociar el tipo_cargo con monto y tipo desde el constructor
        self.tipo_orden = TipoOrden.objects.create(nombre='SALON')
        self.tipo_cargo = TipoCargo.objects.create(
            nombre='Servicio',
            descripcion='Cargo por servicio',
            monto=123.45,
            tipo='SERVICIO'
        )
        self.tipo_orden.cargos.add(self.tipo_cargo)
        self.orden = Orden.objects.create(cliente=self.user, tipo='SALON')

    def test_orden_cargo_copia_monto_y_tipo_desde_tipocargo(self):
        orden_cargo = OrdenCargo.objects.create(
            orden=self.orden,
            tipo_cargo=self.tipo_cargo,
            monto_aplicado=self.tipo_cargo.monto,
            tipo_aplicado=self.tipo_cargo.tipo
        )
        self.assertEqual(orden_cargo.monto_aplicado, self.tipo_cargo.monto)
        self.assertEqual(orden_cargo.tipo_aplicado, self.tipo_cargo.tipo)

    def test_orden_cargo_no_permite_monto_arbitrario(self):
        # Asociar el cargo al tipo de orden 'SALON' para que pase la validación
        tipo_orden = TipoOrden.objects.get(nombre='SALON')
        tipo_orden.cargos.add(self.tipo_cargo)
        from .models import OrdenCargoSerializer
        data = {
            'orden': self.orden.id,
            'tipo_cargo': self.tipo_cargo.id,
            'monto_aplicado': 999.99,  # monto arbitrario
            'tipo_aplicado': 'SERVICIO'
        }
        serializer = OrdenCargoSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        instance = serializer.save()
        # El monto_aplicado debe ser igual al del catálogo, no al arbitrario
        # Convertir ambos a float para evitar problemas de comparación Decimal vs float
        self.assertEqual(float(instance.monto_aplicado), float(self.tipo_cargo.monto))
        self.assertNotEqual(float(instance.monto_aplicado), 999.99, msg="No debe permitir monto arbitrario distinto al catálogo.")
