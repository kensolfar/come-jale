import React, { useState, useRef, useEffect } from 'react';
import type { Producto, Categoria, Subcategoria } from '../services/api';
import { uploadProductoImagen, getCategorias, getSubcategorias } from '../services/api';
import { jwtDecode } from 'jwt-decode';

interface ProductDetailDialogProps {
  product: Producto | null;
  onClose: () => void;
  onSave: (product: Producto) => void;
  onDelete: (id: number) => void;
  token: string; // Nuevo prop para el token JWT
}

const ProductDetailDialog: React.FC<ProductDetailDialogProps> = ({ product, onClose, onSave, onDelete, token }) => {
  const [formData, setFormData] = useState<Producto>(
    product || { 
      id: 0, 
      nombre: '', 
      descripcion: '', 
      precio: 0, 
      imagen: '', 
      disponible: true, 
      categoria: '', 
      subcategoria: '', 
      fecha_creacion: '' 
    }
  );
  const [imagePreview, setImagePreview] = useState<string>(formData.imagen || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  //const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  //const [selectedSubcategoria, setSelectedSubcategoria] = useState<Subcategoria | null>(null);

  // Decodificar el JWT para obtener permisos
  let isAdmin = false;
  try {
    const decoded: any = jwtDecode(token);
    isAdmin = decoded.is_superuser || (decoded.groups && decoded.groups.includes('admin'));
  } catch (e) {
    isAdmin = false;
  }

  useEffect(() => {
    getCategorias().then(setCategorias);
  }, []);

  useEffect(() => {
    if (formData.categoria) {
      console.log('Categoría seleccionada:', formData.categoria);
      const catId = typeof formData.categoria === 'object' ? (formData.categoria as any).id : formData.categoria;
      console.log('ID de categoría:', catId);
      const cats = getSubcategorias(Number(catId)).then(cats => console.log('Subcategorías obtenidas:', cats));
      getSubcategorias(Number(catId)).then(setSubcategorias);
    } else {
      setSubcategorias([]);
    }
  }, [formData.categoria]);

  // Set default values for selects when editing a product
  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        categoria: typeof product.categoria === 'object' && product.categoria !== null ? String((product.categoria as any).id) : String(product.categoria || ''),
        subcategoria: typeof product.subcategoria === 'object' && product.subcategoria !== null ? String((product.subcategoria as any).id) : String(product.subcategoria || ''),
      });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'precio' ? parseFloat(value) : value });
  };

  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const catId = e.target.value;
    setFormData({ ...formData, categoria: catId, subcategoria: '' });
  };

  const handleSubcategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subcatId = e.target.value;
    setFormData({ ...formData, subcategoria: subcatId });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);
      try {
        if (!formData.id || formData.id === 0) {
          alert('Primero debes guardar el producto antes de subir una imagen.');
          setUploading(false);
          return;
        }
        const data = await uploadProductoImagen(file, formData.id);
        if (data.imagen) {
          setFormData(prev => ({ ...prev, imagen: data.imagen }));
          setImagePreview(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${data.imagen}`);
        }
      } catch (err) {
        alert('Error al subir la imagen.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSave = () => {
    // Elimina campos que no deben enviarse en updateProducto
    const { fecha_creacion, imagen, ...dataToSend } = formData;
    // Elimina campos vacíos o undefined de forma typesafe
    const cleanData: Partial<Producto> = {};
    (Object.keys(dataToSend) as (keyof typeof dataToSend)[]).forEach(key => {
      const value = dataToSend[key];
      if (value !== undefined && value !== null && value !== '') {
        (cleanData as any)[key] = value;
      }
    });
    onSave(cleanData as Producto);
    onClose();
  };

  const handleDelete = () => {
    if (product) {
      onDelete(product.id);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'var(--color-latte-cream, #F5E1C6)',
        color: 'var(--color-coffee-brown, #855E42)',
        padding: '2rem 2.5rem',
        borderRadius: 18,
        width: '95%',
        maxWidth: 420,
        boxShadow: '0 8px 32px 0 rgba(133,94,66,0.13)',
        border: 'var(--border-width-main, 2px) solid var(--color-coffee-brown, #855E42)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: 24,
          fontWeight: 800,
          fontSize: 24,
          color: 'var(--color-coffee-brown, #855E42)',
          fontFamily: 'var(--font-title, Nunito, sans-serif)'
        }}>{product ? (isAdmin ? 'Editar Producto' : 'Detalles del Producto') : 'Nuevo Producto'}</h2>
        <label style={{ marginBottom: 12, fontWeight: 500, textAlign: 'left', display: 'block' }}>
          Nombre:
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            style={{
              width: '100%',
              marginTop: 4,
              padding: '8px 10px',
              borderRadius: 6,
              border: '1px solid #333',
              background: '#fff',
              color: '#222',
              fontSize: 16,
              marginBottom: 8,
            }}
            disabled={!isAdmin}
          />
        </label>
        <label style={{ marginBottom: 12, fontWeight: 500, textAlign: 'left', display: 'block' }}>
          Descripción:
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            style={{
              width: '100%',
              marginTop: 4,
              padding: '8px 10px',
              borderRadius: 6,
              border: '1px solid #333',
              background: '#fff',
              color: '#222',
              fontSize: 15,
              minHeight: 60,
              marginBottom: 8,
              resize: 'vertical',
            }}
            disabled={!isAdmin}
          />
        </label>
        <label style={{ marginBottom: 12, fontWeight: 500, textAlign: 'left', display: 'block' }}>
          Precio:
          <input
            type="number"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            style={{
              width: '100%',
              marginTop: 4,
              padding: '8px 10px',
              borderRadius: 6,
              border: '1px solid #333',
              background: '#fff',
              color: '#222',
              fontSize: 16,
              marginBottom: 8,
            }}
            disabled={!isAdmin}
          />
        </label>
        <label style={{ marginBottom: 12, fontWeight: 500, textAlign: 'left', display: 'block' }}>
          Categoría:
          <select
            name="categoria"
            value={formData.categoria || ''}
            onChange={handleCategoriaChange}
            style={{
              width: '100%',
              marginTop: 4,
              padding: '8px 10px',
              borderRadius: 6,
              border: '1px solid #333',
              background: '#fff',
              color: '#222',
              fontSize: 16,
              marginBottom: 8,
            }}
            disabled={!isAdmin}
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
        </label>
        <label style={{ marginBottom: 12, fontWeight: 500, textAlign: 'left', display: 'block' }}>
          Subcategoría:
          <select
            name="subcategoria"
            value={formData.subcategoria || ''}
            onChange={handleSubcategoriaChange}
            style={{
              width: '100%',
              marginTop: 4,
              padding: '8px 10px',
              borderRadius: 6,
              border: '1px solid #333',
              background: '#fff',
              color: '#222',
              fontSize: 16,
              marginBottom: 8,
            }}
            disabled={!isAdmin || !formData.categoria}
          >
            <option value="">Selecciona una subcategoría</option>
            {subcategorias.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.nombre}</option>
            ))}
          </select>
        </label>
        <label style={{ marginBottom: 18, fontWeight: 500 }}>
          Imagen:
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
            {(imagePreview || formData.imagen) ? (
              <img
                src={
                  imagePreview
                    ? imagePreview
                    : (formData.imagen && formData.imagen.startsWith('http'))
                      ? formData.imagen
                      : formData.imagen
                        ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${formData.imagen}`
                        : ''
                }
                alt="Miniatura"
                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #333', background: '#232428' }}
              />
            ) : (
              <div style={{ width: 80, height: 80, background: '#444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontSize: 13 }}>
                Sin imagen
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImageChange}
              disabled={!isAdmin}
            />
            <button
              className="nav-btn"
              type="button"
              onClick={() => isAdmin && fileInputRef.current?.click()}
              disabled={uploading || !isAdmin}
            >
              {uploading ? 'Subiendo...' : 'Cambiar imagen'}
            </button>
          </div>
        </label>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 10 }}>
          {isAdmin && (
            <button
              className="nav-btn"
              onClick={handleSave}
            >
              Guardar
            </button>
          )}
          {isAdmin && product && (
            <button
              className="nav-btn"
              style={{ background: '#a11', color: '#fff' }}
              onClick={() => {
                if (window.confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) {
                  handleDelete();
                }
              }}
            >
              Eliminar
            </button>
          )}
          <button
            className="nav-btn"
            style={{ background: '#444', color: '#fff' }}
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailDialog;
