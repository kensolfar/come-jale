import { useState, useEffect } from 'react'
import Login from './components/Login'
import { setAuthToken, refreshToken } from './services/api'
import './App.css'
import ProductosList from './components/ProductosList'
import UserInfo from './components/UserInfo'

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jwt_token'))
  const [refresh, setRefresh] = useState<string | null>(() => localStorage.getItem('jwt_refresh'))
  const [page, setPage] = useState<'dashboard' | 'productos'>('dashboard')

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
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <nav style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
        <button className="nav-btn" onClick={() => setPage('dashboard')}>Dashboard</button>
        <button className="nav-btn" onClick={() => setPage('productos')}>Productos</button>
        <button className="nav-btn" style={{ marginLeft: 'auto' }} onClick={() => setToken(null)}>Cerrar sesión</button>
      </nav>
      {page === 'dashboard' && (
        <>
          <h1>Bienvenido</h1>
          {/* Mostrar datos básicos del usuario conectado extraídos del JWT */}
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
    </div>
  )
}

export default App
