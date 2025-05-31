import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ImpuestosCrud from './ImpuestosCrud';
import TipoCargoCrud from './TipoCargoCrud';
import ConfiguracionNegocio from './Configuracion/ConfiguracionNegocio';
import ConfigTipoOrdenes from './ConfigTipoOrdenes';


const TABS = [
  { key: 'general', label: 'configtabs_general' },
  { key: 'impuestos', label: 'configtabs_impuestos' },
  { key: 'cargos', label: 'configtabs_cargos' },
  { key: 'tiposorden', label: 'configtabs_tiposorden' },
];

// Import the RestauranteConfig type from ConfigEdit or its source file
import type { NegocioConfig } from './Configuracion/ConfiguracionNegocio';

export interface ConfigTabsProps {
  config: NegocioConfig;
  setConfig: (config: NegocioConfig) => void;
  setIdioma: (idioma: string) => void;
  loading: boolean;
  token: string;
}

const ConfigTabs = ({ config, setConfig, setIdioma, token }: ConfigTabsProps) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState('general');

  return (
    <div style={{ display: 'flex', minWidth: 600, minHeight: 400 }}>
      {/* Sidebar de tabs */}
      <div style={{
        background: '#232428',
        borderRadius: 16,
        padding: '24px 0',
        minWidth: 160,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        boxShadow: '2px 0 12px 0 rgba(0,0,0,0.10)',
        marginRight: 24,
      }}>
        {TABS.map(ti => (
          <button
            key={ti.key}
            onClick={() => setTab(ti.key)}
            style={{
              background: tab === ti.key ? '#8DAA91' : 'transparent',
              color: tab === ti.key ? '#fff' : '#bdbdbd',
              border: 'none',
              borderRadius: 12,
              padding: '14px 18px',
              fontWeight: 700,
              fontSize: 17,
              margin: '0 12px 8px 12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t(ti.label)}
          </button>
        ))}
      </div>
      {/* Panel de contenido */}
      <div style={{ flex: 1, background: '#232428', borderRadius: 16, padding: 0, minHeight: 400, position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        {/* Barra superior con título y botón cerrar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 64, borderTopLeftRadius: 16, borderTopRightRadius: 16, borderBottom: '1.5px solid #18191b', background: '#232428', position: 'sticky', top: 0, zIndex: 2 }}>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 22, margin: 0 }}>
            {t(TABS.find(ti => ti.key === tab)?.label || '')}
          </h2>
          <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('close-admin-modal'))} style={{
            background: '#232428', color: '#fff', border: '1.5px solid #8DAA91', borderRadius: 20, padding: '10px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
          }}
            onMouseOver={e => (e.currentTarget.style.background = '#18191b')}
            onMouseOut={e => (e.currentTarget.style.background = '#232428')}
          >{t('close')}</button>
        </div>
        <div style={{ padding: 32 }}>
          {tab === 'general' && (
            <ConfiguracionNegocio config={config} setConfig={setConfig} setIdioma={setIdioma} token={token} />
          )}
          {tab === 'impuestos' && (
            <ImpuestosCrud token={token} />
          )}
          {tab === 'cargos' && (
            <TipoCargoCrud token={token} />
          )}
          {tab === 'tiposorden' && (
            <ConfigTipoOrdenes token={token} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigTabs;
