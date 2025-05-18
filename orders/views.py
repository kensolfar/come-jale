from django.shortcuts import render
from rest_framework import viewsets
from .models import Producto, Pedido, Factura, Ruta, Entrega, ClienteRuta
from .models import ProductoSerializer, PedidoSerializer, FacturaSerializer, RutaSerializer, EntregaSerializer, ClienteRutaSerializer
from .permissions import IsAdmin, IsVendedor, IsRepartidor, IsCliente, IsAdminOrReadOnly, IsAdminOrVendedorOrCliente
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

# Create your views here.

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [IsAdminOrReadOnly | IsVendedor]

    @action(detail=True, methods=['post'], url_path='upload')
    def upload_image(self, request, pk=None):
        producto = self.get_object()
        file = request.FILES.get('imagen')
        if not file:
            return Response({'error': 'No se envió ninguna imagen.'}, status=status.HTTP_400_BAD_REQUEST)
        producto.imagen = file
        producto.save()
        return Response({'imagen': producto.imagen.url}, status=status.HTTP_200_OK)

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
