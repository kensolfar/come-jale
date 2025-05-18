import { useEffect, useState } from 'react';
import { getProductos, createProducto, updateProducto, deleteProducto } from '../services/api';
import type { Producto } from '../services/api';
import ProductDetailDialog from './ProductDetailDialog';

const ProductosList: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);

  const handleSave = async (product: Producto) => {
    try {
      if (product.id === 0) {
        // Crear nuevo producto
        const { id, fecha_creacion, ...nuevoProducto } = product;
        await createProducto(nuevoProducto);
      } else {
        // Actualizar producto existente
        await updateProducto(product.id, product);
      }
      // Refrescar lista y cerrar el diálogo
      setLoading(true);
      setSelectedProduct(null);
      const productosActualizados = await getProductos();
      setProductos(productosActualizados);
      setLoading(false);
    } catch (err) {
      setError('Error al guardar el producto');
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProducto(id);
      setProductos(productos.filter(p => p.id !== id));
    } catch (err) {
      setError('Error al eliminar el producto');
    }
  };

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
    <>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {productos.map(prod => (
          <li
            key={prod.id}
            style={{
              marginBottom: 16,
              padding: 12,
              border: '1px solid #333',
              borderRadius: 6,
              background: '#222',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 120,
            }}
            onClick={() => setSelectedProduct(prod)}
          >
            <div style={{ flex: 1 }}>
              <strong>{prod.nombre}</strong> <br />
              <span>₡{Number(prod.precio).toFixed(2)}</span> <br />
              <span style={{ color: '#aaa' }}>{prod.descripcion}</span>
            </div>
            <div style={{ marginLeft: 16, minWidth: 100, textAlign: 'center' }}>
              {prod.imagen && prod.imagen !== '' ? (
                <img
                  src={prod.imagen.startsWith('http') ? prod.imagen : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${prod.imagen}`}
                  alt={prod.nombre}
                  style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }}
                />
              ) : (
                <div
                  style={{
                    width: 100,
                    height: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#444',
                    color: '#fff',
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                >
                  Imagen pendiente
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
      {selectedProduct && (
        <ProductDetailDialog
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </>
  );
};

export default ProductosList;
