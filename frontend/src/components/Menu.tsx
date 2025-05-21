import React, { useEffect, useState, useRef } from 'react';
import { getCategorias, getProductos } from '../services/api';
import type { Categoria, Producto } from '../services/api';

interface OrderItem {
  producto: Producto;
  cantidad: number;
}

interface MenuProps {
  order: OrderItem[];
  setOrder: React.Dispatch<React.SetStateAction<OrderItem[]>>;
}

const Menu: React.FC<MenuProps> = ({ order, setOrder }) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [dialogProduct, setDialogProduct] = useState<Producto | null>(null);
  const [dialogCantidad, setDialogCantidad] = useState<number>(1);
  const [dialogPrecio, setDialogPrecio] = useState<number>(0);
  const [dialogAnchor, setDialogAnchor] = useState<DOMRect | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 900);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('sidebar-collapse', { detail: isMobile });
      window.dispatchEvent(event);
    }
  }, [isMobile]);

  useEffect(() => {
    getCategorias().then(setCategorias);
  }, []);

  useEffect(() => {
    if (categoriaSeleccionada !== null) {
      getProductos(categoriaSeleccionada).then(setProductos);
    } else {
      getProductos().then(setProductos);
    }
  }, [categoriaSeleccionada]);

  const productosFiltrados = productos;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        setDialogProduct(null);
      }
    }
    if (dialogProduct) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dialogProduct]);

  useEffect(() => {
    if (dialogProduct) {
      setDialogPrecio(dialogProduct.precio * dialogCantidad);
    }
  }, [dialogProduct, dialogCantidad]);

  const handleOpenDialog = (producto: Producto, anchor: DOMRect) => {
    setDialogProduct(producto);
    setDialogAnchor(anchor);
    setDialogCantidad(1);
  };

  const handleAddToOrder = (product: Producto, cantidad: number) => {
    setOrder(prev => {
      const idx = prev.findIndex(item => item.producto.id === product.id);
      const stock = product.cantidad || 0;
      if (idx !== -1) {
        const updated = [...prev];
        const nuevaCantidad = Math.min(updated[idx].cantidad + cantidad, stock);
        updated[idx] = { ...updated[idx], cantidad: nuevaCantidad };
        return updated;
      }
      return [...prev, { producto: product, cantidad: Math.min(cantidad, stock) }];
    });
    setDialogProduct(null);
  };

  const getStockDisponible = (producto: Producto) => {
    const enOrden = order.find(item => item.producto.id === producto.id)?.cantidad || 0;
    return (producto.cantidad || 0) - enOrden;
  };

  return (
    <div>
      {/* Sección principal: Categorías y productos */}
      <div
        style={{
          transition: 'all 0.2s',
          boxSizing: 'border-box',
          padding: '1rem 1rem',
        }}
      >
        <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 32, marginBottom: 8 }}>Menú</h1>
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <button
            onClick={() => setCategoriaSeleccionada(null)}
            style={{
              background: categoriaSeleccionada === null ? 'var(--color-green-leaf, #8DAA91)' : '#23242a',
              color: categoriaSeleccionada === null ? '#fff' : '#bdbdbd',
              border: categoriaSeleccionada === null ? '2px solid #fff' : '2px solid #23242a',
              borderRadius: 16,
              fontWeight: 700,
              fontSize: 18,
              padding: '10px 28px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              outline: 'none',
            }}
          >
            Todo el menú
          </button>
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoriaSeleccionada(cat.id)}
              style={{
                background: categoriaSeleccionada === cat.id ? 'var(--color-green-leaf, #8DAA91)' : '#23242a',
                color: categoriaSeleccionada === cat.id ? '#fff' : '#bdbdbd',
                border: categoriaSeleccionada === cat.id ? '2px solid #fff' : '2px solid #23242a',
                borderRadius: 16,
                fontWeight: 700,
                fontSize: 18,
                padding: '10px 28px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none',
              }}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? '1fr'
              : 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            transition: 'all 0.2s',
          }}
        >
          {productosFiltrados.length === 0 && (
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 18, gridColumn: '1/-1', textAlign: 'center', padding: '2rem 0' }}>
              No hay productos en esta categoría.
            </div>
          )}
          {productosFiltrados.map(producto => (
            <div
              key={producto.id}
              style={{
                background: '#23242a',
                borderRadius: 16,
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
                padding: 0,
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative',
                transition: 'transform 0.1s',
                minWidth: 0,
                maxWidth: isMobile ? 154 : 220,
                width: '100%',
                height: isMobile ? 182 : 240,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
                margin: '0 auto',
              }}
              onClick={e => handleOpenDialog(producto, (e.currentTarget as HTMLDivElement).getBoundingClientRect())}
            >
              <img
                src={producto.imagen && producto.imagen.startsWith('http') ? producto.imagen : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${producto.imagen}`}
                alt={producto.nombre}
                style={{ width: '100%', height: isMobile ? 84 : 120, objectFit: 'cover', display: 'block', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
              />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: isMobile ? '0.5rem' : '0.7rem' }}>
                <div style={{ fontWeight: 700, fontSize: isMobile ? 11 : 16, color: '#fff', marginBottom: 2, textAlign: 'center' }}>{producto.nombre}</div>
                <div style={{ color: '#8DAA91', fontWeight: 700, fontSize: isMobile ? 10 : 15, textAlign: 'center' }}>₡{Number(producto.precio).toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
        {dialogProduct && (
          <div
            ref={dialogRef}
            style={{
              position: 'fixed',
              left: dialogAnchor ? dialogAnchor.left : '50%',
              top: dialogAnchor ? dialogAnchor.top : '50%',
              width: dialogAnchor ? dialogAnchor.width : 260,
              zIndex: 2000,
              background: 'var(--color-green-leaf, #8DAA91)',
              borderRadius: 18,
              boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: 220,
              color: '#fff',
              transform: 'translateY(10px)',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 8 }}>{dialogProduct.nombre}</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>₡{Number(dialogPrecio).toFixed(2)}</div>
            <div style={{ color: '#fff', fontSize: 15, marginBottom: 10 }}>Stock disponible: {getStockDisponible(dialogProduct)}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
              <button
                onClick={() => setDialogCantidad(c => Math.max(1, c - 1))}
                style={{
                  background: '#fff',
                  color: 'var(--color-green-leaf, #8DAA91)',
                  border: 'none',
                  borderRadius: 8,
                  width: 36,
                  height: 36,
                  fontSize: 22,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
                aria-label="Disminuir cantidad"
                disabled={dialogCantidad <= 1}
              >
                −
              </button>
              <span style={{ fontWeight: 700, fontSize: 20, minWidth: 32, textAlign: 'center' }}>{dialogCantidad}</span>
              <button
                onClick={() => setDialogCantidad(c => Math.min(getStockDisponible(dialogProduct), c + 1))}
                style={{
                  background: '#fff',
                  color: 'var(--color-green-leaf, #8DAA91)',
                  border: 'none',
                  borderRadius: 8,
                  width: 36,
                  height: 36,
                  fontSize: 22,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
                aria-label="Aumentar cantidad"
                disabled={dialogCantidad >= getStockDisponible(dialogProduct)}
              >
                +
              </button>
            </div>
            <button
              style={{
                width: '100%',
                background: '#fff',
                color: 'var(--color-green-leaf, #8DAA91)',
                fontWeight: 700,
                fontSize: 17,
                border: 'none',
                borderRadius: 8,
                padding: '10px 0',
                marginBottom: 8,
                cursor: getStockDisponible(dialogProduct) === 0 ? 'not-allowed' : 'pointer',
                opacity: getStockDisponible(dialogProduct) === 0 ? 0.6 : 1,
              }}
              onClick={() => handleAddToOrder(dialogProduct, dialogCantidad)}
              disabled={getStockDisponible(dialogProduct) === 0}
            >
              Añadir a la orden
            </button>
            <button
              style={{
                width: '100%',
                background: 'transparent',
                color: '#fff',
                fontWeight: 700,
                fontSize: 15,
                border: 'none',
                borderRadius: 8,
                padding: '8px 0',
                cursor: 'pointer',
              }}
              onClick={() => setDialogProduct(null)}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
