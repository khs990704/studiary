import { useMemo } from 'react';
import HeatmapCell from './HeatmapCell';
import { getDaysInMonth } from '../../utils/date';
import type { HeatmapDay } from '../../types/studyDay';

interface HeatmapGridProps {
  year: number;
  month: number;
  days: HeatmapDay[];
  onDayClick: (date: string) => void;
}

export default function HeatmapGrid({ year, month, days, onDayClick }: HeatmapGridProps) {
  const focusMap = useMemo(() => {
    const map = new Map<number, number>();
    days.forEach((d) => {
      const dayNum = parseInt(d.date.split('-')[2], 10);
      map.set(dayNum, d.avg_focus_ceil);
    });
    return map;
  }, [days]);

  const daysInMonth = getDaysInMonth(year, month);

  const handleDayClick = (day: number) => {
    const m = String(month).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onDayClick(`${year}-${m}-${d}`);
  };

  return (
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
        <HeatmapCell
          key={day}
          day={day}
          focusLevel={focusMap.get(day) ?? null}
          onClick={() => handleDayClick(day)}
        />
      ))}
    </div>
  );
}
