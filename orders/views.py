from django.shortcuts import render
from rest_framework import viewsets
from .models import Producto, Pedido, Factura, Ruta, Entrega, ClienteRuta
from .models import ProductoSerializer, PedidoSerializer, FacturaSerializer, RutaSerializer, EntregaSerializer, ClienteRutaSerializer
from .permissions import IsAdmin, IsVendedor, IsRepartidor, IsCliente, IsAdminOrReadOnly, IsAdminOrVendedorOrCliente

# Create your views here.

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [IsAdminOrReadOnly | IsVendedor]

class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name='Cliente').exists():
            return Pedido.objects.filter(cliente=user)
        return Pedido.objects.all()

    def get_permissions(self):
        if self.action in ['create']:
            return [IsCliente()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdmin(), IsVendedor()]
        # Permitir a clientes, admin y vendedor listar/detallar
        if self.action in ['list', 'retrieve']:
            return [IsAdminOrVendedorOrCliente()]
        return [IsAdmin(), IsVendedor()]

class FacturaViewSet(viewsets.ModelViewSet):
    queryset = Factura.objects.all()
    serializer_class = FacturaSerializer
    permission_classes = [IsAdmin | IsVendedor]

class RutaViewSet(viewsets.ModelViewSet):
    queryset = Ruta.objects.all()
    serializer_class = RutaSerializer
    permission_classes = [IsAdminOrReadOnly]

class EntregaViewSet(viewsets.ModelViewSet):
    queryset = Entrega.objects.all()
    serializer_class = EntregaSerializer
    permission_classes = [IsAdmin | IsRepartidor]

class ClienteRutaViewSet(viewsets.ModelViewSet):
    queryset = ClienteRuta.objects.all()
    serializer_class = ClienteRutaSerializer
    permission_classes = [IsAdmin | IsCliente]
