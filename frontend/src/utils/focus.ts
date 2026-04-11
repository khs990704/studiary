import { HEATMAP_COLORS } from './constants';
import type { Session } from '../types/session';

export function getFocusColor(level: number): string {
  return HEATMAP_COLORS[level] ?? HEATMAP_COLORS[0];
}

export function calculateAvgFocusCeil(sessions: Session[]): number {
  const studySessions = sessions.filter(
    (s) => s.type === 'study' && s.focus_level !== null
  );
  if (studySessions.length === 0) return 0;
  const sum = studySessions.reduce((acc, s) => acc + (s.focus_level ?? 0), 0);
  return Math.ceil(sum / studySessions.length);
}
