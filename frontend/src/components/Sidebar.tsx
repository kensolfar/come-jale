import React from 'react';
import { Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import UserInfo from './UserInfo';
import './Sidebar.css';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  style?: React.CSSProperties;
}

interface SidebarProps {
  drawerExpanded: boolean;
  handleDrawerExpand: () => void;
  navItems: NavItem[];
  page: string;
  token: string;
}

const Sidebar: React.FC<SidebarProps> = ({ drawerExpanded, handleDrawerExpand, navItems, page, token }) => (
  <Drawer
    variant="permanent"
    open={drawerExpanded}
    PaperProps={{
      sx: {
        width: drawerExpanded ? 200 : 56,
        bgcolor: 'var(--color-bg-panel, #23242a)',
        borderRight: '2px solid var(--color-border, #292b32)',
        transition: 'width 0.2s',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        px: 0,
        boxShadow: '0 2px 16px 0 rgba(0,0,0,0.10)',
        borderRadius: '18px 0 0 18px',
      }
    }}
    className="sidebar-drawer"
  >
    <IconButton onClick={handleDrawerExpand} sx={{ my: 2, color: 'var(--color-green-leaf, #8DAA91)' }}>
      <MenuIcon />
    </IconButton>
    <List sx={{ width: '100%', p: 0, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ width: '100%' }}>
        {navItems.slice(0, -1).map((item) => {
          const isActive = page === item.label.toLowerCase();
          return (
            <Tooltip key={item.label} title={drawerExpanded ? '' : item.label} placement="right">
              <ListItem disablePadding sx={{ width: '100%' }}>
                <ListItemButton
                  onClick={item.onClick}
                  sx={{
                    minHeight: 56,
                    height: 56,
                    justifyContent: 'center',
                    borderRadius: 2,
                    m: 1,
                    aspectRatio: '1/1',
                    background: isActive ? 'var(--color-green-leaf, #8DAA91)' : 'none',
                    color: isActive ? '#fff' : 'var(--color-text-secondary, #bdbdbd)',
                    '&:hover': {
                      background: 'var(--color-green-leaf, #8DAA91)',
                      color: '#fff',
                      '& .MuiListItemIcon-root': {
                        color: '#fff',
                      },
                    },
                    ...item.style,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, color: isActive ? '#fff' : 'var(--color-green-leaf, #8DAA91)', justifyContent: 'center', transition: 'color 0.2s' }}>
                    {item.icon}
                  </ListItemIcon>
                  {drawerExpanded && <ListItemText primary={item.label} sx={{ ml: 1, color: isActive ? '#fff' : 'var(--color-text-secondary, #bdbdbd)' }} />}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </div>
      <div style={{ width: '100%', marginBottom: 8 }}>
        <UserInfo token={token} expanded={drawerExpanded} />
        <Tooltip title={drawerExpanded ? '' : navItems[navItems.length-1].label} placement="right">
          <ListItem disablePadding sx={{ width: '100%' }}>
            <ListItemButton
              onClick={navItems[navItems.length-1].onClick}
              sx={{
                minHeight: 56,
                height: 56,
                justifyContent: 'center',
                borderRadius: 2,
                m: 1,
                aspectRatio: '1/1',
                background: '#2d2323',
                color: '#fff',
                '&:hover': {
                  background: '#a11',
                  color: '#fff',
                  '& .MuiListItemIcon-root': {
                    color: '#fff',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, color: '#fff', justifyContent: 'center' }}>
                {navItems[navItems.length-1].icon}
              </ListItemIcon>
              {drawerExpanded && <ListItemText primary={navItems[navItems.length-1].label} sx={{ ml: 1, color: '#fff' }} />}
            </ListItemButton>
          </ListItem>
        </Tooltip>
      </div>
    </List>
  </Drawer>
);

export default Sidebar;
