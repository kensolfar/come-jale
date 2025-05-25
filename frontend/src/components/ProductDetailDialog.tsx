import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCategorias, getSubcategorias, createProducto, updateProducto } from '../services/api';
import type { Producto, Categoria, Subcategoria } from '../services/api';

interface ProductDetailDialogProps {
  product: Producto | null;
  onClose: () => void;
  onSave: (product: Producto) => void;
  onDelete: (id: number) => void;
  token: string;
}

const initialForm: Omit<Producto, 'id' | 'fecha_creacion'> = {
  nombre: '',
  descripcion: '',
  precio: 0,
  imagen: '',
  disponible: true,
  categoria: '',
  cantidad: 0,
  subcategoria: '',
};

const ProductDetailDialog: React.FC<ProductDetailDialogProps> = ({ product, onClose, onSave, onDelete }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Omit<Producto, 'id' | 'fecha_creacion'>>(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCategorias().then(setCategorias);
  }, []);

  useEffect(() => {
    if (formData.categoria) {
      getSubcategorias(Number(formData.categoria)).then(setSubcategorias);
    } else {
      setSubcategorias([]);
    }
  }, [formData.categoria]);

  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        precio: product.precio || 0,
        imagen: product.imagen || '',
        disponible: product.disponible,
        categoria: product.categoria ? String((product.categoria as any).id || product.categoria) : '',
        cantidad: product.cantidad || 0,
        subcategoria: product.subcategoria ? String((product.subcategoria as any).id || product.subcategoria) : '',
      });
      setImagePreview(product.imagen ? (product.imagen.startsWith('http') ? product.imagen : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${product.imagen}`) : '');
    } else {
      setFormData(initialForm);
      setImagePreview('');
    }
    setErrors({});
    setImageFile(null);
  }, [product]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.nombre.trim()) newErrors.nombre = t('name') + ' ' + t('required');
    if (!formData.precio || isNaN(Number(formData.precio)) || Number(formData.precio) <= 0) newErrors.precio = t('price') + ' ' + t('required');
    if (!formData.cantidad || isNaN(Number(formData.cantidad)) || Number(formData.cantidad) < 0) newErrors.cantidad = t('quantity') + ' ' + t('required');
    if (!formData.categoria) newErrors.categoria = t('category') + ' ' + t('required');
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      let newValue: any = value;
      if (["precio", "cantidad", "categoria", "subcategoria"].includes(name)) {
        newValue = value === '' ? '' : Number(value);
      }
      return {
        ...prev,
        [name]: newValue,
      };
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setLoading(true);
    console.log('Saving product:', formData);
    try {
      const form = new FormData();
      form.append('nombre', formData.nombre);
      form.append('descripcion', formData.descripcion);
      form.append('precio', String(formData.precio));
      form.append('disponible', String(formData.disponible));
      form.append('categoria', String(Number(formData.categoria)));
      form.append('cantidad', String(formData.cantidad));
      if (formData.subcategoria) form.append('subcategoria', String(Number(formData.subcategoria)));
      if (imageFile) form.append('imagen', imageFile);
      let saved;
      if (product && product.id) {
        saved = await updateProducto(product.id, form as any);
      } else {
        saved = await createProducto(form as any);
      }
      onSave(saved);
      onClose();
    } catch (err: any) {
      if (err.response && err.response.data) {
        const apiErrors = err.response.data;
        const newErrors: { [key: string]: string } = {};
        Object.keys(apiErrors).forEach(key => {
          newErrors[key] = Array.isArray(apiErrors[key]) ? apiErrors[key][0] : apiErrors[key];
        });
        setErrors(newErrors);
      } else {
        setErrors({ general: t('error_saving') });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (product && product.id) {
      if (window.confirm(t('are_you_sure_delete'))) {
        onDelete(product.id);
        onClose();
      }
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
        <h2 style={{ textAlign: 'center', marginBottom: 24, fontWeight: 800, fontSize: 24 }}>{product ? t('edit_product') : t('new_product')}</h2>
        {errors.general && <div style={{ color: 'red', marginBottom: 8 }}>{errors.general}</div>}
        <label style={{ marginBottom: 12, fontWeight: 500, textAlign: 'left', display: 'block' }}>
          {t('name')}:<span style={{ color: 'red' }}>*</span>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            style={{ width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 6, border: '1px solid #333', background: '#fff', color: '#222', fontSize: 16, marginBottom: 8 }}
            disabled={loading}
          />
          {errors.nombre && <div style={{ color: 'red', fontSize: 13 }}>{errors.nombre}</div>}
        </label>
        <label style={{ marginBottom: 12, fontWeight: 500, textAlign: 'left', display: 'block' }}>
          {t('description')}:
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            style={{ width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 6, border: '1px solid #333', background: '#fff', color: '#222', fontSize: 15, minHeight: 60, marginBottom: 8, resize: 'vertical' }}
            disabled={loading}
          />
        </label>
        <label style={{ marginBottom: 12, fontWeight: 500, textAlign: 'left', display: 'block' }}>
          {t('quantity')}:<span style={{ color: 'red' }}>*</span>
          <input
            type="number"
            name="cantidad"
            value={formData.cantidad}
            onChange={handleChange}
            style={{ width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 6, border: '1px solid #333', background: '#fff', color: '#222', fontSize: 16, marginBottom: 8 }}
            disabled={loading}
          />
          {errors.cantidad && <div style={{ color: 'red', fontSize: 13 }}>{errors.cantidad}</div>}
        </label>
        <label style={{ marginBottom: 12, fontWeight: 500, textAlign: 'left', display: 'block' }}>
          {t('price')}:<span style={{ color: 'red' }}>*</span>
          <input
            type="number"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            style={{ width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 6, border: '1px solid #333', background: '#fff', color: '#222', fontSize: 16, marginBottom: 8 }}
            disabled={loading}
          />
          {errors.precio && <div style={{ color: 'red', fontSize: 13 }}>{errors.precio}</div>}
        </label>
        <label style={{ marginBottom: 12, fontWeight: 500, textAlign: 'left', display: 'block' }}>
          {t('category')}:<span style={{ color: 'red' }}>*</span>
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            style={{ width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 6, border: '1px solid #333', background: '#fff', color: '#222', fontSize: 16, marginBottom: 8 }}
            disabled={loading}
          >
            <option value="">{t('select_category')}</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
          {errors.categoria && <div style={{ color: 'red', fontSize: 13 }}>{errors.categoria}</div>}
        </label>
        <label style={{ marginBottom: 12, fontWeight: 500, textAlign: 'left', display: 'block' }}>
          {t('subcategory')}:
          <select
            name="subcategoria"
            value={formData.subcategoria}
            onChange={handleChange}
            style={{ width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 6, border: '1px solid #333', background: '#fff', color: '#222', fontSize: 16, marginBottom: 8 }}
            disabled={loading || !formData.categoria}
          >
            <option value="">{t('select_subcategory')}</option>
            {subcategorias.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.nombre}</option>
            ))}
          </select>
        </label>
        <label style={{ marginBottom: 18, fontWeight: 500 }}>
          {t('image')}:
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImageChange}
              disabled={loading}
            />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading} style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #333', background: '#eee', cursor: 'pointer' }}>{t('change_image')}</button>
            {imagePreview && (
              <img src={imagePreview} alt="preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #aaa' }} />
            )}
          </div>
        </label>
        <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
          <button onClick={handleSave} disabled={loading} style={{ flex: 1, background: '#8DAA91', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 8, fontSize: 17, padding: '10px 0', cursor: 'pointer' }}>{loading ? t('saving') : t('save')}</button>
          {product && product.id && (
            <button onClick={handleDelete} disabled={loading} style={{ flex: 1, background: '#a11', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 8, fontSize: 17, padding: '10px 0', cursor: 'pointer' }}>{t('delete')}</button>
          )}
          <button onClick={onClose} disabled={loading} style={{ flex: 1, background: '#aaa', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 8, fontSize: 17, padding: '10px 0', cursor: 'pointer' }}>{t('cancel')}</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailDialog;
