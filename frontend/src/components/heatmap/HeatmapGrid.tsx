import { useMemo } from 'react';
import HeatmapCell from './HeatmapCell';
import { getDaysInMonth, getFirstDayOfWeek } from '../../utils/date';
import { WEEKDAY_LABELS } from '../../utils/constants';
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
  const firstDay = getFirstDayOfWeek(year, month);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  const handleDayClick = (day: number) => {
    const m = String(month).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onDayClick(`${year}-${m}-${d}`);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="flex items-center justify-center text-xs text-gray-500"
          >
            {label}
          </div>
        ))}
        {cells.map((day, i) =>
          day === null ? (
            <div key={`empty-${i}`} />
          ) : (
            <HeatmapCell
              key={day}
              day={day}
              focusLevel={focusMap.get(day) ?? null}
              onClick={() => handleDayClick(day)}
            />
          )
        )}
      </div>
    </div>
  );
}
