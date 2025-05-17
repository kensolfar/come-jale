# Conversación y Decisiones de Implementación

## Resumen General

Este archivo documenta el proceso, decisiones y contexto de desarrollo para el sistema de pedidos, facturación y entregas en Django, así como la configuración de un flujo de trabajo de despliegue automatizado y semántico usando python-semantic-release y GitHub Actions. El objetivo es facilitar la migración y entendimiento del proyecto para otro agente Copilot o desarrollador en VS Code.

---

## 1. Modelos de Negocio

### Modelos implementados:
- **Producto**: nombre, precio, descripción, categoría, subcategoría, imagen.
- **Pedido**: cliente, vendedor, repartidor, productos (ManyToMany con Producto vía PedidoProducto), dirección de entrega, contacto, info adicional, estado, fecha de creación.
- **PedidoProducto**: relación intermedia entre Pedido y Producto, con cantidad y precio unitario.
- **Factura**: OneToOne con Pedido, datos de vendedor, destinatario, mercancías, fletes, seguro, lugar y fecha de expedición, método de pago, monto total.
- **Ruta**: nombre, descripción, activa.
- **Entrega**: pedido (OneToOne), repartidor, ruta, fechas, estado, ubicación actual.
- **ClienteRuta**: cliente, ruta, latitud, longitud, dirección.

### Serializers:
- Serializers para Producto, PedidoProducto, Pedido (incluyendo productos anidados), Factura, Ruta, Entrega y ClienteRuta.

---

## Cambios y correcciones
- Se corrigieron errores de importación circular en `orders/models.py`.
- Se añadió la variable `__version__ = "0.1.0"` en `orders/__init__.py` para compatibilidad con semantic-release.
- Se configuró `[tool.semantic_release]` en `pyproject.toml` con `version_variable` y `prerelease_token`.
- Se creó y refinó `.github/workflows/release.yml` para separar los flujos de trabajo de liberación estable (main/PyPI) y pre-lanzamiento (beta/TestPyPI), usando entornos de GitHub Actions para gestionar secretos y URLs.
- Se documentaron ejemplos de mensajes de commit semánticos para disparar releases.
- Se preparó este archivo `conversacion.md` para migración y onboarding.
- Se implementaron los modelos **Ruta**, **Entrega** y **ClienteRuta** con sus serializers y registro en el admin.
- Se añadieron pruebas unitarias para los modelos Ruta, Entrega y ClienteRuta en `orders/tests.py` y todas pasan correctamente.

---

## Flujo de trabajo de liberación (release workflow)
- **Ramas**:
  - `main`: despliegue estable a PyPI (entorno `pypi-prod`).
  - `beta`: pre-release a TestPyPI (entorno `pypi-test`).
- **GitHub Actions**:
  - Jobs separados para main y beta.
  - Uso de environments para gestionar secretos y URLs.
  - Uso de `python-semantic-release` para versionado y publicación.
  - El workflow sigue la receta de pre-release de semantic-release para Node.js, adaptada a Python.
- **Mensajes de commit**:
  - Se deben usar mensajes semánticos (feat, fix, chore, etc.) para disparar releases automáticos.
  - Ejemplo: `feat: agregar modelo Entrega`

---

## Pendiente
- (Opcional) Crear un archivo `RELEASE_WORKFLOW.md` con documentación técnica del proceso de release.
- Seguir documentando cualquier cambio adicional en este archivo.

---

## Estructura relevante del proyecto
- `/orders/models.py`: Modelos y serializadores.
- `/orders/__init__.py`: Variable de versión para semantic-release.
- `/pyproject.toml`: Configuración de python-semantic-release.
- `/.github/workflows/release.yml`: Workflow de GitHub Actions para releases.
- `/orders/tests_api.py`: Pruebas API.
- `/conversacion.md`: Este archivo de contexto y migración.

---

## Notas para migración/onboarding
- Este archivo debe ser actualizado con cada cambio relevante.
- El flujo de trabajo de release está preparado para migrar fácilmente a otro entorno o desarrollador.
- Para migrar, asegúrate de copiar este archivo y los archivos de configuración indicados.
- Los secretos de PyPI/TestPyPI deben configurarse en los entornos de GitHub Actions correspondientes.

---

## Datos de prueba y superusuario
- El proyecto incluye un fixture (`orders/fixtures_demo.json`) y un comando de gestión (`python manage.py poblar_datos_demo`) para poblar la base de datos con datos realistas: productos, rutas, pedidos, facturas, entregas y usuarios de prueba.
- El superusuario por defecto es:
  - Usuario: `kenso`
  - Email: `kensol23@gmail.com`
  - Contraseña: debes establecerla manualmente con `python manage.py changepassword kenso` tras cargar los fixtures, por seguridad y compatibilidad con Django.
- Usuarios de prueba:
  - Cliente: `cliente` / `cliente123`
  - Vendedor: `vendedor` / `vendedor123`
  - Repartidor: `repartidor` / `repartidor123`

## Endpoints y documentación
- La API está documentada en `swagger.yaml` y cubre productos, pedidos, facturas, rutas, entregas y clientes por ruta.
- Los endpoints principales están protegidos por autenticación JWT.
- La colección Postman (`postman_collection.json`) permite probar todos los flujos principales y errores comunes.

## Consideraciones de seguridad y migración
- No uses contraseñas simples en producción.
- El fixture sobrescribe el usuario con pk=1. Si tienes un superusuario propio, créalo después de cargar los datos.
- Para migrar el proyecto, asegúrate de copiar este archivo y los archivos de configuración clave (`pyproject.toml`, workflows, fixtures, etc.).
- Los secretos de PyPI/TestPyPI deben configurarse en los entornos de GitHub Actions correspondientes.

## Última actualización
17 de mayo de 2025

---

> Si tienes dudas sobre el flujo de trabajo, la estructura del proyecto o la configuración de releases, consulta este archivo primero.

---
