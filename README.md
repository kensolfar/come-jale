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

## Endpoints principales
- `/api/productos/` CRUD de productos
- `/api/pedidos/` CRUD de pedidos
- `/api/facturas/` CRUD de facturas

Todos los endpoints requieren autenticación JWT.

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

## Versionado y despliegue
- Versionado automático con python-semantic-release
- Configuración en `pyproject.toml`

## Contacto y soporte
Para dudas o soporte, contactar a los administradores del repositorio.
