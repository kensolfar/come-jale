from django.shortcuts import render
from rest_framework import viewsets
from .models import Producto, Pedido, Factura, Ruta, Entrega, ClienteRuta
from .models import ProductoSerializer, PedidoSerializer, FacturaSerializer, RutaSerializer, EntregaSerializer, ClienteRutaSerializer

# Create your views here.

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

class FacturaViewSet(viewsets.ModelViewSet):
    queryset = Factura.objects.all()
    serializer_class = FacturaSerializer

class RutaViewSet(viewsets.ModelViewSet):
    queryset = Ruta.objects.all()
    serializer_class = RutaSerializer

class EntregaViewSet(viewsets.ModelViewSet):
    queryset = Entrega.objects.all()
    serializer_class = EntregaSerializer

class ClienteRutaViewSet(viewsets.ModelViewSet):
    queryset = ClienteRuta.objects.all()
    serializer_class = ClienteRutaSerializer
