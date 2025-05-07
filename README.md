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

## Versionado y despliegue
- Versionado automático con python-semantic-release
- Configuración en `pyproject.toml`

## Contacto y soporte
Para dudas o soporte, contactar a los administradores del repositorio.
