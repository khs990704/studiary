import React from 'react';
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
      className="relative flex aspect-square w-full items-center justify-center rounded-md text-xs transition-all duration-150 hover:scale-110 focus:outline-none hover:ring-1 hover:ring-offset-1 hover:ring-offset-[#1c1b1b]"
      style={{ backgroundColor: color, '--tw-ring-color': color } as React.CSSProperties}
      aria-label={`${day}일${focusLevel !== null ? `, 집중도 ${focusLevel}` : ', 기록 없음'}`}
      data-testid={`heatmap-cell-${day}`}
    >
    </button>
  );
}
