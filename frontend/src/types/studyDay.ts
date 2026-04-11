import type { Session } from './session';

export interface StudyDay {
  date: string;
  total_study_minutes: number;
  total_rest_minutes: number;
  avg_focus_ceil: number;
  is_finished: boolean;
  ai_summary: string | null;
  ai_feedback: string | null;
  has_ai_result: boolean;
}

export interface StudyDayDetail extends StudyDay {
  sessions: Session[];
}

export interface HeatmapDay {
  date: string;
  avg_focus_ceil: number;
}

export interface HeatmapData {
  year: number;
  month: number;
  days: HeatmapDay[];
}
