import React from 'react';

interface UserInfoProps {
  token: string;
}

// Decodifica un JWT sin verificar la firma (solo para mostrar datos)
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

const UserInfo: React.FC<UserInfoProps> = ({ token }) => {
  const payload = parseJwt(token);
  if (!payload) return <p>No se pudo leer el usuario.</p>;
  return (
    <div style={{ background: '#232428', color: '#fff', borderRadius: 8, padding: '12px 18px', marginBottom: 16 }}>
      <strong>Usuario:</strong> {payload.username || payload.user || payload.email || 'N/A'}<br />
      <strong>ID:</strong> {payload.user_id || payload.id || 'N/A'}<br />
      {console.log(payload)}
      {payload.email && <><strong>Email:</strong> {payload.email}<br /></>}
      {payload.exp && (
        <span style={{ color: '#aaa', fontSize: 13 }}>
          Sesión expira: {new Date(payload.exp * 1000).toLocaleString()}
        </span>
      )}
    </div>
  );
};

export default UserInfo;
