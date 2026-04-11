import { useEffect, useCallback, useState } from 'react';
import HeatmapGrid from '../components/heatmap/HeatmapGrid';
import MonthSelector from '../components/heatmap/MonthSelector';
import StudyDayCardList from '../components/study-day/StudyDayCardList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useStudyDayStore } from '../stores/studyDayStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatDate, isToday as checkIsToday } from '../utils/date';
import Button from '../components/common/Button';

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
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight text-gray-800">
            Study <span className="text-green-600">Heatmap</span>
          </h2>
          <MonthSelector year={year} month={month} onChange={handleMonthChange} />
        </div>
        <div className="mt-4">
          <HeatmapGrid
            year={year}
            month={month}
            days={heatmapData?.days ?? []}
            onDayClick={handleDayClick}
          />
        </div>
      </div>

      {!isCurrentMonth ? (
        <div className="mb-4 flex justify-center">
          <Button onClick={handleGoToToday}>
            오늘 날짜 돌아가기
          </Button>
        </div>
      ) : !hasTodayRecord && (
        <div className="mb-4 flex justify-center">
          <Button onClick={() => navigate(`/study/${todayStr}`)}>
            오늘 공부 시작하기
          </Button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <StudyDayCardList studyDays={studyDays} scrollTrigger={scrollTrigger} />
      )}
    </div>
  );
}
