from rest_framework import serializers
from orders.models.rutas import Ruta, Entrega, ClienteRuta

class RutaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ruta
        fields = '__all__'

class EntregaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entrega
        fields = '__all__'

class ClienteRutaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClienteRuta
        fields = '__all__'
