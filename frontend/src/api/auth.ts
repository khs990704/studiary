import client from './client';
import type { LoginRequest, RegisterRequest, TokenResponse, User } from '../types/auth';

interface ApiResponse<T> {
  data: T;
  message: string;
}

export async function register(req: RegisterRequest): Promise<User> {
  const res = await client.post<ApiResponse<User>>('/auth/register', req);
  return res.data.data;
}

export async function login(req: LoginRequest): Promise<TokenResponse> {
  const res = await client.post<ApiResponse<TokenResponse>>('/auth/login', req);
  return res.data.data;
}

export async function getMe(): Promise<User> {
  const res = await client.get<ApiResponse<User>>('/auth/me');
  return res.data.data;
}
