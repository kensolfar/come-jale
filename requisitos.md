## 1. Mapa de sitio (sitemap)

**Navegación principal (top bar)**
- Dashboard  
- Productos  
- Pedidos  
- Facturación  
- Rutas  
- Informes  
- Configuración  

**Navegación secundaria (side drawer o sidebar según contexto)**
- **Dashboard**
  - Pedidos pendientes  
  - Pedidos en curso  
  - Mejores clientes  
  - KPIs de ventas  
- **Productos**
  - Lista de productos (∞ scroll, 6–8 tarjetas por “página”)  
  - Productos estrella  
  - Crear/modificar producto  
- **Pedidos**
  - Sala (mesero)  
  - Delivery (app cliente)  
  - Historial  
- **Facturación**
  - Pendientes por generar (in-situ)  
  - Generadas (automáticas)  
  - Configuración de impuestos (prorrata, exoneraciones)  
- **Rutas**
  - Vista mapa  
  - Asignar repartidor  
  - Seguimiento en tiempo real  
- **Informes**
  - Ventas por periodo  
  - Inventario  
  - Tiempos de entrega  
- **Configuración**
  - Roles y permisos  
  - Integraciones (pagos, ERP, TPV, mensajería)  
  - Idiomas y monedas  
  - Accesibilidad (WCAG AA)  

---

## 2. Flujo de navegación y pantallas clave

| Módulo            | Desktop                                               | Tablet / Móvil                                           |
|-------------------|-------------------------------------------------------|----------------------------------------------------------|
| **Dashboard**     | 3-columnas (cards KPIs, lista pedidos, gráfico de ventas) | 1-columna (cards apiladas, charts colapsables)          |
| **Productos**     | Sidebar + grid de tarjetas (imagen, nombre, precio) con ∞ scroll y skeleton | Drawer lateral + lista vertical con acciones swipe     |
| **Pedido Sala**   | Sidebar + form rápido (buscador, sugeridos arriba, variaciones) | Drawer para nav; “Add” fijado en footer + modal-cart    |
| **Pedido App**    | Hero “Productos estrella”, filtros, carrito lateral    | Tabs en footer + drawer lateral para categorías         |
| **Facturación**   | Tabla paginada + detalle en modal al click             | Lista de ítems; detalle en pantalla completa            |
| **Rutas**         | Mapa a la derecha + lista de entregas a la izquierda   | Mapa full-screen con drawer inferior para detalles      |

---

## 3. Estados y componentes comunes

- **Estado vacío**  
  - Mensaje (“No hay productos aún”) + CTA (“Crear producto”)  
- **Carga**  
  - Skeletons sobre tarjetas/listas  
- **Éxito/Fracaso**  
  - Modal centrado con título, mensaje y botón de acción  
- **Infinit Scroll**  
  - “Cargar más” automático al llegar al final; skeletons inline  
- **Gestos (móvil)**  
  - Swipe derecha para “Marcar entregado”  
  - Swipe izquierda para “Eliminar”  
- **Contraste & accesibilidad**  
  - Texto normal ≥ 4.5:1, botones/elementos ≥ 3:1  
  - Tamaño mínimo touch: ≥ 44 × 44 px  

---

## 4. Wireframes high-fi: primeros cinco bocetos

1. **Dashboard (desktop / tablet / móvil)**  
   - Top bar con logo, búsqueda global, perfil/idioma/moneda.  
   - Sidebar (tablet/desktop) o drawer (móvil).  
   - Cards de KPIs, tabla de pedidos, gráfico de ventas.  

2. **Listado de productos**  
   - Grid de tarjetas (imagen, nombre, precio, badge “estrella”).  
   - Infinit scroll con skeletons.  
   - Empty state con CTA.  

3. **Flujo “Crear producto” (formulario)**  
   - Campos: nombre*, categoría*, foto, precio*, descripción, stock opcional.  
   - Validaciones inline (regional Costa Rica).  
   - Botón “Guardar” en bottom bar (móvil) / modal (desktop).  

4. **Toma de pedido – Sala**  
   - Buscador + sugeridos arriba.  
   - Tarjetas de plato con foto y variaciones.  
   - Carrito lateral (desktop) / modal-cart (móvil).  

5. **Vista de facturación**  
   - Tabla de pedidos con estado de factura.  
   - Modal de factura con líneas de detalle, impuestos (prorrata, exoneraciones) y totales.  
   - Botón “Generar factura” (in-situ) o indicador automático.  

---

## 5. Próximos pasos

1. **Revisión**  
   - Validar sitemap y módulos de wireframe.  
2. **Bocetos**  
   - Preparar artboards high-fi para desktop, tablet y móvil.  
3. **Iteración**  
   - Ajustes de estilo: colores amigables, tipografías, iconos sugeridos (Feather, FontAwesome) y microcopy cercano.  
