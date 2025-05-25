import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ImpuestosCrud from './ImpuestosCrud';
import OrdenCargosCrud from './OrdenCargosCrud';
import { ConfigEdit } from './ConfigEdit';

const TABS = [
  { key: 'general', label: 'General' },
  { key: 'impuestos', label: 'Impuestos' },
  { key: 'cargos', label: 'Cargos' },
];

const ConfigTabs = ({ config, setConfig, setIdioma, loading, token }: any) => {
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
      <div style={{ flex: 1, background: 'none', borderRadius: 16, padding: 0, minHeight: 400 }}>
        {tab === 'general' && (
          <ConfigEdit config={config} setConfig={setConfig} setIdioma={setIdioma} loading={loading} token={token} />
        )}
        {tab === 'impuestos' && (
          <ImpuestosCrud token={token} />
        )}
        {tab === 'cargos' && (
          <OrdenCargosCrud token={token} />
        )}
      </div>
    </div>
  );
};

export default ConfigTabs;
