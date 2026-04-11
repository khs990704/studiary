export interface User {
  id: string;
  email: string;
  nickname: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: Omit<User, 'created_at'>;
}
