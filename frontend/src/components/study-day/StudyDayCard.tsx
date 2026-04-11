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
        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        data-testid={`study-day-card-${studyDay.date}`}
      >
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">{studyDay.date}</h3>
          <span className="text-sm text-gray-500">
            총 {totalMinutes}분 (공부 {studyDay.total_study_minutes}분 / 휴식{' '}
            {studyDay.total_rest_minutes}분)
          </span>
        </div>

        {studyDay.ai_summary && (
          <p className="mb-1 text-sm text-gray-600">
            <span className="font-medium text-green-700">요약:</span>{' '}
            {studyDay.ai_summary}
          </p>
        )}

        {studyDay.ai_feedback && (
          <p className="mb-2 text-sm text-gray-600">
            <span className="font-medium text-blue-700">피드백:</span>{' '}
            {studyDay.ai_feedback}
          </p>
        )}

        {today && !studyDay.is_finished && (
          <Button
            size="sm"
            onClick={() => navigate(`/study/${studyDay.date}`)}
            className="mt-2"
          >
            공부하러 가기
          </Button>
        )}

        {(studyDay.is_finished || !today) && (
          <button
            onClick={() => navigate(`/study/${studyDay.date}`)}
            className="mt-2 text-sm text-green-600 hover:underline"
          >
            기록 보기
          </button>
        )}
      </div>
    );
  }
);

StudyDayCard.displayName = 'StudyDayCard';

export default StudyDayCard;
