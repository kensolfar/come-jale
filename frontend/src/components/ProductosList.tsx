import { useEffect, useState } from 'react';
import { getProductos } from '../services/api';
import type { Producto } from '../services/api';

const placeholderImg = 'https://via.placeholder.com/100x100?text=Imagen+pendiente';

const ProductosList: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getProductos()
      .then(setProductos)
      .catch(() => setError('No se pudieron cargar los productos'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (productos.length === 0) return <p>No hay productos disponibles.</p>;

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {productos.map(prod => (
        <li key={prod.id} style={{
          marginBottom: 16,
          padding: 12,
          border: '1px solid #333',
          borderRadius: 6,
          background: '#222',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 120,
        }}>
          <div style={{ flex: 1 }}>
            <strong>{prod.nombre}</strong> <br />
            <span>₡{Number(prod.precio).toFixed(2)}</span> <br />
            <span style={{ color: '#aaa' }}>{prod.descripcion}</span>
          </div>
          <div style={{ marginLeft: 16, minWidth: 100, textAlign: 'center' }}>
            {prod.imagen && prod.imagen !== '' ? (
              <img src={prod.imagen.startsWith('http') ? prod.imagen : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${prod.imagen}`} alt={prod.nombre} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }} />
            ) : (
              <div style={{ width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#444', color: '#fff', borderRadius: 8, fontSize: 13 }}>
                Imagen pendiente
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ProductosList;
