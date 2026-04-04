import type {
  ApiEnvelope,
  CancelReservaPayload,
  CreateReservaPayload,
  ReservaDto,
  UpdateReservaPayload,
} from '../types/domain';
import { readAuthToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

interface JsonOptions {
  method?: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
}

async function reservasRequest<T>(path: string, options: JsonOptions = {}): Promise<ApiEnvelope<T>> {
  const token = readAuthToken();

  if (!token) {
    throw new Error('No hay sesión activa.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.errors?.[0] ?? payload.message ?? 'No se pudo procesar la reserva.');
  }

  return payload;
}

export async function listMyReservas(): Promise<ReservaDto[]> {
  const payload = await reservasRequest<ReservaDto[]>('/api/reservas');
  return payload.data;
}

export async function createReserva(payload: CreateReservaPayload): Promise<ReservaDto> {
  const response = await reservasRequest<ReservaDto>('/api/reservas', {
    method: 'POST',
    body: payload,
  });

  return response.data;
}

export async function cancelReserva(id: number, payload: CancelReservaPayload): Promise<ReservaDto> {
  const response = await reservasRequest<ReservaDto>(`/api/reservas/${id}/cancel`, {
    method: 'POST',
    body: payload,
  });

  return response.data;
}

export async function updateReserva(id: number, payload: UpdateReservaPayload): Promise<ReservaDto> {
  const response = await reservasRequest<ReservaDto>(`/api/reservas/${id}`, {
    method: 'PATCH',
    body: payload,
  });

  return response.data;
}
