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
import RegenerateButton from '../components/review/RegenerateButton';
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

  const isReview =
    studyDay?.is_finished || !today;

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
    if (sessions.length === 0) {
      setError('세션이 없습니다. 먼저 공부 세션을 추가해주세요.');
      return;
    }
    // localStates에 있는 미저장 값들을 store에 반영
    localStates.forEach((local, sessionId) => {
      updateSession(sessionId, {
        focus_level: local.focusLevel,
        distraction: local.distraction || null,
      });
    });
    setFinishing(true);
    setError('');
    try {
      const data = await studyDaysApi.finishStudyDay(date);
      const bothGenerated = !!data.ai_summary && !!data.ai_feedback;
      setStudyDay((prev) =>
        prev
          ? {
              ...prev,
              is_finished: true,
              ai_summary: data.ai_summary,
              ai_feedback: data.ai_feedback,
              has_ai_result: bothGenerated && data.has_ai_result,
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
      setError(
        axiosErr.response?.data?.detail || '공부 종료에 실패했습니다.'
      );
    } finally {
      setFinishing(false);
    }
  };

  const handleRegenerate = async () => {
    if (!date) return;
    try {
      const result = await studyDaysApi.regenerateAI(date);
      const bothGenerated = !!result.ai_summary && !!result.ai_feedback;
      setStudyDay((prev) =>
        prev
          ? {
              ...prev,
              ai_summary: result.ai_summary,
              ai_feedback: result.ai_feedback,
              has_ai_result: bothGenerated && result.has_ai_result,
            }
          : prev
      );
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(
        axiosErr.response?.data?.detail || 'AI 재생성에 실패했습니다.'
      );
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; 돌아가기
        </button>
        <h2 className="text-lg font-semibold text-gray-800">{date}</h2>
        <div className="w-16" />
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {studyDay && isReview && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              공부 {studyDay.total_study_minutes}분 / 휴식{' '}
              {studyDay.total_rest_minutes}분
            </span>
            <span>평균 집중도: {studyDay.avg_focus_ceil}/5</span>
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
        onDelete={!isReview ? handleDeleteSession : undefined}
        localStates={localStates}
      />

      {/* Blur handler for distraction save */}
      {!isReview &&
        sessions
          .filter((s) => s.type === 'study' && s.status === 'running')
          .map((s) => (
            <input
              key={`blur-${s.id}`}
              type="hidden"
              onBlur={() => handleDistractionBlur(s.id)}
            />
          ))}

      {!isReview && (
        <div className="mt-4 flex flex-col items-center gap-3">
          {showTimerSetup ? (
            <TimerSetup
              onStart={handleStartSession}
              onCancel={() => setShowTimerSetup(false)}
            />
          ) : (
            <button
              onClick={() => setShowTimerSetup(true)}
              disabled={activeSessionId !== null}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-2xl text-white shadow-md transition-colors hover:bg-green-700 disabled:opacity-50"
              aria-label="세션 추가"
              data-testid="add-session-button"
            >
              +
            </button>
          )}

          <Button
            variant="secondary"
            onClick={handleFinish}
            disabled={finishing}
            data-testid="finish-button"
          >
            {finishing ? '종료 중...' : '오늘 공부 끝내기'}
          </Button>
        </div>
      )}

      {isReview && (
        <div className="mt-6 flex flex-col gap-4">
          <FocusChart sessions={sessions} />
          <AISummary summary={studyDay?.ai_summary ?? null} />
          <AIFeedback feedback={studyDay?.ai_feedback ?? null} />
          {studyDay && !studyDay.has_ai_result && (
            <div className="flex justify-center">
              <RegenerateButton
                hasAiResult={studyDay.has_ai_result}
                onRegenerate={handleRegenerate}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
