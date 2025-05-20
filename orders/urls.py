from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductoViewSet, PedidoViewSet, FacturaViewSet, RutaViewSet, EntregaViewSet, ClienteRutaViewSet, CategoriaViewSet, SubcategoriaViewSet

router = DefaultRouter()
router.register(r'productos', ProductoViewSet)
router.register(r'pedidos', PedidoViewSet)
router.register(r'facturas', FacturaViewSet)
router.register(r'rutas', RutaViewSet)
router.register(r'entregas', EntregaViewSet)
router.register(r'clientes-ruta', ClienteRutaViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'subcategorias', SubcategoriaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
