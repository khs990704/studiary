export type SessionType = 'study' | 'rest';
export type SessionStatus = 'running' | 'paused' | 'completed';

export interface Session {
  id: string;
  order_num: number;
  type: SessionType;
  duration_minutes: number;
  focus_level: number | null;
  distraction: string | null;
  status: SessionStatus;
  created_at: string;
}

export interface CreateSessionRequest {
  date: string;
  duration_minutes: number;
}

export interface UpdateSessionRequest {
  focus_level?: number | null;
  distraction?: string | null;
}
