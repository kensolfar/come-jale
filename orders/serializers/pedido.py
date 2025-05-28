from rest_framework import serializers
from orders.models.pedido import Pedido, PedidoProducto

class PedidoProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PedidoProducto
        fields = '__all__'
    def validate_cantidad(self, value):
        if value <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor a cero.")
        return value
    def validate_precio_unitario(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio unitario debe ser mayor a cero.")
        return value
    def validate(self, data):
        producto = data.get('producto')
        if producto and not producto.disponible:
            raise serializers.ValidationError({'producto': f"El producto '{producto.nombre}' no está disponible."})
        return data

class PedidoSerializer(serializers.ModelSerializer):
    productos = PedidoProductoSerializer(source='pedidoproducto_set', many=True, read_only=True)
    class Meta:
        model = Pedido
        fields = '__all__'
    def validate_direccion_entrega(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("La dirección de entrega no puede estar vacía.")
        return value
    def validate_contacto(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("El contacto no puede estar vacío.")
        return value
    def validate_estado(self, value):
        estados = [e[0] for e in Pedido.ESTADOS]
        if value not in estados:
            raise serializers.ValidationError(f"Estado '{value}' no es válido.")
        return value
