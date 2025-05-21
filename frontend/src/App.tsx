import { useState, useEffect } from 'react'
import Login from './components/Login'
import { setAuthToken, refreshToken } from './services/api'
import './App.css'
import Sidebar from './components/Sidebar';
import Menu from './components/Menu';
import Order from './components/Order';
import type { Producto } from './services/api';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LogoutIcon from '@mui/icons-material/Logout';
import ProductosList from './components/ProductosList';

interface OrderItem {
  producto: Producto;
  cantidad: number;
}

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jwt_token'))
  const [refresh, setRefresh] = useState<string | null>(() => localStorage.getItem('jwt_refresh'))
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [page, setPage] = useState<'dashboard' | 'productos' | 'ordenes'>('dashboard');

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
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      width: '100vw',
      height: '100vh',
      background: '#18191f',
      overflow: 'hidden',
      boxSizing: 'border-box',
      padding: '1rem 1rem',
    }}>
      {/* Sidebar (izquierda) */}
      <div className='columna izquierda' style={{boxSizing: 'border-box' }}>
        <Sidebar navItems={navItems} page={page} token={token || ''} />
      </div>
      {/* Contenido central (menú) */}
      <div className='columna centro' style={{overflowY: 'auto', padding: '0 1.5rem', boxSizing: 'border-box' }}>
        {page === 'dashboard' && <Menu order={order} setOrder={setOrder} />}
        {page === 'productos' && <ProductosList token={token || ''} />}
        {/* Aquí puedes agregar más páginas según el valor de page */}
      </div>
      {/* Orden (derecha) */}
      <div className='columna derecha' style={{boxSizing: 'border-box' }}>
        <Order order={order} />
      </div>
    </div>
  );
}

export default App;
