from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group
from orders.models import Producto, Pedido, PedidoProducto, Factura, Ruta, Entrega, ClienteRuta, Categoria, Subcategoria, Impuesto, TipoCargo, TipoOrden, Orden, OrdenLinea, OrdenCargo, Configuracion, Profile
from django.db import transaction

class Command(BaseCommand):
    help = 'Pobla la base de datos con datos de prueba realistas en español para el Distrito Central de Cañas, Guanacaste.'

    @transaction.atomic
    def handle(self, *args, **kwargs):
        # Crear grupos de roles si no existen
        roles = ['Administrador', 'Cliente', 'Vendedor', 'Repartidor']
        for role in roles:
            Group.objects.get_or_create(name=role)

        # Usuarios
        admin, _ = User.objects.get_or_create(username='admin', defaults={'email': 'admin@demo.com', 'is_staff': True, 'is_superuser': True})
        admin.set_password('admin123')
        admin.save()
        admin.groups.add(Group.objects.get(name='Administrador'))

        cliente, _ = User.objects.get_or_create(username='cliente', defaults={'email': 'cliente@demo.com'})
        cliente.set_password('cliente123')
        cliente.save()
        cliente.groups.add(Group.objects.get(name='Cliente'))

        vendedor, _ = User.objects.get_or_create(username='vendedor', defaults={'email': 'vendedor@demo.com'})
        vendedor.set_password('vendedor123')
        vendedor.save()
        vendedor.groups.add(Group.objects.get(name='Vendedor'))

        repartidor, _ = User.objects.get_or_create(username='repartidor', defaults={'email': 'repartidor@demo.com'})
        repartidor.set_password('repartidor123')
        repartidor.save()
        repartidor.groups.add(Group.objects.get(name='Repartidor'))

        # Categorías y Subcategorías
        categorias_data = {
            'Desayuno': ['Típico'],
            'Almuerzo': ['Casado'],
            'Bebidas': ['Natural'],
            'Snacks': ['Empanadas'],
        }
        categorias_objs = {}
        subcategorias_objs = {}
        for cat, subs in categorias_data.items():
            categoria_obj, _ = Categoria.objects.get_or_create(nombre=cat)
            categorias_objs[cat] = categoria_obj
            for sub in subs:
                subcat_obj, _ = Subcategoria.objects.get_or_create(nombre=sub, categoria=categoria_obj)
                subcategorias_objs[(cat, sub)] = subcat_obj

        # Productos
        productos = [
            {'nombre': 'Gallo Pinto', 'precio': 2500, 'descripcion': 'Desayuno típico costarricense', 'categoria': 'Desayuno', 'subcategoria': 'Típico'},
            {'nombre': 'Casado de Pollo', 'precio': 3500, 'descripcion': 'Arroz, frijoles, ensalada, plátano y pollo', 'categoria': 'Almuerzo', 'subcategoria': 'Casado'},
            {'nombre': 'Refresco Natural', 'precio': 1000, 'descripcion': 'Bebida de frutas frescas', 'categoria': 'Bebidas', 'subcategoria': 'Natural'},
            {'nombre': 'Empanada de Queso', 'precio': 800, 'descripcion': 'Empanada artesanal rellena de queso', 'categoria': 'Snacks', 'subcategoria': 'Empanadas'},
        ]
        producto_objs = []
        for p in productos:
            categoria_obj = categorias_objs[p['categoria']]
            subcategoria_obj = subcategorias_objs[(p['categoria'], p['subcategoria'])]
            obj, _ = Producto.objects.get_or_create(
                nombre=p['nombre'],
                defaults={
                    'precio': p['precio'],
                    'descripcion': p['descripcion'],
                    'categoria': categoria_obj,
                    'subcategoria': subcategoria_obj
                }
            )
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

        # Impuestos
        impuestos_data = [
            {'nombre': 'IVA', 'codigo': '01', 'tarifa': 13.0, 'es_exento': False},
            {'nombre': 'Exento', 'codigo': '02', 'tarifa': 0.0, 'es_exento': True},
            {'nombre': 'Consumo', 'codigo': '03', 'tarifa': 2.0, 'es_exento': False},
        ]
        impuesto_objs = []
        for imp in impuestos_data:
            obj, _ = Impuesto.objects.get_or_create(**imp)
            impuesto_objs.append(obj)

        # TipoCargo (catálogo de cargos)
        cargos_data = [
            {'nombre': 'Servicio', 'descripcion': 'Cargo por servicio en mesa', 'monto': 500, 'tipo': 'SERVICIO'},
            {'nombre': 'Embalaje', 'descripcion': 'Cargo por empaque para llevar', 'monto': 200, 'tipo': 'EMBALAJE'},
            {'nombre': 'Transporte', 'descripcion': 'Cargo por envío a domicilio', 'monto': 1000, 'tipo': 'TRANSPORTE'},
            {'nombre': 'Propina', 'descripcion': 'Propina sugerida', 'monto': 300, 'tipo': 'OTRO'},
        ]
        tipocargo_objs = []
        for c in cargos_data:
            obj, _ = TipoCargo.objects.get_or_create(**c)
            tipocargo_objs.append(obj)

        # TipoOrden (asociar cargos e impuestos)
        tipoorden_data = [
            {'nombre': 'Salón', 'descripcion': 'Pedidos en salón', 'cargos': [tipocargo_objs[0], tipocargo_objs[3]], 'impuestos': [impuesto_objs[0]]},
            {'nombre': 'Para llevar', 'descripcion': 'Pedidos para llevar', 'cargos': [tipocargo_objs[1]], 'impuestos': [impuesto_objs[0], impuesto_objs[1]]},
            {'nombre': 'Express', 'descripcion': 'Pedidos express', 'cargos': [tipocargo_objs[2]], 'impuestos': [impuesto_objs[0], impuesto_objs[2]]},
        ]
        tipoorden_objs = []
        for t in tipoorden_data:
            obj, _ = TipoOrden.objects.get_or_create(nombre=t['nombre'], defaults={'descripcion': t['descripcion']})
            obj.cargos.set(t['cargos'])
            obj.impuestos.set(t['impuestos'])
            tipoorden_objs.append(obj)

        # Configuración
        Configuracion.objects.update_or_create(
            pk=1,
            defaults={
                'idioma': 'es',
                'nombre_restaurante': 'Soda La Central',
                'direccion': 'Parque Central, Cañas',
                'telefono': '8888-1111',
                'descripcion': 'Comida típica costarricense en el corazón de Cañas.'
            }
        )

        # Perfiles de usuario
        for user in [admin, cliente, vendedor, repartidor]:
            Profile.objects.get_or_create(user=user)

        # Crear varias órdenes, líneas y cargos
        for i in range(3):
            orden = Orden.objects.create(
                cliente=cliente,
                tipo=['SALON', 'LLEVAR', 'EXPRESS'][i % 3],
                estado='pendiente',
                direccion_entrega=f'Dirección demo {i+1}',
                contacto=f'8888-11{i+1}',
            )
            # Líneas de orden
            for j, prod in enumerate(producto_objs):
                OrdenLinea.objects.create(
                    orden=orden,
                    producto=prod,
                    cantidad=1+j,
                    unidad_medida='Unid',
                    detalle=f'{prod.nombre} especial',
                    precio_unitario=prod.precio,
                    subtotal=prod.precio * (1+j),
                    descuento=0,
                    impuesto=impuesto_objs[j % len(impuesto_objs)],
                    total_linea=prod.precio * (1+j),
                )
            # Cargos de orden
            for k, cargo in enumerate(tipocargo_objs):
                if k % 2 == i % 2:
                    OrdenCargo.objects.create(
                        orden=orden,
                        tipo_cargo=cargo,
                        monto_aplicado=cargo.monto,
                        tipo_aplicado=cargo.tipo,
                        impuesto=None
                    )

        self.stdout.write(self.style.SUCCESS('Datos de prueba creados exitosamente y enriquecidos.'))
