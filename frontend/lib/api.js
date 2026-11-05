const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const getToken = () => (typeof window === 'undefined' ? null : localStorage.getItem('token'));

export function getUser() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

export function setSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Pembungkus fetch: otomatis kirim token, lempar Error berisi pesan dari server
export async function api(path, { method = 'GET', body } = {}) {
  const token = getToken();
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== '/auth/login') {
    clearSession();
    window.location.href = '/login';
    throw new Error('Sesi habis, silakan login ulang');
  }
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
  return data;
}