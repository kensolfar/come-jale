import React, { useEffect, useState } from 'react';
import { getUserProfileMe } from '../services/api';
import { useTranslation } from 'react-i18next';

interface UserInfoProps {
  token: string;
  expanded: boolean;
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

function getInitials(name: string) {
  if (!name) return '';
  const parts = name.split(/\s|\./).filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const UserInfo: React.FC<UserInfoProps> = ({ token, expanded }) => {
  const { t } = useTranslation();
  const payload = parseJwt(token);
  if (!payload) return null;
  const username = payload.username || payload.user || payload.email || 'N/A';
  const initials = getInitials(username);
  // Detectar rol
  let rol = 'Usuario';
  if (payload.groups) {
    if (Array.isArray(payload.groups)) {
      if (payload.groups.includes('Administrador')) rol = 'Administrador';
      else if (payload.groups.includes('Vendedor')) rol = 'Vendedor';
      else if (payload.groups.includes('Repartidor')) rol = 'Repartidor';
      else if (payload.groups.includes('Cliente')) rol = 'Cliente';
      else if (payload.groups.length > 0) rol = payload.groups[0];
    } else if (typeof payload.groups === 'string') {
      rol = payload.groups;
    }
  } else if (payload.is_superuser) {
    rol = 'Administrador';
  }

  // Estado para la imagen del perfil
  const [profileImg, setProfileImg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await getUserProfileMe();
        if (res && res.imagen) {
          setProfileImg(res.imagen.startsWith('http') ? res.imagen : `${import.meta.env.VITE_BACKEND_URL || ''}${res.imagen}`);
        } else {
          setProfileImg(null);
        }
      } catch {
        setProfileImg(null);
      }
    }
    fetchProfile();
  }, [token]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row', // Avatar a la izquierda, info a la derecha
      alignItems: 'center',
      background: '#232428',
      color: '#fff',
      borderRadius: 8,
      padding: expanded ? '12px 18px' : '8px',
      margin: expanded ? '0 0 16px 0' : '0',
      justifyContent: 'flex-start',
      minHeight: expanded ? 56 : 48,
      minWidth: expanded ? 0 : 40,
      width: '100%',
      boxSizing: 'border-box',
    }}>
      {/* Avatar a la izquierda */}
      {profileImg ? (
        <img src={profileImg} alt="avatar" style={{ width: 58, height: 58, borderRadius: '50%', objectFit: 'cover', marginRight: 16 }} />
      ) : (
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'var(--color-green-leaf, #8DAA91)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 24,
          marginRight: 16,
        }}>{initials}</div>
      )}
      {/* Info a la derecha */}
      {expanded && (
        <div style={{ flex: 1, textAlign: 'left', width: '100%' }}>
            <span style={{ fontSize: 16, marginRight: 5 }}>
            <strong>{t('user')}:</strong> {username}
            </span>
            <br />
            <span style={{ fontSize: 16, marginRight: 5 }}>
            <strong>ID:</strong> {payload.user_id || payload.id || 'N/A'}
            </span>
            <br />
            <span style={{ fontSize: 16, marginRight: 5 }}>
            <strong>{t('role')}:</strong> {t(rol.toLowerCase())}
            </span>
            <br />
            {payload.email && <><strong>Email:</strong> {payload.email}<br /></>}
          {payload.exp && (
            <span style={{ color: '#aaa', fontSize: 13 }}>
              {t('session_expires')}: {new Date(payload.exp * 1000).toLocaleTimeString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default UserInfo;
