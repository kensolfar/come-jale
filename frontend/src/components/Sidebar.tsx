import React from 'react';
import UserInfo from './UserInfo';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  style?: React.CSSProperties;
}

interface SidebarProps {
  navItems: NavItem[];
  page: string;
  token: string;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, page, token }) => (
  <aside style={{
    background: '#23242a',
    color: '#fff',
    padding: '2rem 1rem', // padding lateral reducido
    borderRadius: 18,
    boxShadow: '2px 0 12px 0 rgba(0,0,0,0.10)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    boxSizing: 'border-box',
  }}>
    <UserInfo token={token} expanded={true} />
    <nav style={{ width: '100%' }}>
      {navItems.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            background: page === item.label.toLowerCase() ? '#8DAA91' : 'transparent',
            color: page === item.label.toLowerCase() ? '#fff' : '#bdbdbd',
            border: 'none',
            borderRadius: 12,
            padding: '12px 18px',
            fontWeight: 700,
            fontSize: 18,
            marginBottom: 8,
            cursor: 'pointer',
            transition: 'all 0.2s',
            ...item.style,
          }}
        >
          <span style={{ marginRight: 14 }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
