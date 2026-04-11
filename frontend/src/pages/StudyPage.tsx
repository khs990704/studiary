import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

export default function StudyPage() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();

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

  const handleTimerComplete = useCallback(() => {
    if (activeSessionId !== null) {
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
  }, [activeSessionId, updateSession, localStates]);

  const timer = useTimer(handleTimerComplete);

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
      const missingFocusSession = sessions
        .filter((s) => s.type === 'study')
        .find((s) => {
          const local = localStates.get(s.id);
          const effectiveFocus = local ? local.focusLevel : s.focus_level;
          return effectiveFocus === null || effectiveFocus === undefined;
        });

      if (missingFocusSession) {
        alert('집중도는 필수 입력 요소입니다');
        const el = document.querySelector(
          `[data-testid="session-card-${missingFocusSession.id}"]`
        );
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
    }

    setFinishing(true);
    setError('');

    // 이미 종료된 경우 AI 재생성만 시도
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

    // localStates에 있는 미저장 값들을 store 및 서버에 반영
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
      timer.resetTimer();
      setActiveSessionId(null);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      alert(axiosErr.response?.data?.detail || '공부 종료에 실패했습니다.');
    } finally {
      setFinishing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-1 text-sm font-medium text-gray-400 transition-colors hover:text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          돌아가기
        </button>
        <h2 className="text-base font-bold text-gray-800">{date}</h2>
        <div className="w-16" />
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {studyDay && isReview && (
        <div className="mb-5 overflow-hidden rounded-2xl bg-white shadow-card">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-600">
                공부 {studyDay.total_study_minutes}분
              </span>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-500">
                휴식 {studyDay.total_rest_minutes}분
              </span>
            </div>
            <span className="text-xs font-semibold text-gray-500">
              평균 집중도 <span className="text-green-600">{studyDay.avg_focus_ceil}/5</span>
            </span>
          </div>
        </div>
      )}

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
        <div className="mt-5 flex flex-col items-center gap-4">
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
                className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-2xl text-white shadow-lg shadow-green-600/30 transition-all duration-200 hover:bg-green-700 hover:shadow-xl hover:shadow-green-600/40 active:scale-95 disabled:opacity-50 disabled:shadow-none"
                aria-label="세션 추가"
                data-testid="add-session-button"
              >
                +
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
        <div className="mt-6 flex flex-col gap-4 animate-slide-up">
          <FocusChart sessions={sessions} />
          <AISummary summary={studyDay?.ai_summary ?? null} />
          <AIFeedback feedback={studyDay?.ai_feedback ?? null} />
        </div>
      )}
    </div>
  );
}
