# Conversación y contexto del proyecto Come Jale (actualizado al 26 de mayo de 2025)

## Resumen del proyecto
Sistema de gestión para restaurante/cocina con módulos de productos, pedidos, facturación, usuarios y roles, subida de imágenes, autenticación JWT y panel administrativo. Frontend en React + TypeScript, backend Django REST Framework.

## Cambios y decisiones recientes
- **Configuración global de tipos de orden:** Ahora existe un modelo para definir los tipos de orden y asociarles los tipos de cargo e impuesto permitidos. Esto permite reglas flexibles y validación robusta tanto en backend como en frontend.
- **Validación de cargos/impuestos por tipo de orden:** El backend y el frontend validan que solo se puedan asociar cargos e impuestos válidos según el tipo de orden.
- **Diseño de modelos extensible:** Se agregaron los modelos TipoOrden, TipoCargo, TipoOrdenCargo y TipoOrdenImpuesto para soportar la lógica de asociación global.
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

Este documento resume el estado actual y las decisiones técnicas/funcionales del proyecto Come Jale al 26 de mayo de 2025.

# Conversación y cambios recientes sobre ConfigTipoOrdenes

## Cambios en frontend/src/components/ConfigTipoOrdenes.tsx
- Se actualizó la interfaz y la visualización de cargos para que se muestren como tarjetas tipo botón, máximo 3 por línea, con nombre, monto y tipo en formato vertical.
- Se corrigieron los data-testid para que los tests puedan encontrar los elementos correctamente.
- Se ajustó la lógica para que los cargos se obtengan desde `/tipocargo/` y no desde `/ordenes-cargos/`.
- Se mejoró la visualización de los impuestos para que coincida con el estilo de los cargos.

## Cambios en frontend/src/components/__tests__/ConfigTipoOrdenes.test.tsx
- Se actualizaron los mocks para que usen `/tipocargo/`.
- Se corrigieron los tests para que usen los nuevos data-testid (`cargo-btn-*`, `cargo-nombre-*`, etc.).
- Todos los tests pasan correctamente y validan la nueva UI y lógica.

## Resumen de la conversación
- El usuario solicitó adaptar la UI de ConfigTipoOrdenes a los cambios recientes en el catálogo de cargos.
- Se implementó TDD: primero se escribieron/ajustaron los tests, luego se adaptó la UI y la lógica.
- Se mejoró la experiencia visual y la consistencia entre cargos e impuestos.
- Se validó que la integración y los tests funcionan correctamente.

---
Última actualización: 2025-05-26
