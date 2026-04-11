import type { Session } from '../../types/session';
import TimerDisplay from './TimerDisplay';
import FocusLevelInput from './FocusLevelInput';
import DistractionInput from './DistractionInput';
import SessionMenu from './SessionMenu';

interface SessionCardProps {
  session: Session;
  studyIndex?: number;
  isReview: boolean;
  timerState?: {
    remainingSeconds: number;
    isRunning: boolean;
    isPaused: boolean;
    onPause: () => void;
    onResume: () => void;
  };
  onFocusChange?: (level: number) => void;
  onDistractionChange?: (text: string) => void;
  onDistractionBlur?: () => void;
  onDelete?: () => void;
  localFocusLevel?: number | null;
  localDistraction?: string;
}

export default function SessionCard({
  session,
  studyIndex,
  isReview,
  timerState,
  onFocusChange,
  onDistractionChange,
  onDistractionBlur,
  onDelete,
  localFocusLevel,
  localDistraction,
}: SessionCardProps) {
  const isStudy = session.type === 'study';
  const isRunning = session.status === 'running';

  if (!isStudy) {
    return (
      <div
        className="flex items-center justify-center"
        data-testid={`session-card-${session.id}`}
      >
        <div className="relative flex h-20 w-20 flex-col items-center justify-center rounded-full border border-[#3f4a3e] bg-[#1c1b1b]">
          {!isReview && onDelete && (
            <div className="absolute -top-1 -right-1">
              <SessionMenu onDelete={onDelete} />
            </div>
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#becaba]/60">휴식</span>
          {isRunning && timerState ? (
            <TimerDisplay {...timerState} compact />
          ) : (
            <span className="text-sm font-bold tabular-nums text-[#becaba]">
              {session.duration_minutes}분
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-[#1c1b1b] transition-all duration-200 ${
        isRunning ? 'border border-[#7bdb85]/40' : 'border border-[#3f4a3e]/60 hover:bg-[#201f1f]'
      }`}
      data-testid={`session-card-${session.id}`}
    >
      {/* Running indicator */}
      {isRunning && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#7bdb85] to-[#44a354]" />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
              isRunning ? 'bg-[#44a354] text-[#002107]' : 'bg-[#2a2a2a] text-[#becaba]'
            }`}>
              {studyIndex ?? session.order_num}
            </div>
            <span className="text-xs font-semibold text-[#e5e2e1]">공부 세션</span>
            {!isRunning && (
              <span className="rounded-full bg-[#2a2a2a] px-2 py-0.5 text-[11px] font-medium text-[#becaba]">
                {session.duration_minutes}분
              </span>
            )}
          </div>
          {!isReview && onDelete && (
            <SessionMenu onDelete={onDelete} />
          )}
        </div>

        {/* Timer */}
        {isRunning && timerState && (
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-[#39994B]/10 px-3 py-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#7bdb85]" />
            <TimerDisplay {...timerState} />
          </div>
        )}

        {/* Focus & Distraction */}
        <div className="flex flex-col gap-2.5">
          <FocusLevelInput
            value={isReview ? session.focus_level : (localFocusLevel ?? session.focus_level)}
            onChange={(level) => onFocusChange?.(level)}
            disabled={isReview}
          />
          {(isRunning || session.status === 'completed' || session.distraction || isReview) && (
            <DistractionInput
              value={
                isReview
                  ? session.distraction ?? ''
                  : (localDistraction ?? session.distraction ?? '')
              }
              onChange={(text) => onDistractionChange?.(text)}
              onBlur={onDistractionBlur}
              disabled={isReview}
            />
          )}
        </div>
      </div>
    </div>
  );
}
