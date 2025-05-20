import React from 'react';
import type { Producto } from '../services/api';

interface OrderItem {
  producto: Producto;
  cantidad: number;
}

interface OrderProps {
  order: OrderItem[];
}

const Order: React.FC<OrderProps> = ({ order }) => {
  const subtotal = order.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
  const impuesto = subtotal * 0.13;
  const total = subtotal + impuesto;

  return (
    <aside style={{
      background: '#23242a',
      color: '#fff',
      padding: '2rem 1rem', // padding lateral reducido
      borderRadius: 18,
      boxShadow: '-4px 0 24px 0 rgba(0,0,0,0.18)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      boxSizing: 'border-box', // asegurar que el padding no sume al ancho
    }}>
      <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 18, textAlign: 'center', color: '#b97b4a' }}>Orden</h2>
      {order.length === 0 ? (
        <div style={{ color: '#bdbdbd', textAlign: 'center', margin: '2rem 0' }}>No hay productos en la orden.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {order.map(item => (
            <li key={item.producto.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
              <img
                src={item.producto.imagen && item.producto.imagen.startsWith('http') ? item.producto.imagen : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${item.producto.imagen}`}
                alt={item.producto.nombre}
                style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', marginRight: 12 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{item.producto.nombre}</div>
                <div style={{ color: '#bdbdbd', fontSize: 14 }}>x{item.cantidad}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>₡{Number(item.producto.precio * item.cantidad).toFixed(2)}</div>
            </li>
          ))}
        </ul>
      )}
      {/* Resumen de totales */}
      <div style={{ borderTop: '1px solid #292b32', margin: '2rem 0 1rem 0', paddingTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span>Subtotal</span>
          <span>₡{subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span>Impuesto (13%)</span>
          <span>₡{impuesto.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18, marginTop: 12 }}>
          <span>Total</span>
          <span>₡{total.toFixed(2)}</span>
        </div>
      </div>
      <button
        style={{
          background: 'var(--color-accent, #ff5c5c)',
          color: '#fff',
          fontWeight: 800,
          fontSize: 18,
          border: 'none',
          borderRadius: 12,
          padding: '14px 0',
          marginTop: 18,
          cursor: 'pointer',
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
        }}
      >
        Imprimir cuenta
      </button>
    </aside>
  );
};

export default Order;
