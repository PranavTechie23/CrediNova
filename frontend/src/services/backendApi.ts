import type { CreditApplication, CreditResponse, PastApplication } from '@/types';
import { getAuthToken } from '@/services/authService';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '');

function ensureBackendConfigured() {
  if (!BACKEND_BASE_URL) {
    throw new Error('Backend API URL is not configured. Set VITE_BACKEND_URL to your backend endpoint.');
  }
}

async function backendFetch<T>(path: string, options: RequestInit = {}) {
  ensureBackendConfigured();

  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${BACKEND_BASE_URL}${path}`;
  const response = await fetch(url, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.error || response.statusText || 'Unexpected backend error';
    throw new Error(message);
  }

  const bodyText = await response.text();
  if (!bodyText) {
    return undefined as unknown as T;
  }

  return JSON.parse(bodyText) as T;
}

export async function scoreApplication(request: CreditApplication, approvalThreshold = 0.5): Promise<CreditResponse> {
  ensureBackendConfigured();
  return backendFetch<CreditResponse>('/predict', {
    method: 'POST',
    body: JSON.stringify({ request, approvalThreshold }),
  });
}

export async function batchScoreApplications(
  requests: CreditApplication[],
  approvalThreshold = 0.5
): Promise<CreditResponse[]> {
  ensureBackendConfigured();
  return backendFetch<CreditResponse[]>('/predict/batch', {
    method: 'POST',
    body: JSON.stringify({ requests, approvalThreshold }),
  });
}

export async function getPastApplications(): Promise<PastApplication[]> {
  ensureBackendConfigured();
  return backendFetch<PastApplication[]>('/applications');
}

export async function getApplicationById(id: string): Promise<PastApplication | null> {
  ensureBackendConfigured();
  return backendFetch<PastApplication>(`/applications/${encodeURIComponent(id)}`);
}

export async function fetchAuditTrail() {
  ensureBackendConfigured();
  return backendFetch('/audit');
}

export async function clearAuditTrail() {
  ensureBackendConfigured();
  return backendFetch('/audit', {
    method: 'DELETE',
  });
}
