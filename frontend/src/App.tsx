import { useState, useEffect } from 'react'
import Login from './components/Login'
import { setAuthToken, refreshToken } from './services/api'
import './App.css'
import ProductosList from './components/ProductosList'
import Sidebar from './components/Sidebar';
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
      <Sidebar
        drawerExpanded={drawerExpanded}
        handleDrawerExpand={handleDrawerExpand}
        navItems={navItems}
        page={page}
        token={token!}
      />
      <div style={{ flex: 1, padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
        {page === 'dashboard' && (
          <>
            <h1>🍝 ComeJale 🍔</h1>
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
