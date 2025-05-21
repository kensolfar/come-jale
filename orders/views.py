from rest_framework import viewsets
from .models import Producto, Pedido, Factura, Ruta, Entrega, ClienteRuta, Categoria, Subcategoria
from .models import ProductoSerializer, PedidoSerializer, FacturaSerializer, RutaSerializer, EntregaSerializer, ClienteRutaSerializer, CategoriaSerializer, SubcategoriaSerializer
from .permissions import IsAdmin, IsVendedor, IsRepartidor, IsCliente, IsAdminOrReadOnly, IsAdminOrVendedorOrCliente
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django_filters.rest_framework import DjangoFilterBackend
from .models import Profile, ProfileSerializer
from rest_framework.permissions import IsAuthenticated
from .models import Configuracion, ConfiguracionSerializer
from rest_framework.permissions import IsAdminUser
from rest_framework import permissions

# Create your views here.

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [IsAdminOrReadOnly | IsVendedor]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['nombre', 'categoria', 'subcategoria', 'disponible', 'precio', 'fecha_creacion']

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
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['cliente', 'vendedor', 'repartidor', 'estado', 'fecha_creacion']

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
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['pedido', 'nombre_vendedor', 'nombre_destinatario', 'fecha_expedicion', 'metodo_pago']

class RutaViewSet(viewsets.ModelViewSet):
    queryset = Ruta.objects.all()
    serializer_class = RutaSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['nombre', 'activa']

class EntregaViewSet(viewsets.ModelViewSet):
    queryset = Entrega.objects.all()
    serializer_class = EntregaSerializer
    permission_classes = [IsAdmin | IsRepartidor]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['pedido', 'repartidor', 'ruta', 'estado', 'fecha_asignacion', 'fecha_entrega']

class ClienteRutaViewSet(viewsets.ModelViewSet):
    queryset = ClienteRuta.objects.all()
    serializer_class = ClienteRutaSerializer
    permission_classes = [IsAdmin | IsCliente]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['cliente', 'ruta']

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['nombre']

class SubcategoriaViewSet(viewsets.ModelViewSet):
    queryset = Subcategoria.objects.all()
    serializer_class = SubcategoriaSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['nombre', 'categoria']
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['categoria']

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user']

    def get_queryset(self):
        # Solo permite que los usuarios vean/editen su propio perfil
        user = self.request.user
        return Profile.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get', 'put', 'patch'], url_path='me')
    def me(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        if request.method in ['PUT', 'PATCH']:
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

class ConfiguracionViewSet(viewsets.ModelViewSet):
    queryset = Configuracion.objects.all()
    serializer_class = ConfiguracionSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def get_object(self):
        obj, created = Configuracion.objects.get_or_create(pk=1)
        return obj

    def list(self, request, *args, **kwargs):
        obj = self.get_object()
        serializer = self.get_serializer(obj)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        obj = self.get_object()
        serializer = self.get_serializer(obj)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        obj = self.get_object()
        serializer = self.get_serializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
