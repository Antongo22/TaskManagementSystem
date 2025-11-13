// Утилита для работы с JWT токенами

interface JwtPayload {
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': string;
  exp: number;
  iss: string;
  aud: string;
}

export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const getCurrentUserId = (): number | null => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;

  const payload = decodeJwt(token);
  if (!payload) return null;

  // В JWT токене ID хранится в claim 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
  const userId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
  return userId ? parseInt(userId, 10) : null;
};

export const isAdmin = (userId: number | null): boolean => {
  if (!userId) return false;
  // По умолчанию первый пользователь (ID = 1) является админом
  // Если админ указан в конфигурации на бэкенде, проверка будет на бэкенде
  return userId === 1;
};

