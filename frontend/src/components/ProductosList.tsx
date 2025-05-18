import { useEffect, useState } from 'react';
import { getProductos, createProducto, updateProducto, deleteProducto } from '../services/api';
import type { Producto } from '../services/api';
import ProductDetailDialog from './ProductDetailDialog';
import ProductViewDialog from './ProductViewDialog';

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

const ProductosList: React.FC<{ token?: string }> = ({ token }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);

  let isAdmin = false;
  //console.log('Token:', token); // <-- Mostrar el token en consola
  if (token) {
    const payload = parseJwt(token);
    //console.log('JWT payload:', payload); // <-- Mostrar el contenido del token en consola
    // Asegurarse de que groups sea un array y comparar correctamente
    isAdmin = !!payload && (Array.isArray(payload.groups) && payload.groups.includes('Administrador') || payload.is_superuser === true);
  }

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
      {isAdmin && (
        <button
          className="nav-btn"
          style={{
            marginBottom: 18,
            padding: '10px 24px',
            background: 'var(--color-green-leaf, #8DAA91)',
            color: '#fff',
            fontWeight: 700,
            border: 'none',
            borderRadius: 8,
            fontSize: 17,
            cursor: 'pointer',
            transition: 'background 0.2s',
            display: 'block',
            marginLeft: 'auto',
            boxShadow: 'none',
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
      )}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {productos.map(prod => (
          <li
            key={prod.id}
            style={{
              marginBottom: 16,
              padding: 0,
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
              <h2 style={{padding: 0, margin: 0, fontSize: 22, fontWeight: 550 }}>{prod.nombre}</h2>
                <span style={{ color: '#4caf50', display: 'block', marginTop: 1 }}>₡{Number(prod.precio).toFixed(2)} +IVA</span><br />
              <span style={{ color: '#aaa' }}>{prod.descripcion}</span>
            </div>
            <div style={{
              marginLeft: 16,
              minWidth: 0,
              textAlign: 'center',
              width: 180,
              height: 150,
              position: 'relative',
              borderRadius: 0,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'none',
            }}>
              {prod.imagen && prod.imagen !== '' ? (
                <>
                  <img
                    src={prod.imagen.startsWith('http') ? prod.imagen : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${prod.imagen}`}
                    alt={prod.nombre}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      borderRadius: 0,
                    }}
                  />
                  {/* Degradado hacia la izquierda */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: '60%',
                    background: 'linear-gradient(to left, rgba(34,34,34,0) 0%, #222 100%)',
                  }} />
                </>
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#444',
                    color: '#fff',
                    borderRadius: 0,
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
        isAdmin ? (
          <ProductDetailDialog
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onSave={handleSave}
            onDelete={handleDelete}
            token={token || ''} // Asegura string
          />
        ) : (
          <ProductViewDialog
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onOrder={(product, quantity) => {
              // Aquí puedes implementar la lógica de orden, por ahora solo muestra un alert
              alert(`Ordenaste ${quantity} x ${product.nombre}`);
              setSelectedProduct(null);
            }}
          />
        )
      )}
    </>
  );
};

export default ProductosList;
