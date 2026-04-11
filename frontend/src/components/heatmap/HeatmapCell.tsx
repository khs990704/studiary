import { getFocusColor } from '../../utils/focus';
import { HEATMAP_NO_RECORD_COLOR } from '../../utils/constants';

interface HeatmapCellProps {
  day: number;
  focusLevel: number | null;
  onClick: () => void;
}

export default function HeatmapCell({ day, focusLevel, onClick }: HeatmapCellProps) {
  const color = focusLevel !== null ? getFocusColor(focusLevel) : HEATMAP_NO_RECORD_COLOR;

  return (
    <button
      onClick={onClick}
      className="flex aspect-square w-full items-center justify-center rounded-md text-xs transition-all duration-150 hover:scale-105 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1"
      style={{ backgroundColor: color }}
      aria-label={`${day}일${focusLevel !== null ? `, 집중도 ${focusLevel}` : ', 기록 없음'}`}
      data-testid={`heatmap-cell-${day}`}
    >
      <span className="text-[10px] font-medium text-white/90 drop-shadow-sm">{day}</span>
    </button>
  );
}
