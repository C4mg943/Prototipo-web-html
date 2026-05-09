import type { ApiEnvelope, AuthPayload, AuthUser } from '../types/domain';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

export interface RegisterPayload {
  nombres: string;
  apellidos: string;
  correo: string;
  contrasena: string;
}

export interface LoginPayload {
  correo: string;
  contrasena: string;
}

async function request<TBody extends object>(url: string, body: TBody): Promise<ApiEnvelope<AuthPayload>> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as ApiEnvelope<AuthPayload>;

  if (!response.ok || !payload.success) {
    const firstError = payload.errors?.[0];
    throw new Error(firstError ?? payload.message ?? 'Error al procesar la solicitud.');
  }

  return payload;
}

export async function register(payload: RegisterPayload): Promise<ApiEnvelope<AuthPayload>> {
  return request('/api/auth/register', payload);
}

export async function login(payload: LoginPayload): Promise<ApiEnvelope<AuthPayload>> {
  return request('/api/auth/login', payload);
}

export async function verify2FA(tempToken: string, code: string): Promise<ApiEnvelope<AuthPayload>> {
  const response = await fetch(`${API_BASE_URL}/api/auth/verify-2fa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tempToken, code }),
  });

  const payload = (await response.json()) as ApiEnvelope<AuthPayload>;

  if (!response.ok || !payload.success) {
    const firstError = payload.errors?.[0];
    throw new Error(firstError ?? payload.message ?? 'Error al verificar código 2FA.');
  }

  return payload;
}

export async function get2FAStatus(): Promise<{ enabled: boolean }> {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(`${API_BASE_URL}/api/auth/2fa/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data.data;
}

export async function setup2FA(): Promise<{ qrCode: string; tempToken: string }> {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(`${API_BASE_URL}/api/auth/2fa/setup`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data.data;
}

export async function confirm2FA(code: string): Promise<{ message: string }> {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(`${API_BASE_URL}/api/auth/2fa/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ code }),
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message);
  }
  return data.data;
}

export async function disable2FA(password: string): Promise<{ message: string }> {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(`${API_BASE_URL}/api/auth/2fa/disable`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ contrasena: password }),
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message);
  }
  return data.data;
}

export async function me(): Promise<AuthUser> {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    throw new Error('No hay sesión activa.');
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = (await response.json()) as ApiEnvelope<AuthUser>;

  if (!response.ok || !payload.success) {
    const firstError = payload.errors?.[0];
    throw new Error(firstError ?? payload.message ?? 'No se pudo recuperar tu perfil.');
  }

  return payload.data;
}

export function saveAuthSession(authData: AuthPayload): void {
  localStorage.setItem('auth_token', authData.token);
  localStorage.setItem('auth_user', JSON.stringify(authData.usuario));
}

export function readAuthUser(): AuthUser | null {
  const raw = localStorage.getItem('auth_user');

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function readAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function clearAuthSession(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}
