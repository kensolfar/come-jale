from rest_framework import serializers
from orders.models.orden import Orden, OrdenLinea, OrdenCargo, TipoOrden, TipoCargo, Impuesto

class ImpuestoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Impuesto
        fields = '__all__'

class OrdenCargoSerializer(serializers.ModelSerializer):
    orden = serializers.PrimaryKeyRelatedField(queryset=Orden.objects.all(), write_only=True, required=False)
    class Meta:
        model = OrdenCargo
        fields = '__all__'
    def validate(self, data):
        orden = data.get('orden')
        tipo_cargo = data.get('tipo_cargo')
        if orden and tipo_cargo:
            from orders.models.orden import TipoOrden
            tipo_orden_obj = TipoOrden.objects.filter(nombre=orden.tipo).first()
            cargos_permitidos = set(tipo_orden_obj.cargos.all()) if tipo_orden_obj else set()
            if tipo_cargo not in cargos_permitidos:
                raise serializers.ValidationError(f"El cargo '{tipo_cargo.nombre}' no está permitido para el tipo de orden '{orden.tipo}'.")
        return data
    def create(self, validated_data):
        tipo_cargo = validated_data['tipo_cargo']
        validated_data['monto_aplicado'] = tipo_cargo.monto
        validated_data['tipo_aplicado'] = tipo_cargo.tipo
        return super().create(validated_data)
    def update(self, instance, validated_data):
        tipo_cargo = validated_data.get('tipo_cargo', instance.tipo_cargo)
        validated_data['monto_aplicado'] = tipo_cargo.monto
        validated_data['tipo_aplicado'] = tipo_cargo.tipo
        return super().update(instance, validated_data)

class OrdenLineaSerializer(serializers.ModelSerializer):
    orden = serializers.PrimaryKeyRelatedField(queryset=Orden.objects.all(), write_only=True, required=False)
    class Meta:
        model = OrdenLinea
        fields = '__all__'
    def validate(self, data):
        orden = data.get('orden')
        impuesto = data.get('impuesto')
        if orden and impuesto:
            try:
                tipo_orden_obj = None
                if hasattr(orden, 'tipo') and hasattr(orden.tipo, 'impuestos'):
                    impuestos_permitidos = set(orden.tipo.impuestos.values_list('id', flat=True))
                else:
                    from orders.models.orden import TipoOrden
                    tipo_orden_obj = TipoOrden.objects.filter(nombre=orden.tipo).first()
                    impuestos_permitidos = set(tipo_orden_obj.impuestos.values_list('id', flat=True)) if tipo_orden_obj else set()
                if impuesto.id not in impuestos_permitidos:
                    raise serializers.ValidationError(f"El impuesto '{impuesto.nombre}' no está permitido para el tipo de orden '{orden.tipo}'.")
            except Exception as e:
                raise serializers.ValidationError(f"Error de validación de impuesto: {e}")
        return data

class OrdenSerializer(serializers.ModelSerializer):
    lineas = OrdenLineaSerializer(many=True, read_only=True)
    cargos = OrdenCargoSerializer(many=True, read_only=True)
    class Meta:
        model = Orden
        fields = '__all__'
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['cargos'] = list(instance.cargos.values_list('id', flat=True))
        rep['impuestos'] = list(instance.impuestos.values_list('id', flat=True))
        return rep

class TipoOrdenSerializer(serializers.ModelSerializer):
    cargos = serializers.PrimaryKeyRelatedField(queryset=TipoCargo.objects.all(), many=True, required=True)
    impuestos = serializers.PrimaryKeyRelatedField(queryset=Impuesto.objects.all(), many=True, required=True)
    class Meta:
        model = TipoOrden
        fields = '__all__'
        extra_kwargs = {'nombre': {'required': True}}
    def validate(self, data):
        allowed = set(self.fields.keys())
        extra = set(self.initial_data.keys()) - allowed
        if extra:
            raise serializers.ValidationError({k: 'Campo no permitido.' for k in extra})
        return data
    def validate_cargos(self, value):
        if len(value) != len(set(value)):
            raise serializers.ValidationError("No se permiten cargos duplicados.")
        return value
    def validate_impuestos(self, value):
        if len(value) != len(set(value)):
            raise serializers.ValidationError("No se permiten impuestos duplicados.")
        return value
    def update(self, instance, validated_data):
        cargos = validated_data.pop('cargos', None)
        impuestos = validated_data.pop('impuestos', None)
        instance = super().update(instance, validated_data)
        if cargos is not None:
            instance.cargos.set(cargos)
        if impuestos is not None:
            instance.impuestos.set(impuestos)
        return instance

class TipoCargoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoCargo
        fields = '__all__'
