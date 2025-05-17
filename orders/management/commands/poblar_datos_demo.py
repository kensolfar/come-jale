from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from orders.models import Producto, Pedido, PedidoProducto, Factura, Ruta, Entrega, ClienteRuta
from django.db import transaction

class Command(BaseCommand):
    help = 'Pobla la base de datos con datos de prueba realistas en español para el Distrito Central de Cañas, Guanacaste.'

    @transaction.atomic
    def handle(self, *args, **kwargs):
        # Usuarios
        admin, _ = User.objects.get_or_create(username='admin', defaults={'email': 'admin@demo.com', 'is_staff': True, 'is_superuser': True})
        admin.set_password('admin123')
        admin.save()
        cliente, _ = User.objects.get_or_create(username='cliente', defaults={'email': 'cliente@demo.com'})
        cliente.set_password('cliente123')
        cliente.save()
        vendedor, _ = User.objects.get_or_create(username='vendedor', defaults={'email': 'vendedor@demo.com'})
        vendedor.set_password('vendedor123')
        vendedor.save()
        repartidor, _ = User.objects.get_or_create(username='repartidor', defaults={'email': 'repartidor@demo.com'})
        repartidor.set_password('repartidor123')
        repartidor.save()

        # Productos
        productos = [
            {'nombre': 'Gallo Pinto', 'precio': 2500, 'descripcion': 'Desayuno típico costarricense', 'categoria': 'Desayuno', 'subcategoria': 'Típico'},
            {'nombre': 'Casado de Pollo', 'precio': 3500, 'descripcion': 'Arroz, frijoles, ensalada, plátano y pollo', 'categoria': 'Almuerzo', 'subcategoria': 'Casado'},
            {'nombre': 'Refresco Natural', 'precio': 1000, 'descripcion': 'Bebida de frutas frescas', 'categoria': 'Bebidas', 'subcategoria': 'Natural'},
            {'nombre': 'Empanada de Queso', 'precio': 800, 'descripcion': 'Empanada artesanal rellena de queso', 'categoria': 'Snacks', 'subcategoria': 'Empanadas'},
        ]
        producto_objs = []
        for p in productos:
            obj, _ = Producto.objects.get_or_create(nombre=p['nombre'], defaults=p)
            producto_objs.append(obj)

        # Rutas (Direcciones en Cañas, Guanacaste)
        rutas_data = [
            {'nombre': 'Ruta Central', 'descripcion': 'Centro de Cañas, Parque Central', 'activa': True},
            {'nombre': 'Ruta Barrio San José', 'descripcion': 'Barrio San José, cerca de la iglesia', 'activa': True},
            {'nombre': 'Ruta Barrio Lajas', 'descripcion': 'Barrio Lajas, frente a la escuela', 'activa': True},
            {'nombre': 'Ruta Barrio Santa Lucía', 'descripcion': 'Barrio Santa Lucía, costado sur del Ebais', 'activa': True},
        ]
        ruta_objs = []
        for r in rutas_data:
            obj, _ = Ruta.objects.get_or_create(nombre=r['nombre'], defaults=r)
            ruta_objs.append(obj)

        # ClienteRuta (asociar cliente a rutas)
        ClienteRuta.objects.get_or_create(cliente=cliente, ruta=ruta_objs[0], latitud=10.4271, longitud=-85.0998, direccion='Parque Central, Cañas')
        ClienteRuta.objects.get_or_create(cliente=cliente, ruta=ruta_objs[1], latitud=10.4300, longitud=-85.0950, direccion='Barrio San José, Cañas')

        # Pedido y PedidoProducto
        pedido = Pedido.objects.create(
            cliente=cliente,
            vendedor=vendedor,
            repartidor=repartidor,
            direccion_entrega='Parque Central, Cañas',
            contacto='8888-1111',
            info_adicional='Entregar antes de las 12pm',
            estado='pendiente',
        )
        PedidoProducto.objects.create(pedido=pedido, producto=producto_objs[0], cantidad=2, precio_unitario=2500)
        PedidoProducto.objects.create(pedido=pedido, producto=producto_objs[2], cantidad=1, precio_unitario=1000)
        pedido.productos.set([producto_objs[0], producto_objs[2]])

        # Factura
        Factura.objects.create(
            pedido=pedido,
            nombre_vendedor='Soda La Central',
            domicilio_vendedor='Parque Central, Cañas',
            nombre_destinatario='Juan Pérez',
            domicilio_destinatario='Barrio San José, Cañas',
            descripcion_mercancias='Gallo Pinto x2, Refresco Natural x1',
            tipo_embalaje='Caja',
            marcas='-',
            numeros='-',
            clases='-',
            cantidades='3',
            termino_comercial='Contado',
            fletes=0,
            seguro=0,
            lugar_expedicion='Cañas',
            metodo_pago='Efectivo',
            monto_total=6000
        )

        # Entrega
        Entrega.objects.create(
            pedido=pedido,
            repartidor=repartidor,
            ruta=ruta_objs[0],
            estado='pendiente',
            ubicacion_actual='En cocina'
        )

        self.stdout.write(self.style.SUCCESS('Datos de prueba creados exitosamente.'))
