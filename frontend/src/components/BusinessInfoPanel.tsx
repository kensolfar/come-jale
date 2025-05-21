import React from 'react';
import { FaCog } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface BusinessInfoPanelProps {
  config: any;
  idioma: string;
  setIdioma: (lang: string) => void;
  onOpenAdmin: () => void;
}

const BusinessInfoPanel: React.FC<BusinessInfoPanelProps> = ({ config, idioma, setIdioma, onOpenAdmin }) => {
  const { t } = useTranslation();
  return (
    <div style={{ marginTop: 8, fontSize: 14 }}>
      <strong>{t('restaurant')}:</strong> {config.nombre_restaurante}<br />
      <strong>{t('address')}:</strong> {config.direccion}<br />
      <strong>{t('phone')}:</strong> {config.telefono}<br />
      <button onClick={() => setIdioma(idioma === 'es' ? 'en' : 'es')} style={{ marginTop: 8 }}>
        {idioma === 'es' ? t('english') : t('spanish')}
      </button>
      <button
        onClick={onOpenAdmin}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, margin: '16px auto 0', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16
        }}
        title={t('admin_panel')}
      >
        <FaCog size={20} />
        <span>{t('admin_panel')}</span>
      </button>
    </div>
  );
};

export default BusinessInfoPanel;
