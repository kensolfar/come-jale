import React, { useEffect, useState } from 'react';
import { FaCog } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { ConfigEdit } from './ConfigEdit';

interface BusinessInfoPanelProps {
  idioma: string;
  setIdioma: (lang: string) => void;
}

const BusinessInfoPanel: React.FC<BusinessInfoPanelProps> = ({ idioma, setIdioma }) => {
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
    <div style={{ marginTop: 8, fontSize: 14 }}>
      <strong>{t('restaurant')}:</strong> {config.nombre_restaurante}<br />
      <strong>{t('address')}:</strong> {config.direccion}<br />
      <strong>{t('phone')}:</strong> {config.telefono}<br />
      <button onClick={() => setIdioma(idioma === 'es' ? 'en' : 'es')} style={{ marginTop: 8 }}>
        {idioma === 'es' ? t('english') : t('spanish')}
      </button>
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
            <ConfigEdit config={config} setConfig={setConfig} loading={loading || config == null || Object.keys(config).length === 0} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessInfoPanel;
