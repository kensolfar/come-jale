from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter
from .views import ProductoViewSet, PedidoViewSet, FacturaViewSet, RutaViewSet, EntregaViewSet, ClienteRutaViewSet, CategoriaViewSet, SubcategoriaViewSet, ProfileViewSet, ConfiguracionViewSet, OrdenViewSet, OrdenLineaViewSet, OrdenCargoViewSet, ImpuestoViewSet

router = DefaultRouter()
router.register(r'productos', ProductoViewSet)
router.register(r'pedidos', PedidoViewSet)
router.register(r'facturas', FacturaViewSet)
router.register(r'rutas', RutaViewSet)
router.register(r'entregas', EntregaViewSet)
router.register(r'clientes-ruta', ClienteRutaViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'subcategorias', SubcategoriaViewSet)
router.register(r'perfiles', ProfileViewSet, basename='profile')
router.register(r'configuracion', ConfiguracionViewSet, basename='configuracion')
router.register(r'ordenes', OrdenViewSet)
router.register(r'ordenes-lineas', OrdenLineaViewSet)
router.register(r'ordenes-cargos', OrdenCargoViewSet)
router.register(r'impuestos', ImpuestoViewSet)

# Nested routers for ordenes/{orden_pk}/lineas and ordenes/{orden_pk}/cargos
ordenes_router = NestedDefaultRouter(router, r'ordenes', lookup='orden')
ordenes_router.register(r'lineas', OrdenLineaViewSet, basename='orden-lineas')
ordenes_router.register(r'cargos', OrdenCargoViewSet, basename='orden-cargos')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(ordenes_router.urls)),
]
