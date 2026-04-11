import client from './client';
import type { Session, CreateSessionRequest, UpdateSessionRequest } from '../types/session';

interface ApiResponse<T> {
  data: T;
  message: string;
}

export async function createSession(req: CreateSessionRequest): Promise<Session> {
  const res = await client.post<ApiResponse<Session>>('/sessions', req);
  return res.data.data;
}

export async function updateSession(id: string, req: UpdateSessionRequest): Promise<Session> {
  const res = await client.patch<ApiResponse<Session>>(`/sessions/${id}`, req);
  return res.data.data;
}

export async function deleteSession(id: string): Promise<void> {
  await client.delete(`/sessions/${id}`);
}
