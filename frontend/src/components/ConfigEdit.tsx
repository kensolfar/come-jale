import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateConfiguracion } from '../services/api';

const LANGS = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
];

function normalizeConfig(cfg: any) {
  return {
    idioma: cfg?.idioma || 'es',
    nombre_restaurante: cfg?.nombre_restaurante || '',
    direccion: cfg?.direccion || '',
    telefono: cfg?.telefono || '',
    logo: cfg?.logo || '',
    descripcion: cfg?.descripcion || '',
  };
}

interface ConfigEditProps {
  config: any;
  setConfig: (c: any) => void;
  setIdioma?: (lang: string) => void;
  loading: boolean;
}

export const ConfigEdit: React.FC<ConfigEditProps> = ({ config, setConfig, setIdioma, loading }) => {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState(normalizeConfig(config));
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (config) setForm(normalizeConfig(config));
  }, [config]);

  React.useEffect(() => {
    if (success) {
      setConfig(normalizeConfig(form));
    }
  }, [success, setConfig, form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, idioma: e.target.value });
    if (setIdioma) setIdioma(e.target.value);
    i18n.changeLanguage(e.target.value); // Cambio inmediato de idioma
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      let data: any = { ...form };
      if (logoFile) {
        const formData = new FormData();
        Object.entries(data).forEach(([k, v]) => formData.append(k, v as string));
        formData.append('logo', logoFile);
        data = await updateConfiguracion(formData, true);
      } else {
        data = await updateConfiguracion(data, false);
      }
      setSuccess(true);
      setForm(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>{t('Cargando...')}</div>;

  return (
    <form onSubmit={handleSubmit} style={{
      maxWidth: 500,
      margin: '0 auto',
      background: '#232428',
      padding: 32,
      borderRadius: 16,
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      color: '#fff',
      fontFamily: 'inherit',
      border: 'none',
      position: 'relative',
    }}>
      <h2 style={{ textAlign: 'center', color: '#fff', fontWeight: 700, marginBottom: 16, fontSize: 26 }}>{t('Configuración del Restaurante')}</h2>
      <label style={{ color: '#eee', fontWeight: 500, fontSize: 15, display: 'block', marginBottom: 8 }} htmlFor="idioma">{t('Idioma')}:</label>
      <select id="idioma" name="idioma" value={form.idioma} onChange={handleLangChange} style={{
        background: '#232428', color: '#fff', border: '1.5px solid #8DAA91', borderRadius: 8, padding: '6px 12px', fontSize: 16, width: '100%', marginBottom: 18
      }}>
        {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
      <label style={{ color: '#eee', fontWeight: 500, fontSize: 15, display: 'block', marginBottom: 8 }} htmlFor="nombre_restaurante">{t('Nombre del restaurante')}:</label>
      <input id="nombre_restaurante" name="nombre_restaurante" value={form.nombre_restaurante} onChange={handleChange} required style={{
        width: '100%', background: '#18191b', color: '#fff', border: '1.5px solid #8DAA91', borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 18
      }} />
      <label style={{ color: '#eee', fontWeight: 500, fontSize: 15, display: 'block', marginBottom: 8 }} htmlFor="direccion">{t('Dirección')}:</label>
      <input id="direccion" name="direccion" value={form.direccion} onChange={handleChange} style={{
        width: '100%', background: '#18191b', color: '#fff', border: '1.5px solid #8DAA91', borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 18
      }} />
      <label style={{ color: '#eee', fontWeight: 500, fontSize: 15, display: 'block', marginBottom: 8 }} htmlFor="telefono">{t('Teléfono')}:</label>
      <input id="telefono" name="telefono" value={form.telefono} onChange={handleChange} style={{
        width: '100%', background: '#18191b', color: '#fff', border: '1.5px solid #8DAA91', borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 18
      }} />
      <label style={{ color: '#eee', fontWeight: 500, fontSize: 15, display: 'block', marginBottom: 8 }} htmlFor="descripcion">{t('Descripción')}:</label>
      <textarea id="descripcion" name="descripcion" value={form.descripcion} onChange={handleChange} style={{
        width: '100%', background: '#18191b', color: '#fff', border: '1.5px solid #8DAA91', borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 18, minHeight: 48
      }} />
      <label style={{ color: '#eee', fontWeight: 500, fontSize: 15, display: 'block', marginBottom: 8 }} htmlFor="logo">{t('Logo')}:</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <label htmlFor="logo-upload" style={{
          background: 'var(--color-green-leaf, #8DAA91)', color: '#fff', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 15, boxShadow: '0 1px 4px rgba(0,0,0,0.10)'
        }}>{t('Seleccionar archivo')}</label>
        <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
        <span style={{ color: '#ccc', fontSize: 14 }}>{logoFile?.name || (form.logo ? t('Logo actual') : t('Sin archivo'))}</span>
      </div>
      {form.logo && typeof form.logo === 'string' && (
        <div style={{ margin: '8px 0 18px 0', textAlign: 'center' }}>
          <img src={form.logo.startsWith('http') ? form.logo : `${import.meta.env.VITE_BACKEND_URL || ''}${form.logo}`} alt="logo" style={{ maxWidth: 120, maxHeight: 80, borderRadius: 8, background: '#fff' }} />
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('close-admin-modal'))} style={{
          background: '#232428', color: '#fff', border: '1.5px solid #8DAA91', borderRadius: 20, padding: '10px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
        }}
          onMouseOver={e => (e.currentTarget.style.background = '#18191b')}
          onMouseOut={e => (e.currentTarget.style.background = '#232428')}
        >{t('Cerrar')}</button>
        <button type="submit" disabled={saving} style={{
          background: 'var(--color-green-leaf, #8DAA91)', color: '#fff', border: 'none', borderRadius: 20, padding: '10px 32px', fontWeight: 700, fontSize: 18, cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
        }}
          onMouseOver={e => (e.currentTarget.style.background = '#6e8c74')}
          onMouseOut={e => (e.currentTarget.style.background = 'var(--color-green-leaf, #8DAA91)')}
        >{saving ? t('Guardando...') : t('Guardar')}</button>
      </div>
      {error && <div style={{ background: 'rgba(255,107,107,0.12)', color: '#ff6b6b', marginTop: 14, textAlign: 'center', borderRadius: 8, padding: 8 }}>{error}</div>}
      {success && <div style={{ background: 'rgba(141,170,145,0.12)', color: '#8DAA91', marginTop: 14, textAlign: 'center', borderRadius: 8, padding: 8 }}>{t('Guardado correctamente')}</div>}
    </form>
  );
};
