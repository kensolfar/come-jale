import React, { useEffect, useState, useRef } from 'react';
import { getCategorias, getProductos } from '../../services/api';
import type { Categoria, Producto } from '../../services/api';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import { useTranslation } from 'react-i18next';
//import { usarUsuario } from '../ContextoDeUsuario';

interface ItemOrden {
  producto: Producto;
  cantidad: number;
}

interface ProductosProps {
  auth_token?: string;
  orden?: ItemOrden | null;
}

const Productos: React.FC<ProductosProps> = ({ orden }) => {
  const { t } = useTranslation();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const productosFiltrados = productos;
  //const { usuario, ficha } = usarUsuario();

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
  
  const getStockDisponible = (producto: Producto) => {
    const enOrden = orden && Array.isArray(orden)
      ? orden.find(item => item.producto.id === producto.id)?.cantidad || 0
      : 0;
    return (producto.cantidad || 0) - enOrden;
  };

  return (
    <div 
      className='admin productos container'
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        //padding: '24px',
        boxSizing: 'border-box',
        backgroundColor: 'var(--base-dark-bg-2)',
        borderRadius: 'var(--border-radius-main)',
        color: 'var(--white)',
      }}
    >
      {/* Header with navigation */}
      <div
        className='admin productos header'
        style={{
          padding: '24px 24px 0 24px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          borderBottom: '2px solid var(--base-dark-line)',
        }}
      >
        <div
          className='admin productos title'
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <h2>{t('administracion_de_productos')}</h2>
          <button className='secondary' style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500, border:'1px solid var(--text-lighter)', background: 'transparent', color: 'var(--text-lighter)' }}>
            <CategoryOutlinedIcon/>
            <span className='label'>{t('administrar_categorias')}</span>
          </button>
        </div>
        <nav
          className='admin productos categorias'
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxSizing: 'border-box',
          }}
        >
          <button
            className={`navegacion todos${categoriaSeleccionada === null ? ' active' : ''}`}
            onClick={() => setCategoriaSeleccionada(null)}
            style={{
              borderBottom: categoriaSeleccionada === null ? '3px solid var(--primary-color)' : 'none',
              color: categoriaSeleccionada === null ? 'var(--primary-color)' : 'var(--white)',
            }}
          >
            {t('all_menu')}
          </button>
          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              className={`navegacion ${categoriaSeleccionada === categoria.id ? 'active' : ''}`}
              onClick={() => setCategoriaSeleccionada(categoria.id)}
              style={{
                borderBottom: categoriaSeleccionada === categoria.id ? '3px solid var(--primary-color)' : 'none',
                color: categoriaSeleccionada === categoria.id ? 'var(--primary-color)' : 'var(--white)',
              }}
            >
              {t(categoria.nombre)}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content area - scrollable */}
      <div
        className='admin productos content'
        style={{
          flex: 1,
          padding: '24px 24px 0 24px', // top right bottom left
          width: '100%',
          boxSizing: 'border-box',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <div
          className='admin productos grid'
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 15,
            width: '100%',
            alignItems: 'stretch',
            boxSizing: 'border-box',
          }}
        >
          {/* Add new product card */}
          <div
            className='tarjeta producto add-new'
            style={{
              background: 'transparent',
              borderRadius: 'var(--border-radius-card)',
              border: '2px dashed var(--base-dark-line)',
              cursor: 'pointer',
              overflow: 'hidden',
              maxWidth: isMobile ? 154 : 217,
              height: isMobile ? 182 : 295,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 16,
              transition: 'border-color 0.2s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.borderColor = 'var(--primary-color)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.borderColor = 'var(--base-dark-line)';
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              color: 'white',
            }}>
              +
            </div>
            <span style={{ color: 'var(--primary-color)', fontWeight: 500 }}>
              {t('add_new_dish')}
            </span>
          </div>

          {/* Product cards */}
          {productosFiltrados.map(producto => {
            const stockDisponible = getStockDisponible(producto);
            const sinStock = stockDisponible <= 0;
            return (
              <div
                className='tarjeta producto'
                key={producto.id}
                style={{
                  background: 'var(--base-dark-bg-2)',
                  borderRadius: 'var(--border-radius-card)',
                  border: '1px solid var(--base-dark-line)',
                  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
                  boxSizing: 'border-box',
                  padding: 0,
                  cursor: sinStock ? 'not-allowed' : 'pointer',
                  overflow: 'hidden',
                  position: 'relative',                  transition: 'transform 0.1s, box-shadow 0.2s',
                  minWidth: 0,
                  maxWidth: isMobile ? 154 : 221,
                  width: '100%',
                  height: isMobile ? 182 : 299,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'stretch',
                  opacity: sinStock ? 0.5 : 1,
                  pointerEvents: sinStock ? 'none' : 'auto',
                }}
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
                    width: '100%',
                    height: isMobile ? 120 : 160,
                    objectFit: 'cover',
                    display: 'block',
                    borderRadius: '12px 12px 0 0',
                  }}
                />
                <div style={{ 
                  flex: 1, 
                  padding: '16px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: isMobile ? 14 : 16, 
                      fontWeight: 600, 
                      color: '#fff',
                      marginBottom: 8,
                    }}>
                      {producto.nombre}
                    </h3>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: 12,
                    }}>
                      <span style={{ 
                        fontWeight: 600, 
                        fontSize: isMobile ? 16 : 18, 
                        color: sinStock ? '#bdbdbd' : '#8DAA91' 
                      }}>
                        ₡{Number(producto.precio).toFixed(2)}
                      </span>
                      <span style={{ 
                        color: '#bdbdbd', 
                        fontSize: isMobile ? 10 : 12 
                      }}>
                        {sinStock ? t('out_of_stock') : `${stockDisponible} ${t('bowls')}`}
                      </span>
                    </div>
                  </div>
                  <button 
                    style={{
                      background: 'var(--primary-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    ✏️ {t('edit_dish')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer with action buttons */}
      <div
        className='admin productos footer'
        style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--base-dark-line)',
          display: 'flex',
          justifyContent: 'flex-end',
          borderBottomLeftRadius: 'var(--border-radius-main)',
          borderBottomRightRadius: 'var(--border-radius-main)',
          gap: 12,
          flexShrink: 0,
          backgroundColor: 'var(--base-dark-bg-2)',
          boxSizing: 'border-box',
        }}
      >
        <button
          style={{
            background: 'transparent',
            color: 'var(--text-lighter)',
            border: '1px solid var(--base-dark-line)',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {t('discard_changes')}
        </button>
        <button
          style={{
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {t('save_changes')}
        </button>
      </div>
    </div>
  );
}

export default Productos;