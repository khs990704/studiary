import { useEffect, useCallback, useState } from 'react';
import HeatmapGrid from '../components/heatmap/HeatmapGrid';
import MonthSelector from '../components/heatmap/MonthSelector';
import StudyDayCardList from '../components/study-day/StudyDayCardList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useStudyDayStore } from '../stores/studyDayStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatDate, isToday as checkIsToday } from '../utils/date';
import { HEATMAP_COLORS, HEATMAP_NO_RECORD_COLOR } from '../utils/constants';

export default function MainPage() {
  const now = new Date();
  const [searchParams, setSearchParams] = useSearchParams();
  const [scrollTrigger, setScrollTrigger] = useState<{ date: string; seq: number } | null>(null);

  const year = parseInt(searchParams.get('year') ?? String(now.getFullYear()), 10);
  const month = parseInt(searchParams.get('month') ?? String(now.getMonth() + 1), 10);

  const {
    studyDays,
    heatmapData,
    loading,
    fetchStudyDays,
    fetchHeatmap,
  } = useStudyDayStore();

  const navigate = useNavigate();
  const todayStr = formatDate(new Date());

  const loadData = useCallback(() => {
    fetchStudyDays(year, month);
    fetchHeatmap(year, month);
  }, [year, month, fetchStudyDays, fetchHeatmap]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMonthChange = (y: number, m: number) => {
    setSearchParams({ year: String(y), month: String(m) });
    setScrollTrigger(null);
  };

  const handleDayClick = (date: string) => {
    const found = studyDays.find((sd) => sd.date === date);
    if (found) {
      setScrollTrigger((prev) => ({ date, seq: (prev?.seq ?? 0) + 1 }));
    } else if (checkIsToday(date)) {
      navigate(`/study/${date}`);
    }
  };

  const hasTodayRecord = studyDays.some((sd) => sd.date === todayStr);
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const handleGoToToday = () => {
    setSearchParams({ year: String(now.getFullYear()), month: String(now.getMonth() + 1) });
  };

  return (
    <div className="mx-auto max-w-4xl px-6 pt-24 pb-16 space-y-8">

      {/* Page header */}
      <section className="space-y-2">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-[#e5e2e1] leading-tight">
          Daily Growth
        </h1>
        <p className="text-[#becaba] text-sm">집중을 기록하고, 성장을 확인하세요.</p>
      </section>

      {/* Heatmap section */}
      <section className="bg-[#1c1b1b] rounded-xl p-6 space-y-5">
        {/* Section header */}
        <div className="flex flex-wrap items-end justify-between gap-y-3">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#7bdb85]">
              Progress Tracker
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-headline text-xl font-bold tracking-tight text-[#e5e2e1]">
                잔디를 푸르게 푸르게
              </h2>
              <MonthSelector year={year} month={month} onChange={handleMonthChange} />
            </div>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-1.5 text-[10px] text-[#becaba] opacity-60">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: HEATMAP_NO_RECORD_COLOR }} />
              {[1, 2, 3, 4, 5].map((lvl) => (
                <div key={lvl} className="h-3 w-3 rounded-sm" style={{ backgroundColor: HEATMAP_COLORS[lvl] }} />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Grid */}
        <HeatmapGrid
          year={year}
          month={month}
          days={heatmapData?.days ?? []}
          onDayClick={handleDayClick}
        />
      </section>

      {/* Action button */}
      {!isCurrentMonth ? (
        <div className="flex justify-center">
          <button
            onClick={handleGoToToday}
            className="bg-gradient-to-br from-[#7bdb85] to-[#44a354] text-[#00320e] font-headline font-bold py-4 px-10 rounded-full flex items-center gap-3 shadow-lg shadow-[#39994B]/20 transition-transform hover:scale-105 active:scale-95"
          >
            ◀ Go Back Today
          </button>
        </div>
      ) : !hasTodayRecord && (
        <div className="flex justify-center">
          <button
            onClick={() => navigate(`/study/${todayStr}`)}
            className="bg-gradient-to-br from-[#7bdb85] to-[#44a354] text-[#00320e] font-headline font-bold py-4 px-10 rounded-full flex items-center gap-3 shadow-lg shadow-[#39994B]/20 transition-transform hover:scale-105 active:scale-95"
          >
            Go Study ▶
          </button>
        </div>
      )}

      {/* Study records section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-xl font-bold tracking-tight text-[#e5e2e1]">
            Recorded Studies
          </h3>
          <span className="text-sm text-[#becaba]">
            {year}년 {month}월
          </span>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <StudyDayCardList studyDays={studyDays} scrollTrigger={scrollTrigger} />
        )}
      </section>

    </div>
  );
}
