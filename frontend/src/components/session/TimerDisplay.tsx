import { formatTime } from '../../utils/date';

interface TimerDisplayProps {
  remainingSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
}

export default function TimerDisplay({
  remainingSeconds,
  isRunning,
  isPaused,
  onPause,
  onResume,
}: TimerDisplayProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-2xl font-bold text-gray-800">
        {formatTime(remainingSeconds)}
      </span>
      {(isRunning || isPaused) && (
        <button
          onClick={isPaused ? onResume : onPause}
          className="text-gray-400 transition-colors hover:text-gray-700"
          aria-label={isPaused ? '재생' : '일시정지'}
        >
          {isPaused ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
