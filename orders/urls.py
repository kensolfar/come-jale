from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductoViewSet, PedidoViewSet, FacturaViewSet

router = DefaultRouter()
router.register(r'productos', ProductoViewSet)
router.register(r'pedidos', PedidoViewSet)
router.register(r'facturas', FacturaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
