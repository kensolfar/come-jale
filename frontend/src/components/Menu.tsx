import React, { useEffect, useState, useRef } from 'react';
import { getCategorias, getProductos } from '../services/api';
import type { Categoria, Producto } from '../services/api';
import { useTranslation } from 'react-i18next';

interface OrderItem {
  producto: Producto;
  cantidad: number;
}

interface MenuProps {
  order: OrderItem[];
  setOrder: React.Dispatch<React.SetStateAction<OrderItem[]>>;
}

const Menu: React.FC<MenuProps> = ({ order, setOrder }) => {
  const { t } = useTranslation();
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
        <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 32, marginBottom: 8 }}>{t('menu')}</h1>
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
            {t('all_menu')}
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
              {t(cat.nombre)}
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
              {t('no_products_in_category')}
            </div>
          )}
          {productosFiltrados.map(producto => {
            const stockDisponible = getStockDisponible(producto);
            const sinStock = stockDisponible <= 0;
            return (
              <div
                key={producto.id}
                style={{
                  background: '#23242a',
                  borderRadius: 16,
                  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
                  padding: 0,
                  cursor: sinStock ? 'not-allowed' : 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'transform 0.1s, box-shadow 0.2s',
                  minWidth: 0,
                  maxWidth: isMobile ? 154 : 220,
                  width: '100%',
                  height: isMobile ? 182 : 240,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'stretch',
                  margin: '0 auto',
                  opacity: sinStock ? 0.5 : 1,
                  pointerEvents: sinStock ? 'none' : 'auto',
                }}
                onClick={e => !sinStock && handleOpenDialog(producto, (e.currentTarget as HTMLDivElement).getBoundingClientRect())}
                onMouseOver={e => {
                  if (!sinStock) e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(141,170,145,0.25)';
                }}
                onMouseOut={e => {
                  if (!sinStock) e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(0,0,0,0.10)';
                }}
              >
                <img
                  src={producto.imagen && producto.imagen.startsWith('http') ? producto.imagen : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${producto.imagen}`}
                  alt={producto.nombre}
                  style={{
                    width: 'calc(100% - 1em)',
                    height: isMobile ? 96 : 140,
                    objectFit: 'cover',
                    display: 'block',
                    borderRadius: 14,
                    margin: '0.75em auto 0em auto',
                    boxSizing: 'border-box',
                    background: '#23242a',
                  }}
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', padding: isMobile ? '0.5rem' : '0.7rem', gap: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: isMobile ? 12.6 : 16, color: '#fff', marginBottom: 4, textAlign: 'left', width: '100%' }}>{producto.nombre}</div>
                  <div style={{ borderTop: '1px solid #23272f', width: '100%', margin: '2px 0 0 0' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', padding: isMobile ? '0.5rem' : '0.7rem', position: 'absolute', left: 0, bottom: 0 }}>
                  <span style={{ fontWeight: 600, fontSize: isMobile ? 14 : 18, color: sinStock ? '#bdbdbd' : '#8DAA91' }}>₡{Number(producto.precio).toFixed(2)}</span>
                  <span style={{ flex: 1 }} />
                  {sinStock ? (
                    <span style={{ color: '#ff5c5c', fontWeight: 500, fontSize: isMobile ? 10 : 12, textAlign: 'right', paddingRight: isMobile ? 16 : 20}}>{t('out_of_stock')}</span>
                  ) : (
                    <span style={{ color: '#bdbdbd', fontWeight: 400, fontSize: isMobile ? 10 : 12, textAlign: 'right', paddingRight: isMobile ? 16 : 20 }}>{t('in_stock', { stock: stockDisponible })}</span>
                  )}
                </div>
              </div>
            );
          })}
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
            <div style={{ color: '#fff', fontSize: 15, marginBottom: 10 }}>{t('available_stock', { stock: getStockDisponible(dialogProduct) })}</div>
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
              {t('add_to_order')}
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
              {t('cancel')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
