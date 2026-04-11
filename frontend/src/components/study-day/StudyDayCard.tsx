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
        className="overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-200 hover:shadow-elevated animate-slide-up"
        data-testid={`study-day-card-${studyDay.date}`}
      >
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <span className={`text-sm font-semibold ${today ? 'text-green-600' : 'text-gray-800'}`}>
            {studyDay.date}
          </span>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="rounded-full bg-green-50 px-2 py-0.5 font-medium text-green-600">
              공부 {studyDay.total_study_minutes}분
            </span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-500">
              휴식 {studyDay.total_rest_minutes}분
            </span>
            <span className="font-medium text-gray-500">
              총 {totalMinutes}분
            </span>
          </div>
        </div>

        {/* 본문 */}
        <div className="divide-y divide-gray-50">
          {studyDay.ai_summary && (
            <div className="px-5 py-3.5">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-green-500">요약</p>
              <p className="text-sm leading-relaxed text-gray-600">{studyDay.ai_summary}</p>
            </div>
          )}

          {studyDay.ai_feedback && (
            <div className="px-5 py-3.5">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-blue-400">피드백</p>
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
                className="group flex items-center gap-1 text-sm font-medium text-green-600 transition-colors hover:text-green-700"
              >
                기록 보기
                <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
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
