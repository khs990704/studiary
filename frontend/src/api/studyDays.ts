import client from './client';
import type { StudyDay, StudyDayDetail } from '../types/studyDay';
import type { RegenerateResponse } from '../types/ai';

interface ApiResponse<T> {
  data: T;
  message: string;
}

export async function getStudyDays(year: number, month: number): Promise<StudyDay[]> {
  const res = await client.get<ApiResponse<StudyDay[]>>('/study-days', {
    params: { year, month },
  });
  return res.data.data;
}

export async function getStudyDay(date: string): Promise<StudyDayDetail> {
  const res = await client.get<ApiResponse<StudyDayDetail>>(`/study-days/${date}`);
  return res.data.data;
}

export interface FinishResponse {
  id: string;
  date: string;
  is_finished: boolean;
  total_study_minutes: number;
  total_rest_minutes: number;
  avg_focus_ceil: number;
  ai_summary: string | null;
  ai_feedback: string | null;
  has_ai_result: boolean;
}

export async function finishStudyDay(date: string): Promise<FinishResponse> {
  const res = await client.post<ApiResponse<FinishResponse>>(`/study-days/${date}/finish`);
  return res.data.data;
}

export async function regenerateAI(date: string): Promise<RegenerateResponse> {
  const res = await client.post<ApiResponse<RegenerateResponse>>(
    `/study-days/${date}/regenerate-ai`
  );
  return res.data.data;
}
