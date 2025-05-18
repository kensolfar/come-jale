import React, { useState } from 'react';
import { login, setAuthToken } from '../services/api';

interface LoginProps {
  onLogin: (access: string, refresh: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(username, password);
      setAuthToken(data.access);
      onLogin(data.access, data.refresh);
    } catch (err: any) {
      setError('Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 320,
        margin: '2rem auto',
        padding: 24,
        border: '1px solid #eee',
        borderRadius: 8,
        background: '#222',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 2px 16px #0002',
      }}
    >
      <h2 style={{ marginBottom: 24, textAlign: 'center', color: '#fff' }}>Iniciar sesión</h2>
      <div style={{ marginBottom: 12, width: '100%' }}>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #444', background: '#333', color: '#fff', fontSize: 16 }}
        />
      </div>
      <div style={{ marginBottom: 16, width: '100%' }}>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #444', background: '#333', color: '#fff', fontSize: 16 }}
        />
      </div>
      {error && <div style={{ color: 'red', marginBottom: 12, width: '100%', textAlign: 'center' }}>{error}</div>}
      <button
        className="primary-btn"
        type="submit"
        disabled={loading}
      >
        {loading ? 'Ingresando...' : 'Entrar'}
      </button>
    </form>
  );
};

export default Login;
