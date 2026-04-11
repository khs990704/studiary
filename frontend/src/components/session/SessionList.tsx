import type { Session } from '../../types/session';
import SessionCard from './SessionCard';

interface SessionListProps {
  sessions: Session[];
  isReview: boolean;
  activeSessionId?: string | null;
  timerState?: {
    remainingSeconds: number;
    isRunning: boolean;
    isPaused: boolean;
    onPause: () => void;
    onResume: () => void;
  };
  onFocusChange?: (sessionId: string, level: number) => void;
  onDistractionChange?: (sessionId: string, text: string) => void;
  onDistractionBlur?: (sessionId: string) => void;
  onDelete?: (sessionId: string) => void;
  localStates?: Map<string, { focusLevel: number | null; distraction: string }>;
}

export default function SessionList({
  sessions,
  isReview,
  activeSessionId,
  timerState,
  onFocusChange,
  onDistractionChange,
  onDistractionBlur,
  onDelete,
  localStates,
}: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className="py-6 text-center text-gray-400">
        아직 세션이 없습니다.
      </div>
    );
  }

  let studyIndex = 0;

  return (
    <div className="flex flex-col gap-3">
      {sessions.map((session) => {
        const local = localStates?.get(session.id);
        if (session.type === 'study') studyIndex += 1;
        const sessionStudyIndex = session.type === 'study' ? studyIndex : undefined;
        return (
          <SessionCard
            key={session.id}
            session={session}
            studyIndex={sessionStudyIndex}
            isReview={isReview}
            timerState={
              session.id === activeSessionId ? timerState : undefined
            }
            onFocusChange={
              onFocusChange
                ? (level) => onFocusChange(session.id, level)
                : undefined
            }
            onDistractionChange={
              onDistractionChange
                ? (text) => onDistractionChange(session.id, text)
                : undefined
            }
            onDistractionBlur={
              onDistractionBlur
                ? () => onDistractionBlur(session.id)
                : undefined
            }
            onDelete={
              onDelete ? () => onDelete(session.id) : undefined
            }
            localFocusLevel={local?.focusLevel}
            localDistraction={local?.distraction}
          />
        );
      })}
    </div>
  );
}
