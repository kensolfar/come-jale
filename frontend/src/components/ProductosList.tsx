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
        // Solo enviar los campos requeridos por el backend
        const { id, fecha_creacion, imagen, ...nuevoProducto } = product;
        // Eliminar campos vacíos
        const cleanData: any = {};
        Object.keys(nuevoProducto).forEach(key => {
          const value = (nuevoProducto as any)[key];
          if (value !== undefined && value !== null && value !== '') {
            cleanData[key] = value;
          }
        });
        await createProducto(cleanData);
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
    } catch (err: any) {
      let errorMsg = 'Error al guardar el producto';
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'object') {
          // Mostrar el primer error detallado
          const detalles = Object.entries(err.response.data)
            .map(([campo, mensajes]) => `${campo}: ${(Array.isArray(mensajes) ? mensajes.join(', ') : mensajes)}`)
            .join(' | ');
          errorMsg = `Error al guardar el producto: ${detalles}`;
        } else if (typeof err.response.data === 'string') {
          errorMsg = `Error al guardar el producto: ${err.response.data}`;
        }
      }
      setError(errorMsg);
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
      <button
        style={{
          marginBottom: 18,
          padding: '10px 24px',
          background: '#1a73e8',
          color: '#fff',
          fontWeight: 700,
          border: 'none',
          borderRadius: 8,
          fontSize: 17,
          cursor: 'pointer',
          transition: 'background 0.2s',
          display: 'block',
          marginLeft: 'auto',
        }}
        onClick={() => setSelectedProduct({
          id: 0,
          nombre: '',
          descripcion: '',
          precio: 0,
          imagen: '',
          disponible: true,
          categoria: '',
          subcategoria: '',
          fecha_creacion: ''
        })}
      >
        + Agregar producto
      </button>
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
