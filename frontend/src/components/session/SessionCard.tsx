import type { Session } from '../../types/session';
import TimerDisplay from './TimerDisplay';
import FocusLevelInput from './FocusLevelInput';
import DistractionInput from './DistractionInput';
import SessionMenu from './SessionMenu';

interface SessionCardProps {
  session: Session;
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
  onDelete?: () => void;
  localFocusLevel?: number | null;
  localDistraction?: string;
}

export default function SessionCard({
  session,
  isReview,
  timerState,
  onFocusChange,
  onDistractionChange,
  onDelete,
  localFocusLevel,
  localDistraction,
}: SessionCardProps) {
  const isStudy = session.type === 'study';
  const isRunning = session.status === 'running';

  const shapeClass = isStudy
    ? 'rounded-lg'
    : 'rounded-full aspect-square flex items-center justify-center';

  const borderColor = isStudy ? 'border-green-200' : 'border-blue-200';
  const bgColor = isStudy ? 'bg-green-50' : 'bg-blue-50';

  if (!isStudy) {
    return (
      <div
        className={`${shapeClass} ${borderColor} ${bgColor} border p-4 w-24 h-24 sm:w-28 sm:h-28 mx-auto`}
        data-testid={`session-card-${session.id}`}
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-xs font-medium text-blue-600">휴식</span>
          {isRunning && timerState ? (
            <TimerDisplay {...timerState} />
          ) : (
            <span className="text-sm font-semibold text-gray-700">
              {session.duration_minutes}분
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${shapeClass} ${borderColor} ${bgColor} relative border p-4`}
      data-testid={`session-card-${session.id}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-green-600">
            공부 #{session.order_num}
          </span>
          {!isRunning && (
            <span className="text-sm text-gray-500">
              {session.duration_minutes}분
            </span>
          )}
        </div>
        {!isReview && onDelete && (
          <SessionMenu onDelete={onDelete} />
        )}
      </div>

      {isRunning && timerState && (
        <div className="mb-3">
          <TimerDisplay {...timerState} />
        </div>
      )}

      {isStudy && (
        <div className="flex flex-col gap-2">
          <FocusLevelInput
            value={isReview ? session.focus_level : (localFocusLevel ?? session.focus_level)}
            onChange={(level) => onFocusChange?.(level)}
            disabled={isReview}
          />
          {(isRunning || session.distraction || isReview) && (
            <DistractionInput
              value={
                isReview
                  ? session.distraction ?? ''
                  : (localDistraction ?? session.distraction ?? '')
              }
              onChange={(text) => onDistractionChange?.(text)}
              disabled={isReview}
            />
          )}
        </div>
      )}
    </div>
  );
}
