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
      className="flex aspect-square w-full items-center justify-center rounded-sm text-xs transition-transform hover:scale-110 focus:outline-none focus:ring-1 focus:ring-green-400"
      style={{ backgroundColor: color }}
      aria-label={`${day}일${focusLevel !== null ? `, 집중도 ${focusLevel}` : ', 기록 없음'}`}
      data-testid={`heatmap-cell-${day}`}
    >
      <span className="text-[10px] text-white/80">{day}</span>
    </button>
  );
}
