import React, { useEffect, useRef } from 'react';
import UserInfo from './UserInfo';
import { useTranslation } from 'react-i18next';
import BusinessInfoPanel from './BusinessInfoPanel';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  style?: React.CSSProperties;
  key: string;
}

interface SidebarProps {
  navItems: NavItem[];
  page: string;
  token: string;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, page, token }) => {
  const { t } = useTranslation();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showLabel, setShowLabel] = React.useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (buttonRef.current) {
        setShowLabel(buttonRef.current.offsetWidth > 120); // Limite para mostrar el label
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <aside style={{
      borderRadius: 15,
      background: 'var(--base-dark-bg-2)',
      color: '#fff',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      boxSizing: 'border-box',
      height: '100vh',
      minWidth: 130,
      padding: '0 0 0 15px',
    }}>
      {/*<BusinessInfoPanel
        idioma={i18n.language}
        setIdioma={(lang: string) => i18n.changeLanguage(lang)}
        token={token}
      />*/}
      {/*<UserInfo token={token} expanded={true} />*/}
      <nav style={{ 
        width: '100%',
        boxSizing: 'border-box',
        marginTop: 40,
      }}>
        {navItems.map((item) => {
          // For multilenguaje: convert label to a translation key (snake_case)
          const labelKey = item.key
            .toLowerCase()
            .replace(/ /g, '_')
            .replace(/[^a-z0-9_]/g, '');
          return (
            <button
              key={item.label}
              onClick={item.onClick}
              ref={buttonRef}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: 100,
                minWidth: 100,
                background: page === labelKey ? 'var(--base-dark-bg-1)' : 'var(--base-dark-bg-2)',
                color: page === labelKey ? '#fff' : '#bdbdbd',
                border: 'none',
                borderTopLeftRadius: 15,
                borderBottomLeftRadius: 15,
                borderTopRightRadius: labelKey ? 0 : 15,
                borderBottomRightRadius: 0,
                padding: '20px',
                fontWeight: 700,
                fontSize: 18,
                cursor: 'pointer',
                transition: 'all 0.2s',
                zIndex: 1,
                ...item.style,
              }}
            >
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 15,
                width: '100%',
                height: '100%',
                boxShadow: page === labelKey ? '0 0 8px 0 var(--primary-color)' : 'none',
                background: page === labelKey ? 'var(--primary-color)' : 'transparent',
              }}>
                <span style={{ 
                  marginRight: showLabel ? 14 : 0, // Espacio entre icono y label solo si está activo
                  width: !showLabel ? '100%' : 'auto', // Centrar icono si no hay label
                }}>
                  {React.isValidElement(item.icon)
                    ? React.cloneElement(item.icon as React.ReactElement<any, any>, {
                        style: { color: page === labelKey ? '#fff' : 'var(--primary-color)' }
                      })
                    : item.icon}
                </span>
                {showLabel && <h2>{t(labelKey)}</h2>}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
