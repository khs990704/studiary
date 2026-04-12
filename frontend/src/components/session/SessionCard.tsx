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
  studyIndex: _studyIndex,
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
      <section
        className="flex flex-col sm:flex-row gap-4 sm:gap-6 group"
        data-testid={`session-card-${session.id}`}
      >
        {/* Left badge - circle for rest */}
        <div className="flex-shrink-0 flex items-center sm:block">
          <div className="relative w-16 h-16 sm:w-24 sm:h-24 bg-[#a4c9ff]/10 rounded-full flex flex-col items-center justify-center text-[#a4c9ff] border border-[#a4c9ff]/10 transition-all group-hover:bg-[#a4c9ff]/20">
            <span className="text-[8px] sm:text-[10px] uppercase tracking-widest font-bold opacity-70">rest</span>
            {isRunning && timerState ? (
              <TimerDisplay {...timerState} compact />
            ) : (
              <span className="font-headline font-bold text-base sm:text-lg">{session.duration_minutes}min</span>
            )}
            {/* Hover pause/resume overlay */}
            {isRunning && timerState && (
              <button
                onClick={timerState.isPaused ? timerState.onResume : timerState.onPause}
                className="absolute inset-0 rounded-full flex items-center justify-center bg-black/60 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                aria-label={timerState.isPaused ? '재생' : '일시정지'}
              >
                {timerState.isPaused ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-[#a4c9ff]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-[#a4c9ff]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
        {/* Right content - minimal for rest */}
        <div className="flex-grow flex flex-col justify-start pt-2 sm:pt-6 pb-2 bg-transparent rounded-2xl px-5 sm:px-6 relative">
          <div className="flex justify-end items-start">
            {!isReview && onDelete && (
              <SessionMenu onDelete={onDelete} />
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="flex flex-col sm:flex-row gap-4 sm:gap-6 group"
      data-testid={`session-card-${session.id}`}
    >
      {/* Left badge - rounded square for study */}
      <div className="flex-shrink-0 flex items-center sm:block">
        <div className={`relative w-16 h-16 sm:w-24 sm:h-24 rounded-xl flex flex-col items-center justify-center border transition-all ${
          isRunning
            ? 'bg-[#7bdb85]/20 text-[#7bdb85] border-[#7bdb85]/30'
            : 'bg-[#7bdb85]/10 text-[#7bdb85] border-[#7bdb85]/10 group-hover:bg-[#7bdb85]/20'
        }`}>
          <span className="text-[8px] sm:text-[10px] uppercase tracking-widest font-bold opacity-70">study</span>
          {isRunning && timerState ? (
            <TimerDisplay {...timerState} compact />
          ) : (
            <span className="font-headline font-bold text-base sm:text-lg">{session.duration_minutes}min</span>
          )}
          {/* Hover pause/resume overlay */}
          {isRunning && timerState && (
            <button
              onClick={timerState.isPaused ? timerState.onResume : timerState.onPause}
              className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/60 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              aria-label={timerState.isPaused ? '재생' : '일시정지'}
            >
              {timerState.isPaused ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-[#7bdb85]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-[#7bdb85]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Right content area */}
      <div className={`flex-grow flex flex-col justify-between pt-4 sm:pt-6 pb-4 rounded-2xl px-5 sm:px-6 relative transition-colors border ${
        isRunning
          ? 'bg-[#1c1b1b] border-[#7bdb85]/30'
          : 'bg-[#1c1b1b] border-white/5 hover:bg-[#201f1f]'
      }`}>
        {/* Header with focus + menu */}
        <div className="flex justify-between items-start">
          <FocusLevelInput
            value={isReview ? session.focus_level : (localFocusLevel ?? session.focus_level)}
            onChange={(level) => onFocusChange?.(level)}
            disabled={isReview}
          />
          {!isReview && onDelete && (
            <SessionMenu onDelete={onDelete} />
          )}
        </div>

        {/* Timer for running session */}
        {/* {isRunning && timerState && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#39994B]/10 px-3 py-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#7bdb85]" />
            <TimerDisplay {...timerState} />
          </div>
        )} */}

        {/* Distraction input */}
        {(isRunning || session.status === 'completed' || session.distraction || isReview) && (
          <div className="mt-4 sm:mt-6">
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
          </div>
        )}
      </div>
    </section>
  );
}
