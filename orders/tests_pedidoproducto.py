from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth.models import User
from orders.models.base import Producto, Categoria
from orders.models.pedido import Pedido, PedidoProducto
from orders.serializers.pedido import PedidoProductoSerializer

class PedidoProductoAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='cliente', password='test1234')
        self.categoria = Categoria.objects.create(nombre='CatTest')
        self.producto = Producto.objects.create(nombre='Test Producto', precio=10, categoria=self.categoria, disponible=True, cantidad=100)
        self.pedido = Pedido.objects.create(cliente=self.user, direccion_entrega='Calle 1', contacto='123', estado='pendiente')
        self.url = reverse('pedidoproducto-list')
        self.client.force_authenticate(user=self.user)

    def test_list_pedidoproductos(self):
        PedidoProducto.objects.create(pedido=self.pedido, producto=self.producto, cantidad=2, precio_unitario=10)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertTrue('results' in response.data or isinstance(response.data, list))

    def test_create_pedidoproducto(self):
        data = {
            'pedido': self.pedido.id,
            'producto': self.producto.id,
            'cantidad': 1,
            'precio_unitario': 10
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(PedidoProducto.objects.count(), 1)

    def test_update_pedidoproducto(self):
        pedidoproducto = PedidoProducto.objects.create(pedido=self.pedido, producto=self.producto, cantidad=2, precio_unitario=10)
        url = reverse('pedidoproducto-detail', args=[pedidoproducto.id])
        response = self.client.patch(url, {'cantidad': 5})
        self.assertEqual(response.status_code, 200)
        pedidoproducto.refresh_from_db()
        self.assertEqual(pedidoproducto.cantidad, 5)

    def test_delete_pedidoproducto(self):
        pedidoproducto = PedidoProducto.objects.create(pedido=self.pedido, producto=self.producto, cantidad=2, precio_unitario=10)
        url = reverse('pedidoproducto-detail', args=[pedidoproducto.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)
        self.assertFalse(PedidoProducto.objects.filter(id=pedidoproducto.id).exists())
