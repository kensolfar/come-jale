// Utilidad para decodificar el JWT y saber si el usuario es admin
export function isAdminFromToken(token?: string): boolean {
  if (!token) return false;
  const payload = parseJwt(token);
  if (!payload) return false;
  if (payload.is_superuser === true) return true;
  if (Array.isArray(payload.groups) && payload.groups.includes('Administrador')) return true;
  return false;
}

export function rolesFromToken(token?: string): string[] | null {
  if (!token) return null;
  const payload = parseJwt(token);
  if (!payload) return null;
  if (payload.is_superuser === true) return ['administrador'];
  if (Array.isArray(payload.groups) && payload.groups.length > 0) {
    return payload.groups;
  }
  return null;
}



export function parseJwt(token: string) {
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
