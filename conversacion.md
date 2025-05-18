# Conversación y contexto del proyecto Come Jale (actualizado al 18 de mayo de 2025)

## Resumen del proyecto
Sistema de gestión para restaurante/cocina con módulos de productos, pedidos, facturación, usuarios y roles, subida de imágenes, autenticación JWT y panel administrativo. Frontend en React + TypeScript, backend Django REST Framework.

## Cambios y decisiones recientes
- **Subida de imágenes:** Ahora se realiza mediante un endpoint personalizado `/api/productos/<id>/upload/` que asocia la imagen al producto existente. El frontend solo permite subir imagen si el producto ya está guardado.
- **Actualización de productos:** El campo `imagen` no se envía en el PATCH/PUT, solo se actualiza por el endpoint de upload.
- **JWT personalizado:** El token JWT ahora incluye los campos `username`, `first_name` y `last_name` además de los claims estándar, gracias a un serializer custom en Django.
- **Visualización de usuario:** El dashboard del frontend muestra los datos básicos del usuario extraídos del JWT.
- **Validación de campos:** El frontend limpia los campos vacíos o no válidos antes de enviar actualizaciones al backend.

## Estructura de módulos y funcionalidades
- **Productos:** CRUD, subida de imagen, categorías y subcategorías.
- **Pedidos:** Gestión de pedidos, asignación de cliente, vendedor y repartidor.
- **Facturación:** Generación y visualización de facturas.
- **Usuarios y roles:** Soporte para admin, vendedor, repartidor, cliente.
- **Autenticación:** Login con JWT, refresco automático de token.
- **Panel administrativo:** Navegación entre dashboard y productos.

## Roles y permisos
- **Administrador:** Acceso total a todos los módulos.
- **Vendedor:** Gestión de productos y pedidos.
- **Repartidor:** Acceso a entregas y rutas.
- **Cliente:** Visualización y creación de pedidos propios.

## UX/UI y wireframes
- **Web responsive** (desktop y móvil).
- **Estilo:** Moderno, oscuro, minimalista, amigable.
- **Navegación:** Menú superior con acceso a dashboard, productos y logout.
- **Pantallas clave:**
  - Dashboard con datos de usuario
  - Listado y detalle de productos
  - Diálogo para editar/crear producto
  - Subida de imagen con miniatura
  - Gestión de pedidos y facturas (en desarrollo)

## Integraciones y requisitos
- **Backend:** Django REST Framework, SimpleJWT personalizado.
- **Frontend:** React, TypeScript, Axios.
- **Impuestos:** Considerar IVA y exoneraciones para Costa Rica en facturación.
- **Accesibilidad:** A considerar en futuras versiones.
- **Multi-idioma:** Español por defecto, soporte futuro para otros idiomas.

## Pendientes y próximos pasos
- Wireframes detallados para cada módulo.
- Mejorar validación de formularios y mensajes de error.
- Implementar gestión de inventario y reportes.
- Integración con pasarelas de pago y facturación electrónica.

---

Este documento resume el estado actual y las decisiones técnicas/funcionales del proyecto Come Jale al 18 de mayo de 2025.
