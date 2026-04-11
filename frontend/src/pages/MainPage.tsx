import { useState, useEffect, useCallback } from 'react';
import HeatmapGrid from '../components/heatmap/HeatmapGrid';
import MonthSelector from '../components/heatmap/MonthSelector';
import StudyDayCardList from '../components/study-day/StudyDayCardList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useStudyDayStore } from '../stores/studyDayStore';
import { useNavigate } from 'react-router-dom';
import { formatDate, isToday as checkIsToday } from '../utils/date';
import Button from '../components/common/Button';

export default function MainPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [scrollToDate, setScrollToDate] = useState<string | null>(null);

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
    loadData();
  }, [loadData]);

  const handleMonthChange = (y: number, m: number) => {
    setYear(y);
    setMonth(m);
    setScrollToDate(null);
  };

  const handleDayClick = (date: string) => {
    const found = studyDays.find((sd) => sd.date === date);
    if (found) {
      setScrollToDate(date);
    } else if (checkIsToday(date)) {
      navigate(`/study/${date}`);
    }
  };

  const hasTodayRecord = studyDays.some((sd) => sd.date === todayStr);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
        <MonthSelector year={year} month={month} onChange={handleMonthChange} />
        <div className="mt-4">
          <HeatmapGrid
            year={year}
            month={month}
            days={heatmapData?.days ?? []}
            onDayClick={handleDayClick}
          />
        </div>
      </div>

      {!hasTodayRecord && (
        <div className="mb-4 flex justify-center">
          <Button onClick={() => navigate(`/study/${todayStr}`)}>
            오늘 공부 시작하기
          </Button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <StudyDayCardList studyDays={studyDays} scrollToDate={scrollToDate} />
      )}
    </div>
  );
}
