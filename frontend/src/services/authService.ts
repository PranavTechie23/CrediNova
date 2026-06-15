import type { User } from '@/types';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '');
const AUTH_TOKEN_KEY = 'credit_clarity_token';

function ensureBackendConfigured() {
  if (!BACKEND_BASE_URL) {
    throw new Error('Backend API URL is not configured. Set VITE_BACKEND_URL to your backend endpoint.');
  }
}

async function backendFetch<T>(path: string, options: RequestInit = {}) {
  ensureBackendConfigured();

  const url = `${BACKEND_BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const bodyText = await response.text();
  const body = bodyText ? JSON.parse(bodyText) : null;

  if (!response.ok) {
    const message = body?.error || response.statusText || 'Unexpected backend error';
    throw new Error(message);
  }

  return body as T;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  return backendFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function signupUser(name: string, email: string, password: string): Promise<AuthResponse> {
  return backendFetch<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function fetchAuthenticatedUser(token: string): Promise<{ user: User }> {
  return backendFetch<{ user: User }>('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}
