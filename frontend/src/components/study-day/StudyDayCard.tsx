import { useNavigate } from 'react-router-dom';
import type { StudyDay } from '../../types/studyDay';
import { isToday } from '../../utils/date';
import Button from '../common/Button';
import { forwardRef } from 'react';

interface StudyDayCardProps {
  studyDay: StudyDay;
}

function formatStudyTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatDisplayDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${weekdays[date.getDay()]}, ${months[m - 1]} ${d}`;
}

const StudyDayCard = forwardRef<HTMLDivElement, StudyDayCardProps>(
  ({ studyDay }, ref) => {
    const navigate = useNavigate();
    const today = isToday(studyDay.date);
    const displayDate = formatDisplayDate(studyDay.date);
    const totalStudyTime = formatStudyTime(studyDay.total_study_minutes);

    // Today's active card
    if (today && !studyDay.is_finished) {
      return (
        <div
          ref={ref}
          className="relative group bg-[#2a2a2a] rounded-xl p-6 transition-all duration-300 hover:bg-[#353534] animate-slide-up"
          data-testid={`study-day-card-${studyDay.date}`}
        >
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <span className="text-xs font-label uppercase tracking-widest text-[#7bdb85]">
                Current Session
              </span>
              <h4 className="font-headline text-2xl font-bold text-[#e5e2e1]">{displayDate}</h4>
            </div>
            <div className="text-right">
              <p className="font-headline text-3xl font-extrabold text-[#7bdb85]">{totalStudyTime}</p>
              <p className="text-xs text-[#becaba] mt-0.5">
                {studyDay.total_study_minutes === 0 ? 'Waiting to start' : 'In progress'}
              </p>
            </div>
          </div>

          {/* AI or empty state */}
          {studyDay.ai_summary ? (
            <div className="bg-[#39994B]/10 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">✨</span>
                <div className="space-y-1">
                  <p className="text-sm text-[#e5e2e1] leading-relaxed">{studyDay.ai_summary}</p>
                  <p className="text-[10px] text-[#becaba] pt-1 uppercase tracking-tighter">Analyzed by AI Assistant</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-[#39994B]/10 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-lg">✨</span>
                <p className="text-sm text-[#e5e2e1] italic">
                  Ready for your first session? AI will analyze your focus once you begin.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Button size="md" onClick={() => navigate(`/study/${studyDay.date}`)}>
              Go Study
            </Button>
          </div>
        </div>
      );
    }

    // Past / finished card
    return (
      <div
        ref={ref}
        className="bg-[#1c1b1b] rounded-xl p-6 transition-all duration-300 hover:bg-[#201f1f] animate-slide-up"
        data-testid={`study-day-card-${studyDay.date}`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            {today && (
              <span className="text-xs font-label uppercase tracking-widest text-[#7bdb85]">Today</span>
            )}
            <h4 className="font-headline text-lg font-bold text-[#e5e2e1]">{displayDate}</h4>
          </div>
          <div className="text-right">
            <p className="font-headline text-xl font-bold text-[#e5e2e1]">{totalStudyTime}</p>
            {studyDay.avg_focus_ceil != null && (
              <p className="text-xs text-[#becaba] mt-0.5">
                집중도 {studyDay.avg_focus_ceil}/5
              </p>
            )}
          </div>
        </div>

        {(studyDay.ai_summary || studyDay.ai_feedback) && (
          <div className="bg-[#2a2a2a]/50 p-4 rounded-lg relative overflow-hidden">
            <div className="flex items-start gap-3">
              <span className="text-base mt-0.5">✨</span>
              <div className="space-y-1.5">
                {studyDay.ai_summary && (
                  <p className="text-sm text-[#e5e2e1] leading-relaxed">{studyDay.ai_summary}</p>
                )}
                {studyDay.ai_feedback && (
                  <p className="text-sm text-[#becaba] leading-relaxed">{studyDay.ai_feedback}</p>
                )}
                <p className="text-[10px] text-[#becaba]/60 pt-1 uppercase tracking-tighter">
                  Analyzed by AI Assistant
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => navigate(`/study/${studyDay.date}`)}
            className="flex items-center gap-1.5 text-sm font-medium text-[#7bdb85] opacity-70 hover:opacity-100 transition-opacity"
          >
            기록 보기
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  }
);

StudyDayCard.displayName = 'StudyDayCard';

export default StudyDayCard;
