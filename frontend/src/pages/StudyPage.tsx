import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import * as studyDaysApi from '../api/studyDays';
import * as sessionsApi from '../api/sessions';
import { useSessionStore } from '../stores/sessionStore';
import { useTimer } from '../hooks/useTimer';
import { isToday } from '../utils/date';
import SessionList from '../components/session/SessionList';
import TimerSetup from '../components/session/TimerSetup';
import FocusChart from '../components/review/FocusChart';
import AISummary from '../components/review/AISummary';
import AIFeedback from '../components/review/AIFeedback';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import type { StudyDayDetail } from '../types/studyDay';

function formatStudyTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

function getGrade(avgFocus: number | null): string {
  if (avgFocus === null || avgFocus === 0) return '-';
  if (avgFocus >= 4.5) return 'S';
  if (avgFocus >= 3.5) return 'A';
  if (avgFocus >= 2.5) return 'B';
  if (avgFocus >= 1.5) return 'C';
  return 'D';
}

export default function StudyPage() {
  const { date } = useParams<{ date: string }>();

  const { sessions, setSessions, addSession, updateSession, removeSession } =
    useSessionStore();

  const [studyDay, setStudyDay] = useState<StudyDayDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState('');
  const [showTimerSetup, setShowTimerSetup] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [localStates, setLocalStates] = useState<
    Map<string, { focusLevel: number | null; distraction: string }>
  >(new Map());

  const today = date ? isToday(date) : false;
  const timerKey = date ? `studiary_timer_${date}` : null;

  const handleTimerComplete = useCallback(() => {
    if (activeSessionId !== null) {
      if (timerKey) localStorage.removeItem(timerKey);
      updateSession(activeSessionId, { status: 'completed' });
      const local = localStates.get(activeSessionId);
      if (local) {
        sessionsApi
          .updateSession(activeSessionId, {
            focus_level: local.focusLevel,
            distraction: local.distraction || null,
          })
          .catch(() => {});
      }
      setActiveSessionId(null);
    }
  }, [activeSessionId, timerKey, updateSession, localStates]);

  const timer = useTimer(handleTimerComplete);
  const { restoreTimer } = timer;

  // 복원은 마운트당 한 번만 실행 (새 세션 추가로 sessions 변경 시 재실행 방지)
  const hasRestoredRef = useRef(false);
  // unmount 시 남은 시간을 저장하기 위한 refs (클로저 stale 방지)
  const timerRemainingRef = useRef(0);
  const activeSessionIdRef = useRef<string | null>(null);
  timerRemainingRef.current = timer.remainingSeconds;
  activeSessionIdRef.current = activeSessionId;

  const loadStudyDay = useCallback(async () => {
    if (!date) return;
    setLoading(true);
    setError('');
    try {
      const data = await studyDaysApi.getStudyDay(date);
      setStudyDay(data);
      setSessions(data.sessions);
    } catch {
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [date, setSessions]);

  useEffect(() => {
    loadStudyDay();
  }, [loadStudyDay]);

  const isFinished = studyDay?.is_finished ?? false;
  const hasAiResult = studyDay?.has_ai_result ?? false;
  const isReview = !today || (isFinished && hasAiResult);
  const showFinishButton = today && (!isFinished || !hasAiResult);

  const handleStartSession = async (minutes: number) => {
    if (!date) return;
    try {
      const session = await sessionsApi.createSession({
        date,
        duration_minutes: minutes,
      });
      addSession(session);
      setActiveSessionId(session.id);
      setLocalStates((prev) => {
        const next = new Map(prev);
        next.set(session.id, { focusLevel: null, distraction: '' });
        return next;
      });
      if (timerKey) {
        localStorage.setItem(timerKey, JSON.stringify({ sessionId: session.id, remainingSeconds: minutes * 60 }));
      }
      timer.startTimer(minutes);
      setShowTimerSetup(false);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || '세션 생성에 실패했습니다.');
    }
  };

  const handleFocusChange = (sessionId: string, level: number) => {
    setLocalStates((prev) => {
      const next = new Map(prev);
      const current = next.get(sessionId) || { focusLevel: null, distraction: '' };
      next.set(sessionId, { ...current, focusLevel: level });
      return next;
    });
    sessionsApi.updateSession(sessionId, { focus_level: level }).catch(() => {});
    updateSession(sessionId, { focus_level: level });
  };

  const handleDistractionChange = (sessionId: string, text: string) => {
    setLocalStates((prev) => {
      const next = new Map(prev);
      const current = next.get(sessionId) || { focusLevel: null, distraction: '' };
      next.set(sessionId, { ...current, distraction: text });
      return next;
    });
  };

  const handleDistractionBlur = (sessionId: string) => {
    const local = localStates.get(sessionId);
    if (local) {
      sessionsApi
        .updateSession(sessionId, { distraction: local.distraction || null })
        .catch(() => {});
      updateSession(sessionId, { distraction: local.distraction || null });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await sessionsApi.deleteSession(sessionId);
      if (sessionId === activeSessionId) {
        if (timerKey) localStorage.removeItem(timerKey);
        timer.resetTimer();
        setActiveSessionId(null);
      }
      removeSession(sessionId);
      setLocalStates((prev) => {
        const next = new Map(prev);
        next.delete(sessionId);
        return next;
      });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || '세션 삭제에 실패했습니다.');
    }
  };

  const handleFinish = async () => {
    if (!date) return;
    if (!window.confirm('오늘 공부를 끝내겠습니까?')) return;
    if (sessions.length === 0) {
      alert('세션이 없습니다. 먼저 공부 세션을 추가해주세요.');
      return;
    }

    if (!isFinished) {
      const scrollToSession = (sessionId: string) => {
        const el = document.querySelector(`[data-testid="session-card-${sessionId}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      };

      const missingFocusSession = sessions
        .filter((s) => s.type === 'study')
        .find((s) => {
          const local = localStates.get(s.id);
          const effectiveFocus = local ? local.focusLevel : s.focus_level;
          return effectiveFocus === null || effectiveFocus === undefined;
        });

      if (missingFocusSession) {
        alert('집중도는 필수 입력 요소입니다');
        scrollToSession(missingFocusSession.id);
        return;
      }

      const missingDistractionSession = sessions
        .filter((s) => s.type === 'study')
        .find((s) => {
          const local = localStates.get(s.id);
          const effectiveDistraction = local ? local.distraction : s.distraction;
          return !effectiveDistraction;
        });

      if (missingDistractionSession) {
        alert('방해요소는 필수 입력 요소입니다');
        scrollToSession(missingDistractionSession.id);
        return;
      }
    }

    setFinishing(true);
    setError('');

    if (isFinished) {
      try {
        const aiResult = await studyDaysApi.regenerateAI(date);
        setStudyDay((prev) =>
          prev
            ? {
                ...prev,
                ai_summary: aiResult.ai_summary,
                ai_feedback: aiResult.ai_feedback,
                has_ai_result: !!aiResult.ai_summary && !!aiResult.ai_feedback,
              }
            : prev
        );
        if (!aiResult.ai_summary || !aiResult.ai_feedback) {
          alert('AI 생성에 실패했습니다. 다시 시도해주세요.');
        }
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { detail?: string } } };
        alert(axiosErr.response?.data?.detail || 'AI 생성에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setFinishing(false);
      }
      return;
    }

    const savePromises: Promise<unknown>[] = [];
    localStates.forEach((local, sessionId) => {
      const patch: { focus_level?: number | null; distraction?: string | null } = {
        distraction: local.distraction || null,
      };
      if (local.focusLevel !== null) {
        patch.focus_level = local.focusLevel;
      }
      updateSession(sessionId, patch);
      savePromises.push(
        sessionsApi.updateSession(sessionId, patch).catch(() => {})
      );
    });
    await Promise.all(savePromises);

    try {
      const data = await studyDaysApi.finishStudyDay(date);
      setStudyDay((prev) =>
        prev
          ? {
              ...prev,
              is_finished: true,
              ai_summary: data.ai_summary,
              ai_feedback: data.ai_feedback,
              has_ai_result: !!data.ai_summary && !!data.ai_feedback,
              total_study_minutes: data.total_study_minutes,
              total_rest_minutes: data.total_rest_minutes,
              avg_focus_ceil: data.avg_focus_ceil,
            }
          : prev
      );
      if (timerKey) localStorage.removeItem(timerKey);
      timer.resetTimer();
      setActiveSessionId(null);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      alert(axiosErr.response?.data?.detail || '공부 종료에 실패했습니다.');
    } finally {
      setFinishing(false);
    }
  };

  // 타이머 tick마다 localStorage 동기화 (새로고침 포함 모든 이탈 대응)
  useEffect(() => {
    if (!timerKey || !activeSessionId || timer.remainingSeconds <= 0) return;
    const savedStr = localStorage.getItem(timerKey);
    if (!savedStr) return;
    try {
      const saved = JSON.parse(savedStr) as { sessionId: string; remainingSeconds: number };
      if (saved.sessionId === activeSessionId) {
        localStorage.setItem(timerKey, JSON.stringify({ ...saved, remainingSeconds: timer.remainingSeconds }));
      }
    } catch {}
  }, [timerKey, activeSessionId, timer.remainingSeconds]);

  // 페이지 복귀 시 타이머 복원 — 마운트당 한 번만, 저장된 초를 그대로 사용
  useEffect(() => {
    if (loading || !timerKey || hasRestoredRef.current) return;
    hasRestoredRef.current = true;
    const saved = localStorage.getItem(timerKey);
    if (!saved) return;
    try {
      const { sessionId, remainingSeconds } = JSON.parse(saved) as { sessionId: string; remainingSeconds: number };
      const sessionExists = sessions.some((s) => s.id === sessionId);
      if (!sessionExists) {
        localStorage.removeItem(timerKey);
        return;
      }
      if (remainingSeconds > 0) {
        setActiveSessionId(sessionId);
        setLocalStates((prev) => {
          if (prev.has(sessionId)) return prev;
          const next = new Map(prev);
          const sessionData = sessions.find((s) => s.id === sessionId);
          next.set(sessionId, {
            focusLevel: sessionData?.focus_level ?? null,
            distraction: sessionData?.distraction ?? '',
          });
          return next;
        });
        restoreTimer(remainingSeconds, true);
      } else {
        localStorage.removeItem(timerKey);
      }
    } catch {
      localStorage.removeItem(timerKey);
    }
  }, [sessions, loading, timerKey, restoreTimer]);

  if (loading) return <LoadingSpinner />;

  return (
    <main className="pt-20 md:pt-24 pb-20 px-4 md:px-8 max-w-3xl mx-auto w-full space-y-10 md:space-y-12">
      {error && <ErrorMessage message={error} />}

      {/* Session List */}
      <SessionList
        sessions={sessions}
        isReview={!!isReview}
        activeSessionId={activeSessionId}
        timerState={{
          remainingSeconds: timer.remainingSeconds,
          isRunning: timer.isRunning,
          isPaused: timer.isPaused,
          onPause: timer.pauseTimer,
          onResume: timer.resumeTimer,
        }}
        onFocusChange={!isReview ? handleFocusChange : undefined}
        onDistractionChange={!isReview ? handleDistractionChange : undefined}
        onDistractionBlur={!isReview ? handleDistractionBlur : undefined}
        onDelete={!isReview ? handleDeleteSession : undefined}
        localStates={localStates}
      />

      {showFinishButton && (
        <div className="flex flex-col items-center gap-4 pt-2">
          {!isFinished && (
            showTimerSetup ? (
              <TimerSetup
                onStart={handleStartSession}
                onCancel={() => setShowTimerSetup(false)}
              />
            ) : (
              <button
                onClick={() => setShowTimerSetup(true)}
                disabled={activeSessionId !== null}
                className="flex items-center gap-2 rounded-full bg-gradient-to-br from-[#7bdb85] to-[#44a354] text-[#002107] font-headline font-bold py-3 px-8 shadow-lg shadow-[#39994B]/20 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:scale-100"
                aria-label="세션 추가"
                data-testid="add-session-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                세션 추가
              </button>
            )
          )}

          <Button
            variant="secondary"
            onClick={handleFinish}
            disabled={finishing || activeSessionId !== null}
            data-testid="finish-button"
          >
            {activeSessionId !== null
              ? '세션이 진행중입니다'
              : finishing
                ? (isFinished ? 'AI 생성 중...' : '종료 중...')
                : '오늘 공부 끝내기'}
          </Button>
        </div>
      )}

      {isReview && (
        <div className="flex flex-col gap-10 md:gap-12">
          <FocusChart sessions={sessions} />
          <AISummary summary={studyDay?.ai_summary ?? null} />
          <AIFeedback feedback={studyDay?.ai_feedback ?? null} />

          {/* Performance Stats */}
          {studyDay && (
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#1c1b1b] rounded-2xl p-6 text-center border border-white/5 flex flex-col justify-center items-center">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">총 공부 시간</p>
                <p className="text-3xl font-headline font-extrabold text-[#e5e2e1] tracking-tight">
                  {formatStudyTime(studyDay.total_study_minutes)}
                </p>
              </div>
              <div className="bg-[#1c1b1b] rounded-2xl p-6 text-center border border-white/5 flex flex-col justify-center items-center">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">오늘의 성과</p>
                <div className="relative inline-block">
                  <p className="text-4xl font-headline font-extrabold text-[#7bdb85] drop-shadow-[0_0_15px_rgba(123,219,133,0.3)]">
                    {getGrade(studyDay.avg_focus_ceil)}
                  </p>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#7bdb85] rounded-full animate-pulse" />
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
