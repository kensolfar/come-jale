import React, { useState, useRef } from 'react';
import type { Producto } from '../services/api';
import { uploadProductoImagen } from '../services/api';

interface ProductDetailDialogProps {
  product: Producto | null;
  onClose: () => void;
  onSave: (product: Producto) => void;
  onDelete: (id: number) => void;
}

const ProductDetailDialog: React.FC<ProductDetailDialogProps> = ({ product, onClose, onSave, onDelete }) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'precio' ? parseFloat(value) : value });
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
        background: '#18191c',
        color: '#fff',
        padding: '2rem 2.5rem',
        borderRadius: 16,
        width: '95%',
        maxWidth: 420,
        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)',
        border: '1px solid #333',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: 24,
          fontWeight: 700,
          fontSize: 24,
          color: '#fff',
        }}>{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
        <label style={{ marginBottom: 12, fontWeight: 500 }}>
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
              background: '#232428',
              color: '#fff',
              fontSize: 16,
              marginBottom: 8,
            }}
          />
        </label>
        <label style={{ marginBottom: 12, fontWeight: 500 }}>
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
              background: '#232428',
              color: '#fff',
              fontSize: 15,
              minHeight: 60,
              marginBottom: 8,
              resize: 'vertical',
            }}
          />
        </label>
        <label style={{ marginBottom: 12, fontWeight: 500 }}>
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
              background: '#232428',
              color: '#fff',
              fontSize: 16,
              marginBottom: 8,
            }}
          />
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
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: uploading ? '#888' : '#222',
                color: '#fff',
                fontWeight: 700,
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 15,
                cursor: uploading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
              disabled={uploading}
            >
              {uploading ? 'Subiendo...' : 'Cambiar imagen'}
            </button>
          </div>
        </label>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 10 }}>
          <button
            onClick={handleSave}
            style={{
              background: '#222',
              color: '#fff',
              fontWeight: 700,
              border: 'none',
              borderRadius: 8,
              padding: '10px 24px',
              fontSize: 17,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            Guardar
          </button>
          {product && (
            <button
              onClick={handleDelete}
              style={{
                background: '#a11',
                color: '#fff',
                fontWeight: 700,
                border: 'none',
                borderRadius: 8,
                padding: '10px 24px',
                fontSize: 17,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              Eliminar
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              background: '#444',
              color: '#fff',
              fontWeight: 700,
              border: 'none',
              borderRadius: 8,
              padding: '10px 24px',
              fontSize: 17,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailDialog;
