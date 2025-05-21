import React, { useEffect, useState } from 'react';
import { FaCog } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { ConfigEdit } from './ConfigEdit';

interface BusinessInfoPanelProps {
  idioma: string;
  setIdioma: (lang: string) => void;
  token: string;
}

const BusinessInfoPanel: React.FC<BusinessInfoPanelProps> = ({ idioma, setIdioma, token }) => {
  const { t, i18n } = useTranslation();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true);
      setError(null);
      try {
        const data = await import('../services/api').then(m => m.getConfiguracion());
        setConfig(data);
        if (data.idioma) {
          i18n.changeLanguage(data.idioma);
        }
      } catch (err: any) {
        setError('Error al cargar la configuración');
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  useEffect(() => {
    const open = () => setAdminOpen(true);
    const close = () => setAdminOpen(false);
    window.addEventListener('open-admin-modal', open);
    window.addEventListener('close-admin-modal', close);
    return () => {
      window.removeEventListener('open-admin-modal', open);
      window.removeEventListener('close-admin-modal', close);
    };
  }, []);

  if (loading) return <div>{t('Cargando...')}</div>;
  if (error) return <div style={{ color: '#ff6b6b' }}>{error}</div>;
  if (!config) return null;

  return (
    <div style={{ marginTop: 8, fontSize: 14, position: 'relative', minHeight: 48, padding: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, gap: 18 }}>
        {/* Avatar logo a la izquierda */}
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#232428', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid #8DAA91', flexShrink: 0 }}>
          {config.logo ? (
            <img src={config.logo.startsWith('http') ? config.logo : `${import.meta.env.VITE_BACKEND_URL || ''}${config.logo}`}
              alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: '#8DAA91', fontSize: 28, fontWeight: 700 }}>🍽️</span>
          )}
        </div>
        {/* Nombre y botón idioma */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: 0.5, textAlign: 'left', flex: 1 }}>{config.nombre_restaurante}</span>
            <button
              onClick={() => setIdioma(idioma === 'es' ? 'en' : 'es')}
              style={{ marginLeft: 16, background: 'none', border: '1.5px solid #8DAA91', color: '#8DAA91', borderRadius: 16, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.background = '#232428')}
              onMouseOut={e => (e.currentTarget.style.background = 'none')}
            >
              {idioma === 'es' ? t('english') : t('spanish')}
            </button>
          </div>
        </div>
      </div>
      {/* Dirección y teléfono debajo */}
      <div style={{ marginTop: 10, textAlign: 'center' }}>
        <span style={{ display: 'block', marginBottom: 2 }}><strong style={{ fontWeight: 700, color: '#8DAA91' }}>📍 {t('address')}:</strong> <span style={{ color: '#fff' }}>{config.direccion}</span></span>
        <span style={{ display: 'block' }}><strong style={{ fontWeight: 700, color: '#8DAA91' }}>📞 {t('phone')}:</strong> <span style={{ color: '#fff' }}>{config.telefono}</span></span>
      </div>
      <button
        onClick={() => setAdminOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, margin: '16px auto 0', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16
        }}
        title={t('admin_panel')}
      >
        <FaCog size={20} />
        <span>{t('admin_panel')}</span>
      </button>
      {adminOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 2000,
          background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'transparent', borderRadius: 0, boxShadow: 'none', padding: 0, position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center', width: 'auto', height: 'auto', minWidth: 0, minHeight: 0
          }}>
            <ConfigEdit config={config} setConfig={setConfig} loading={loading || config == null || Object.keys(config).length === 0} token={token} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessInfoPanel;
