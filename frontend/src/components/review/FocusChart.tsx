import type { Session } from '../../types/session';

interface FocusChartProps {
  sessions: Session[];
}

function buildPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

export default function FocusChart({ sessions }: FocusChartProps) {
  const studySessions = sessions.filter((s) => s.type === 'study');

  if (studySessions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <p className="text-sm text-[#899486]/60">공부 세션이 없어 그래프를 표시할 수 없습니다.</p>
      </div>
    );
  }

  const focusValues = studySessions.map((s) => s.focus_level ?? 0);
  const avg = focusValues.reduce((a, b) => a + b, 0) / focusValues.length;

  const points = focusValues.map((val, i) => ({
    x: studySessions.length === 1 ? 50 : (i / (studySessions.length - 1)) * 100,
    y: 100 - ((val - 1) / 4) * 100,
  }));

  const linePath = buildPath(points);
  const areaPath = linePath + ` V 100 H ${points[0].x} Z`;

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-end px-1">
        <h2 className="text-lg font-headline font-bold text-[#e5e2e1]">집중도 변화</h2>
        <span className="text-xs font-bold text-[#7bdb85]">평균 레벨 {avg.toFixed(1)}</span>
      </div>
      <div className="bg-[#1c1b1b] rounded-2xl p-4 sm:p-8 border border-white/5 relative overflow-hidden">
        <div className="h-64 sm:h-72 w-full relative">
          {/* Y-Axis Labels */}
          <div className="absolute inset-y-0 left-0 flex flex-col justify-between text-[10px] text-zinc-600 font-body py-1 z-10">
            <span>5</span>
            <span>4</span>
            <span>3</span>
            <span>2</span>
            <span>1</span>
          </div>
          {/* Graph Container */}
          <div className="ml-8 h-full relative">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="w-full h-px bg-white/5" />
              <div className="w-full h-px bg-white/5" />
              <div className="w-full h-px bg-white/5" />
              <div className="w-full h-px bg-white/5" />
              <div className="w-full h-px bg-white/10" />
            </div>
            {/* SVG Graph */}
            <svg
              className="absolute inset-0 w-full h-full overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7bdb85" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#7bdb85" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Filled area */}
              <path d={areaPath} fill="url(#chart-fill)" vectorEffect="non-scaling-stroke" />
              {/* Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#7bdb85"
                strokeWidth="2"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              {/* Data points */}
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="#7bdb85" />
              ))}
            </svg>
          </div>
          {/* X-Axis Labels */}
          <div className="ml-8 flex justify-between text-[10px] text-zinc-500 font-body pt-4">
            {studySessions.map((_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
          {/* X-Axis Title */}
          <div className="text-center w-full mt-4">
            <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">Session</span>
          </div>
        </div>
      </div>
    </section>
  );
}
