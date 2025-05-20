# Come-Jale Backend

## Descripción
Backend para la gestión de pedidos, productos, facturación y entregas, compatible con aplicaciones web y móviles. Implementa autenticación JWT y control de roles (administrador, cliente, vendedor, repartidor).

## Requisitos
- Python 3.12+
- Linux
- Entorno virtual (recomendado)

## Instalación
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Migraciones y superusuario
```bash
python manage.py migrate
python manage.py createsuperuser
```

## Ejecución
```bash
python manage.py runserver
```

## Autenticación JWT
- Obtener token: `POST /api/token/` (usuario y contraseña)
- Refrescar token: `POST /api/token/refresh/`
- Usar el token en el header: `Authorization: Bearer <token>`

## Endpoints principales y filtros disponibles

### /api/productos/
- CRUD de productos
- Filtros disponibles: nombre, categoria, subcategoria, disponible, precio, fecha_creacion
  - Ejemplo: `/api/productos/?categoria=1&disponible=true`

### /api/pedidos/
- CRUD de pedidos
- Filtros disponibles: cliente, vendedor, repartidor, estado, fecha_creacion
  - Ejemplo: `/api/pedidos/?cliente=2&estado=pendiente`

### /api/facturas/
- CRUD de facturas
- Filtros disponibles: pedido, nombre_vendedor, nombre_destinatario, fecha_expedicion, metodo_pago
  - Ejemplo: `/api/facturas/?pedido=1&metodo_pago=Efectivo`

### /api/rutas/
- CRUD de rutas
- Filtros disponibles: nombre, activa
  - Ejemplo: `/api/rutas/?activa=true`

### /api/entregas/
- CRUD de entregas
- Filtros disponibles: pedido, repartidor, ruta, estado, fecha_asignacion, fecha_entrega
  - Ejemplo: `/api/entregas/?repartidor=4&estado=pendiente`

### /api/clientes-ruta/
- CRUD de asociaciones cliente-ruta
- Filtros disponibles: cliente, ruta
  - Ejemplo: `/api/clientes-ruta/?cliente=2`

### /api/categorias/
- CRUD de categorías
- Filtros disponibles: nombre
  - Ejemplo: `/api/categorias/?nombre=Desayuno`

### /api/subcategorias/
- CRUD de subcategorías
- Filtros disponibles: nombre, categoria
  - Ejemplo: `/api/subcategorias/?categoria=1`

> Todos los endpoints requieren autenticación JWT.
> Los filtros se aplican como parámetros de consulta (query params) en la URL.

## Roles y permisos
- El sistema utiliza el modelo de usuario de Django. Los roles se gestionan por grupo o campo extra (a definir en futuras iteraciones).
- Por defecto, todos los usuarios autenticados pueden acceder a los endpoints. Se recomienda implementar permisos personalizados según el rol.

## Estructura del proyecto
- `core/`: configuración principal de Django
- `orders/`: modelos, vistas, serializers y rutas de la app principal

## Pruebas y colección Postman
Se incluye una colección de Postman (`postman_collection.json`) con pruebas de éxito y error para:
- Autenticación JWT
- CRUD de productos, pedidos y facturas
- Escenarios de error: credenciales inválidas, acceso sin token, datos inválidos

## Usuarios de prueba y superusuario

El sistema incluye datos de prueba y un superusuario para facilitar el desarrollo y pruebas locales.

- **Superusuario:**
  - Usuario: `kenso`
  - Email: `kensol23@gmail.com`
  - Contraseña: (debes establecerla manualmente usando `python manage.py changepassword kenso` tras cargar los fixtures, por seguridad y compatibilidad con Django)

- **Usuarios de prueba:**
  - Cliente: `cliente` / `cliente123`
  - Vendedor: `vendedor` / `vendedor123`
  - Repartidor: `repartidor` / `repartidor123`

## Carga de datos de prueba

