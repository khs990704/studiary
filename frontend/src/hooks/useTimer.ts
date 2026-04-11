import { useState, useRef, useCallback, useEffect } from 'react';

interface UseTimerReturn {
  remainingSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  startTimer: (durationMinutes: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
}

export function useTimer(onComplete?: () => void): UseTimerReturn {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);

  onCompleteRef.current = onComplete;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    setRemainingSeconds((prev) => {
      if (prev <= 1) {
        clearTimer();
        setIsRunning(false);
        setIsPaused(false);
        setIsCompleted(true);
        onCompleteRef.current?.();
        return 0;
      }
      return prev - 1;
    });
  }, [clearTimer]);

  const startTimer = useCallback(
    (durationMinutes: number) => {
      clearTimer();
      setRemainingSeconds(durationMinutes * 60);
      setIsRunning(true);
      setIsPaused(false);
      setIsCompleted(false);
      intervalRef.current = setInterval(tick, 1000);
    },
    [clearTimer, tick]
  );

  const pauseTimer = useCallback(() => {
    clearTimer();
    setIsPaused(true);
    setIsRunning(false);
  }, [clearTimer]);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
    setIsRunning(true);
    intervalRef.current = setInterval(tick, 1000);
  }, [tick]);

  const resetTimer = useCallback(() => {
    clearTimer();
    setRemainingSeconds(0);
    setIsRunning(false);
    setIsPaused(false);
    setIsCompleted(false);
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    remainingSeconds,
    isRunning,
    isPaused,
    isCompleted,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
  };
}
