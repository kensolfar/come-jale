from rest_framework import serializers
from orders.models.base import Categoria, Subcategoria, Producto

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class SubcategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subcategoria
        fields = '__all__'

class ProductoSerializer(serializers.ModelSerializer):
    categoria = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all())
    subcategoria = serializers.PrimaryKeyRelatedField(queryset=Subcategoria.objects.all(), allow_null=True, required=False)
    class Meta:
        model = Producto
        fields = '__all__'
    def validate_precio(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor a cero.")
        return value
    def validate_nombre(self, value):
        if Producto.objects.filter(nombre=value).exists():
            raise serializers.ValidationError("Ya existe un producto con este nombre.")
        return value
