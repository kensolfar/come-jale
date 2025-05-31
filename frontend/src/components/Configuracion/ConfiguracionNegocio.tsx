import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateConfiguracion } from '../../services/api';

const LANGS = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
];

export interface NegocioConfig {
  idioma: string;
  nombre_restaurante: string;
  direccion: string;
  telefono: string;
  logo: string;
  descripcion: string;
}

function normalizeConfig(cfg: Partial<NegocioConfig> | undefined): NegocioConfig {
  return {
    idioma: cfg?.idioma || 'es',
    nombre_restaurante: cfg?.nombre_restaurante || '',
    direccion: cfg?.direccion || '',
    telefono: cfg?.telefono || '',
    logo: cfg?.logo || '',
    descripcion: cfg?.descripcion || '',
  };
}

interface ConfigNegocioProps {
  config: NegocioConfig;
  setConfig: (c: NegocioConfig) => void;
  setIdioma?: (lang: string) => void;
  token: string;
}

const ConfiguracionNegocio: React.FC<ConfigNegocioProps> = ({ config, setConfig, setIdioma, token }) => {
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
      let data: NegocioConfig = { ...form };
      data = await updateConfiguracion(data, false, token);
      // 2. Si hay logoFile, subirlo aparte
      if (logoFile) {
        const logoResp = await import('../../services/api').then(m => m.uploadConfiguracionLogo(logoFile, token));
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

  return (
    <form onSubmit={handleSubmit} style={{
      width: '100%',
      height: '100%',
      maxWidth: 500,
      marginTop: '34px',
      marginLeft: '24px',
      background: 'transparent',
      padding: 0,
      borderRadius: 0,
      boxShadow: 'none',
      color: 'var(--white)',
      fontFamily: 'inherit',
      border: 'none',
      position: 'relative',
      paddingBottom: 24
    }}>
      <h2 style={{ textAlign: 'left'}}>{t('restaurant_configuration')}</h2>
      <label className="label" htmlFor="idioma">{t('language')}:</label>
      <select id="idioma" name="idioma" value={form.idioma} onChange={handleLangChange}>
        {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
      <label htmlFor="nombre_restaurante">{t('restaurant_name')}:</label>
      <input id="nombre_restaurante" name="nombre_restaurante" value={form.nombre_restaurante} onChange={handleChange} required />
      <label htmlFor="direccion">{t('address')}:</label>
      <input id="direccion" name="direccion" value={form.direccion} onChange={handleChange} />
      <label htmlFor="telefono">{t('phone')}:</label>
      <input id="telefono" name="telefono" value={form.telefono} onChange={handleChange} />
      <label htmlFor="descripcion">{t('description')}:</label>
      <textarea id="descripcion" name="descripcion" value={form.descripcion} onChange={handleChange} />
      <label style={{ marginTop: 18}} htmlFor="logo">{t('logo')}:</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18}}>
        <label className="upload" htmlFor="logo-upload">{t('select_file')}</label>
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
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 12, 
          marginTop: 24,
          position: 'absolute',
          bottom: 24,
          left: 0,
          width: '100%',
        }}
      >
        {error && <div className="config-negocio-error">{error}</div>}
        {success && <div className="config-negocio-success">{t('saved_success')}</div>}
        <div style={{ alignSelf: 'flex-end' }}>
          <button className='primary' type="submit" disabled={saving}>
            {saving ? t('saving') : t('save')}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ConfiguracionNegocio;
