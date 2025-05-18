import React, { useState } from 'react';
import type { Producto } from '../services/api';

interface ProductViewDialogProps {
  product: Producto;
  onClose: () => void;
  onOrder: (product: Producto, quantity: number) => void;
}

const ProductViewDialog: React.FC<ProductViewDialogProps> = ({ product, onClose, onOrder }) => {
  const [quantity, setQuantity] = useState(1);

  const handleOrder = () => {
    if (quantity > 0) onOrder(product, quantity);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#F5E1C6',
        color: '#855E42',
        borderRadius: 18,
        width: '95%',
        maxWidth: 420,
        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: 0,
        overflow: 'hidden',
      }}>
        {/* Imagen con degradado */}
        <div style={{ position: 'relative', width: '100%', height: 340, background: '#eee', overflow: 'hidden' }}>
          <img
            src={product.imagen && product.imagen.startsWith('http') ? product.imagen : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${product.imagen}`}
            alt={product.nombre}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              objectPosition: 'center center', // Centra la imagen
            }}
          />
          {/* Degradado inicia desde la mitad de la imagen */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(245,225,198,0) 0%, #F5E1C6 100%)',
          }} />
        </div>
        <div style={{ padding: '1.5rem 2rem 2rem 2rem', background: '#F5E1C6', flex: 1 }}>
          <h2 style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 800,
            fontSize: 28,
            margin: '0 0 10px 0',
            color: '#855E42',
            textAlign: 'center',
          }}>{product.nombre}</h2>
          <div style={{
            fontFamily: 'Open Sans, sans-serif',
            fontSize: 17,
            color: '#8DAA91',
            marginBottom: 18,
            textAlign: 'center',
            fontStyle: 'italic',
          }}>{product.descripcion}</div>
          <div style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            fontSize: 22,
            color: '#855E42',
            marginBottom: 18,
            textAlign: 'center',
          }}>
            ₡{Number(product.precio).toFixed(2)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              style={{
                background: '#855E42',
                color: '#fff',
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
            >
              <span style={{display: 'inline-block', width: 22, textAlign: 'center', lineHeight: '1'}}>−</span>
            </button>
            <span style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
              fontSize: 20,
              color: '#855E42',
              minWidth: 32,
              textAlign: 'center',
            }}>{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              style={{
                background: '#855E42',
                color: '#fff',
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
            >
              <span style={{display: 'inline-block', width: 22, textAlign: 'center', lineHeight: '1'}}>+</span>
            </button>
          </div>
          <button
            onClick={handleOrder}
            style={{
              width: '100%',
              background: '#8DAA91',
              color: '#fff',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 800,
              fontSize: 20,
              border: 'none',
              borderRadius: 10,
              padding: '14px 0',
              marginBottom: 12,
              cursor: 'pointer',
              transition: 'background 0.2s',
              boxShadow: '0 2px 8px 0 rgba(133,94,66,0.08)',
            }}
          >Ordenar</button>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              background: '#fff',
              color: '#855E42',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
              fontSize: 17,
              border: '1px solid #855E42',
              borderRadius: 10,
              padding: '10px 0',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ProductViewDialog;