Puedes poblar la base de datos con datos realistas (productos, rutas, pedidos, facturas, entregas) usando:

```bash
python manage.py loaddata orders/fixtures_demo.json
```

O bien, usando el comando personalizado:

```bash
python manage.py poblar_datos_demo
```

## Rutas y direcciones de ejemplo

Las rutas de entrega corresponden a ubicaciones reales del Distrito Central de Cañas, Guanacaste:
- Ruta Central: Centro de Cañas, Parque Central
- Ruta Barrio San José: Barrio San José, cerca de la iglesia
- Ruta Barrio Lajas: Barrio Lajas, frente a la escuela
- Ruta Barrio Santa Lucía: Barrio Santa Lucía, costado sur del Ebais

## Notas de seguridad y desarrollo
- No uses contraseñas simples en producción.
- El fixture de usuarios sobrescribe el usuario con pk=1. Si tienes un superusuario propio, crea uno nuevo tras cargar los datos.
- Para pruebas automatizadas, consulta `orders/tests_api.py` y la colección Postman incluida.

## Resultados de las pruebas API (pytest)

A fecha 2025-05-17, la suite de pruebas automatizadas (`orders/tests_api.py`) pasa correctamente con la política de roles y permisos implementada:

- **Clientes** pueden crear, listar y ver sus propios pedidos, pero no pueden actualizar ni eliminar pedidos (reciben 403 Forbidden).
- **Admin y Vendedor** pueden actualizar y eliminar pedidos.
- Los endpoints de productos, facturas, entregas y clientes-ruta respetan los permisos personalizados definidos para cada rol.
- Todos los flujos principales y restricciones de acceso están cubiertos por pruebas automatizadas.

Para ejecutar las pruebas:

```bash
pytest orders/tests_api.py --disable-warnings -v
```

Todos los tests deben pasar (9 passed).

## Ejemplos de request/response por rol

### 1. Cliente crea y lista sus pedidos

**POST /api/pedidos/**
```json
{
  "cliente": 2,
  "direccion_entrega": "Calle 123",
  "contacto": "88888888",
  "info_adicional": "Ninguna",
  "estado": "pendiente"
}
```
**Response 201:**
```json
{
  "id": 10,
  "cliente": 2,
  "direccion_entrega": "Calle 123",
  "contacto": "88888888",
  "info_adicional": "Ninguna",
  "estado": "pendiente",
  ...
}
```

**GET /api/pedidos/** (con token de cliente)
```json
[
  {
    "id": 10,
    "cliente": 2,
    "direccion_entrega": "Calle 123",
    ...
  }
]
```

### 2. Cliente intenta actualizar/eliminar pedido (no permitido)

**PUT /api/pedidos/10/**
```json
{
  "cliente": 2,
  "direccion_entrega": "Calle 456",
  ...
}
```
**Response 403:**
```json
{
  "detail": "No tienes permiso para realizar esta acción."
}
```

### 3. Admin/vendedor actualiza pedido (permitido)

**PUT /api/pedidos/10/** (con token de admin o vendedor)
```json
{
  "cliente": 2,
  "direccion_entrega": "Calle 456",
  ...
}
```
**Response 200:**
```json
{
  "id": 10,
  "cliente": 2,
  "direccion_entrega": "Calle 456",
  ...
}
```

---

## Cobertura Postman

La colección `postman_collection.json` incluida en el repositorio permite probar:
- Autenticación JWT (login, refresh)
- CRUD de productos, pedidos, facturas, entregas y clientes-ruta
- Escenarios de acceso denegado según rol (403)
- Flujos de éxito y error para cada endpoint y rol

Puedes importar la colección en Postman y usar los usuarios de prueba documentados para validar todos los flujos y restricciones de la API.

---

## Versionado y despliegue
- Versionado automático con python-semantic-release
- Configuración en `pyproject.toml`

## Contacto y soporte
Para dudas o soporte, contactar a los administradores del repositorio.
