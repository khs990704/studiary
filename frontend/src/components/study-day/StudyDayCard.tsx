import { useNavigate } from 'react-router-dom';
import type { StudyDay } from '../../types/studyDay';
import { isToday } from '../../utils/date';
import Button from '../common/Button';
import { forwardRef } from 'react';

interface StudyDayCardProps {
  studyDay: StudyDay;
}

const StudyDayCard = forwardRef<HTMLDivElement, StudyDayCardProps>(
  ({ studyDay }, ref) => {
    const navigate = useNavigate();
    const today = isToday(studyDay.date);
    const totalMinutes = studyDay.total_study_minutes + studyDay.total_rest_minutes;

    return (
      <div
        ref={ref}
        className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
        data-testid={`study-day-card-${studyDay.date}`}
      >
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between bg-gray-50 px-5 py-3">
          <div className="flex items-center gap-2">
            {today && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                오늘
              </span>
            )}
            <span className="font-semibold text-gray-800">{studyDay.date}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>공부 <span className="font-medium text-gray-700">{studyDay.total_study_minutes}분</span></span>
            <span className="text-gray-300">|</span>
            <span>휴식 <span className="font-medium text-gray-700">{studyDay.total_rest_minutes}분</span></span>
            <span className="text-gray-300">|</span>
            <span>총 <span className="font-medium text-gray-700">{totalMinutes}분</span></span>
          </div>
        </div>

        {/* 본문 */}
        <div className="divide-y divide-gray-100">
          {studyDay.ai_summary && (
            <div className="px-5 py-3">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-green-600">요약</p>
              <p className="text-sm leading-relaxed text-gray-600">{studyDay.ai_summary}</p>
            </div>
          )}

          {studyDay.ai_feedback && (
            <div className="px-5 py-3">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-blue-500">피드백</p>
              <p className="text-sm leading-relaxed text-gray-600">{studyDay.ai_feedback}</p>
            </div>
          )}

          <div className="flex justify-end px-5 py-3">
            {today && !studyDay.is_finished ? (
              <Button size="sm" onClick={() => navigate(`/study/${studyDay.date}`)}>
                공부하러 가기
              </Button>
            ) : (
              <button
                onClick={() => navigate(`/study/${studyDay.date}`)}
                className="text-sm text-green-600 hover:underline"
              >
                기록 보기 →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

StudyDayCard.displayName = 'StudyDayCard';

export default StudyDayCard;
