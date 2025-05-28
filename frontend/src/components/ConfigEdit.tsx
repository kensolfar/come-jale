import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateConfiguracion } from '../services/api';

const LANGS = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
];

export interface RestauranteConfig {
  idioma: string;
  nombre_restaurante: string;
  direccion: string;
  telefono: string;
  logo: string;
  descripcion: string;
}

function normalizeConfig(cfg: Partial<RestauranteConfig> | undefined): RestauranteConfig {
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
  config: RestauranteConfig;
  setConfig: (c: RestauranteConfig) => void;
  setIdioma?: (lang: string) => void;
  loading: boolean;
  token: string;
}

export const ConfigEdit: React.FC<ConfigEditProps> = ({ config, setConfig, setIdioma, loading, token }) => {
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
  }, [success, setConfig]); // Remove 'form' from dependencies to avoid infinite loop

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
      // 1. Guardar datos de configuración (sin logo)
      let data: RestauranteConfig = { ...form };
      data = await updateConfiguracion(data, false, token);
      // 2. Si hay logoFile, subirlo aparte
      if (logoFile) {
        const logoResp = await import('../services/api').then(m => m.uploadConfiguracionLogo(logoFile, token));
        data.logo = logoResp.logo;
      }
      setSuccess(true);
      setForm(data);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response) {
        console.log('Error al guardar configuración:', err.response.data || err);
        setError((err.response.data as { detail?: string })?.detail || 'Error al guardar');
      } else {
        console.log('Error al guardar configuración:', err);
        setError('Error al guardar');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>{t('loading')}</div>;

  return (
    <form onSubmit={handleSubmit} style={{
      width: '100%',
      maxWidth: 500,
      margin: '0 auto',
      background: 'transparent',
      padding: 0,
      borderRadius: 0,
      boxShadow: 'none',
      color: '#fff',
      fontFamily: 'inherit',
      border: 'none',
      position: 'relative',
    }}>
      <h2 style={{ textAlign: 'center', color: '#fff', fontWeight: 700, marginBottom: 16, fontSize: 26 }}>{t('restaurant_configuration')}</h2>
      <label style={{ color: '#eee', fontWeight: 500, fontSize: 15, display: 'block', marginBottom: 8 }} htmlFor="idioma">{t('language')}:</label>
      <select id="idioma" name="idioma" value={form.idioma} onChange={handleLangChange} style={{
        background: '#232428', color: '#fff', border: '1.5px solid #8DAA91', borderRadius: 8, padding: '6px 12px', fontSize: 16, width: '100%', marginBottom: 18
      }}>
        {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
      <label style={{ color: '#eee', fontWeight: 500, fontSize: 15, display: 'block', marginBottom: 8 }} htmlFor="nombre_restaurante">{t('restaurant_name')}:</label>
      <input id="nombre_restaurante" name="nombre_restaurante" value={form.nombre_restaurante} onChange={handleChange} required style={{
        width: '100%', background: '#18191b', color: '#fff', border: '1.5px solid #8DAA91', borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 18
      }} />
      <label style={{ color: '#eee', fontWeight: 500, fontSize: 15, display: 'block', marginBottom: 8 }} htmlFor="direccion">{t('address')}:</label>
      <input id="direccion" name="direccion" value={form.direccion} onChange={handleChange} style={{
        width: '100%', background: '#18191b', color: '#fff', border: '1.5px solid #8DAA91', borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 18
      }} />
      <label style={{ color: '#eee', fontWeight: 500, fontSize: 15, display: 'block', marginBottom: 8 }} htmlFor="telefono">{t('phone')}:</label>
      <input id="telefono" name="telefono" value={form.telefono} onChange={handleChange} style={{
        width: '100%', background: '#18191b', color: '#fff', border: '1.5px solid #8DAA91', borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 18
      }} />
      <label style={{ color: '#eee', fontWeight: 500, fontSize: 15, display: 'block', marginBottom: 8 }} htmlFor="descripcion">{t('description')}:</label>
      <textarea id="descripcion" name="descripcion" value={form.descripcion} onChange={handleChange} style={{
        width: '100%', background: '#18191b', color: '#fff', border: '1.5px solid #8DAA91', borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 18, minHeight: 48
      }} />
      <label style={{ color: '#eee', fontWeight: 500, fontSize: 15, display: 'block', marginBottom: 8 }} htmlFor="logo">{t('logo')}:</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <label htmlFor="logo-upload" style={{
          background: 'var(--color-green-leaf, #8DAA91)', color: '#fff', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 15, boxShadow: '0 1px 4px rgba(0,0,0,0.10)'
        }}>{t('select_file')}</label>
        <input id="logo-upload" name="logo" type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
        <span style={{ color: '#ccc', fontSize: 14 }}>{logoFile?.name || (form.logo ? t('Logo actual') : t('no_file'))}</span>
      </div>
      {form.logo && typeof form.logo === 'string' && (
        <div style={{ margin: '8px 0 18px 0', textAlign: 'center' }}>
          <img src={form.logo.startsWith('http') ? form.logo : `${(typeof process !== 'undefined' && process.env && process.env.VITE_BACKEND_URL ? process.env.VITE_BACKEND_URL : '')}${form.logo}`}
            alt="logo"
            style={{ maxWidth: 120, maxHeight: 80, borderRadius: 8, background: '#fff' }} />
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
        <button type="submit" disabled={saving} style={{
          background: 'var(--color-green-leaf, #8DAA91)', color: '#fff', border: 'none', borderRadius: 20, padding: '10px 32px', fontWeight: 700, fontSize: 18, cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
        }}
          onMouseOver={e => (e.currentTarget.style.background = '#6e8c74')}
          onMouseOut={e => (e.currentTarget.style.background = 'var(--color-green-leaf, #8DAA91)')}
        >{saving ? t('saving') : t('save')}</button>
      </div>
      {error && <div style={{ background: 'rgba(255,107,107,0.12)', color: '#ff6b6b', marginTop: 14, textAlign: 'center', borderRadius: 8, padding: 8 }}>{error}</div>}
      {success && <div style={{ background: 'rgba(141,170,145,0.12)', color: '#8DAA91', marginTop: 14, textAlign: 'center', borderRadius: 8, padding: 8 }}>{t('saved_success')}</div>}
    </form>
  );
};
