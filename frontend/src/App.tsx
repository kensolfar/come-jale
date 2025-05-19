import { useState, useEffect } from 'react'
import Login from './components/Login'
import { setAuthToken, refreshToken } from './services/api'
import './App.css'
import ProductosList from './components/ProductosList'
import UserInfo from './components/UserInfo'
import { Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LogoutIcon from '@mui/icons-material/Logout';

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jwt_token'))
  const [refresh, setRefresh] = useState<string | null>(() => localStorage.getItem('jwt_refresh'))
  const [page, setPage] = useState<'dashboard' | 'productos' | 'ordenes'>('dashboard')
  const [drawerExpanded, setDrawerExpanded] = useState(true);

  const handleDrawerExpand = () => setDrawerExpanded(!drawerExpanded);

  const navItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, onClick: () => setPage('dashboard') },
    { label: 'Productos', icon: <RestaurantMenuIcon />, onClick: () => setPage('productos') },
    { label: 'Ordenes', icon: <ReceiptLongIcon />, onClick: () => setPage('ordenes') },
    { label: 'Cerrar sesión', icon: <LogoutIcon />, onClick: () => setToken(null), style: { marginTop: 'auto', color: '#a11' } },
  ];

  // Persistencia de tokens
  useEffect(() => {
    if (token) {
      localStorage.setItem('jwt_token', token)
      setAuthToken(token)
    } else {
      localStorage.removeItem('jwt_token')
      setAuthToken(null)
    }
  }, [token])

  useEffect(() => {
    if (refresh) {
      localStorage.setItem('jwt_refresh', refresh)
    } else {
      localStorage.removeItem('jwt_refresh')
    }
  }, [refresh])

  // Refrescar access token automáticamente si hay refresh token
  useEffect(() => {
    if (!refresh) return;
    const tryRefresh = async () => {
      try {
        const data = await refreshToken(refresh);
        setToken(data.access);
        if (data.refresh) setRefresh(data.refresh);
      } catch (err) {
        setToken(null);
        setRefresh(null);
      }
    };
    const interval = window.setInterval(tryRefresh, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refresh])

  if (!token) {
    return <Login onLogin={(access, refresh) => { setToken(access); setRefresh(refresh); }} />
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        open={drawerExpanded}
        PaperProps={{
          sx: {
            width: drawerExpanded ? 200 : 56,
            bgcolor: 'var(--color-latte-cream, #F5E1C6)',
            borderRight: '2px solid var(--color-coffee-brown, #855E42)',
            transition: 'width 0.2s',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            px: 0,
          }
        }}
      >
        <IconButton onClick={handleDrawerExpand} sx={{ my: 2 }}>
          <MenuIcon />
        </IconButton>
        <List sx={{ width: '100%', p: 0, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {navItems.map((item, idx) => (
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
                    ...item.style,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, color: 'var(--color-coffee-brown, #855E42)', justifyContent: 'center' }}>
                    {item.icon}
                  </ListItemIcon>
                  {drawerExpanded && <ListItemText primary={item.label} sx={{ ml: 1, color: 'var(--color-coffee-brown, #855E42)' }} />}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          ))}
        </List>
      </Drawer>
      <div style={{ flex: 1, padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
        {page === 'dashboard' && (
          <>
            <h1>🍝 Come-Jale 🍔</h1>
            <UserInfo token={token} />
            <p>Selecciona una opción en la navegación para continuar.</p>
          </>
        )}
        {page === 'productos' && (
          <>
            <h2>Productos</h2>
            <ProductosList token={token}/>
          </>
        )}
        {page === 'ordenes' && (
          <>
            <h2>Ordenes</h2>
          </>
        )}
      </div>
    </div>
  );
}

export default App
