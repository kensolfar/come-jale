// Utilidad para decodificar el JWT y saber si el usuario es admin
export function isAdminFromToken(token?: string): boolean {
  if (!token) return false;
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
    const payload = JSON.parse(jsonPayload);
    if (payload.is_superuser === true) return true;
    if (Array.isArray(payload.groups) && payload.groups.includes('Administrador')) return true;
    return false;
  } catch {
    return false;
  }
}
