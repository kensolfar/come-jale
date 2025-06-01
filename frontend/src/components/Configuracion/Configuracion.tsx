import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import { usarUsuario } from '../ContextoDeUsuario';
import ConfiguracionNegocio from './ConfiguracionNegocio';
import Productos from './Productos';

import type { NegocioConfig } from './ConfiguracionNegocio';

export type LlaveConfig = 'apariencia' | 'restaurante' | 'productos' | 'notificaciones' | 'seguridad' | 'facturacion';
export type rolesUsuario = 'administrador' | 'vendedor' | 'cliente' | 'repartidor' ;
export interface ConfiguracionProps {
  idioma: string;
  setIdioma: (lang: string) => void;
  token: string;
}
export interface NavItem {
  label: string;
  key: LlaveConfig;
  descripcion: string;
  icon: React.ReactNode;
  roles: rolesUsuario[];
  onClick: () => void;
}

const Configuracion: React.FC<ConfiguracionProps> = ({ token, setIdioma, idioma }) => {
  const { t, i18n } = useTranslation();
  const { usuario } = usarUsuario();
  const [pagina, setPagina] = useState<LlaveConfig>('apariencia');
  const navRef = useRef<HTMLDivElement>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [tocaElFondo, setTocaElFondo] = useState(false);
  const [config, setConfig] = useState<NegocioConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      setError(null);
      try {
        const data: NegocioConfig = await import('../../services/api').then(m => m.getConfiguracion());
        setConfig(data);
        if (data.idioma) {
          i18n.changeLanguage(data.idioma);
        }
      } catch {
        setError('Error al cargar la configuración');
      }
    }
    fetchConfig();
  }, [i18n]);

  useEffect(() => {
    function verificaSiTocaElFondo() {
      if (navRef.current && contenedorRef.current) setTocaElFondo(navRef.current.offsetHeight > contenedorRef.current.offsetHeight);
    }
    verificaSiTocaElFondo();
    window.addEventListener('resize', verificaSiTocaElFondo);
    return () => window.addEventListener('resize', verificaSiTocaElFondo);
  },[]);

  console.log('Configuracion renderizado', usuario);
  
  const iconStyle = { 
    width: 16,
    height: 16,
    marginTop: 1.67,
    marginBottom: 1.67,
    marginLeft: 1.33,
    marginRight: 1.33,
    color: 'var(--textlight)'
  }
  const navItems: NavItem[] = [
    {
      label: t('apariencia'),
      key: 'apariencia',
      descripcion: t('configuracion_apariencia_desc'),
      icon: <PaletteOutlinedIcon style={iconStyle}/>,
      roles: ['administrador', 'vendedor'],
      onClick: () => setPagina('apariencia'),
    },
    {
      label: t('restaurante'),
      key: 'restaurante',
      descripcion: t('configuracion_restaurante_desc'),
      icon: <StorefrontOutlinedIcon style={iconStyle} />,
      roles: ['administrador'],
      onClick: () => setPagina('restaurante'),
    },
    {
      label: t('productos'),
      key: 'productos',
      descripcion: t('configuracion_productos_desc'),
      icon: <Inventory2OutlinedIcon style={iconStyle} />,
      roles: ['administrador'],
      onClick: () => setPagina('productos'),
    },
    {
      label: t('notificaciones'),
      key: 'notificaciones',
      descripcion: t('configuracion_notificaciones_desc'),
      icon: <NotificationsOutlinedIcon style={iconStyle} />,
      roles: ['administrador'],
      onClick: () => setPagina('notificaciones'),
    },
    {
      label: t('seguridad'),
      key: 'seguridad',
      descripcion: t('configuracion_seguridad_desc'),
      icon: <SecurityOutlinedIcon style={iconStyle} />,
      roles: ['administrador', 'vendedor', 'cliente', 'repartidor'],
      onClick: () => setPagina('seguridad'),
    },
    {
      label: t('facturacion'),
      key: 'facturacion',
      descripcion: t('configuracion_facturacion_desc'),
      icon: <PointOfSaleOutlinedIcon style={iconStyle} />,
      roles: ['administrador'],
      onClick: () => setPagina('facturacion'),
    }
  ];

  return (
    <div 
      className='config-root'
      style={{ 
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem', 
        color: '#fff', 
        borderRadius: 15,
        boxSizing: 'border-box',
        gap: 10
      }}
    >   
      <h1 
        style={{ 
          fontSize: 24, 
          marginBottom: 16, 
          marginTop: 4, 
          textAlign: 'left' 
        }}
      >{t('configuracion')}</h1>
      <div
        className='config-container'
        style={{
          display: 'flex',
          height: '100%',
          gap: '1.5rem',
          boxSizing: 'border-box',
        }}
      >
        <div 
          className ='config-nav'
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '30%',
            height: '100%',
            borderRadius: 15,
            background: 'var(--base-dark-bg-2)',
            boxSizing: 'border-box',
          }}
        >
          <nav style={{ 
            width: '100%', 
            textAlign: 'left',
            display: 'flex', 
            flexDirection: 'column'
          }}>
            {navItems.map((item, i) => {
              const etiqueta = item.key;
              const esPrimero = i === 0;
              const esUltimo = i === navItems.length - 1;
              const tienePermiso = (Array.isArray(usuario?.groups) && item.roles.some(rol => usuario?.groups?.includes(rol))) || usuario?.is_superuser;
              if (!tienePermiso) return null;
              return (
                <button 
                  className='config-item' 
                  onClick={item.onClick}
                  key={item.key}
                  disabled={!tienePermiso}
                  style={{
                    border: 'none',
                    padding: '26px 0 26px 26px',
                    display: 'flex',
                    borderTopRightRadius: esPrimero ? 15 : 0,
                    borderTopLeftRadius: esPrimero ? 15 : 0,
                    borderBottomRightRadius: (esUltimo && tocaElFondo) ? 15 : 0,
                    borderBottomLeftRadius: (esUltimo && tocaElFondo) ? 15 : 0,
                    background: pagina === etiqueta ? 'var(--primary-color-transparent)' : 'transparent',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                > 
                  {
                    React.cloneElement(item.icon as React.ReactElement<any, any>, {
                      style: { 
                        ...iconStyle, 
                        color: pagina === etiqueta ? 'var(--primary-color)' : 'var(--textlight)' 
                      }
                    })
                  }
                  <div 
                    className='config-item-content' 
                    style={{ 
                      marginLeft: 8,
                      width: '100%',
                      borderRight: pagina === etiqueta ? '5px solid var(--primary-color)' : 'none'
                    }}
                  >
                    <h2 style={{ 
                      marginTop: 0, 
                      marginBottom: 2, 
                      color: pagina === etiqueta ? 'var(--primary-color)' : 'var(--white)',
                      fontSize: 'var(--body-normal-medium-font-size)', 
                      fontWeight: 'var(--body-normal-medium-font-weight)',
                      fontStyle: 'var(--body-normal-medium-font-style)',
                      lineHeight: 'var(--body-normal-medium-line-height)',
                      textAlign: 'left',
                    }}>
                      {item.label}
                    </h2>
                    <p style={{ 
                      marginTop: 2, 
                      marginBottom: 0,
                      fontSize: 'var(--body-small-regular-font-size)', 
                      fontWeight: 'var(--body-small-regular-font-weight)',
                      fontStyle: 'var(--body-small-regular-font-style)',
                      lineHeight: 'var(--body-small-regular-line-height)',
                      color: 'var(--textlight)',
                      textAlign: 'left',
                    }}>
                      {item.descripcion} 
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
        <div 
          className='config-content'
          style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            width: '70%',
            height: '100%',
            borderRadius: 15,
            background: 'var(--base-dark-bg-2)',
          }}
        >
          { pagina === 'apariencia' && <div>Aquí va la configuración de apariencia</div> }
          { pagina === 'restaurante' && config && (
            <ConfiguracionNegocio 
              config={config} 
              setConfig={setConfig} 
              setIdioma={setIdioma} 
              token={token} 
            />
          ) }
          { pagina === 'productos' && <Productos/> }
          { pagina === 'notificaciones' && <div>Aquí va la configuración de notificaciones</div> }
          { pagina === 'seguridad' && <div>Aquí va la configuración de seguridad</div> }
          { pagina === 'facturacion' && <div>Aquí va la configuración de facturación</div> }
        </div>
      </div>
    </div>
  );
};

export default Configuracion;