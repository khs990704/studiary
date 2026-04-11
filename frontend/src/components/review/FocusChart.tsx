import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import type { Session } from '../../types/session';

interface FocusChartProps {
  sessions: Session[];
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-[#3f4a3e] bg-[#2a2a2a] px-3 py-2">
        <p className="text-xs font-semibold text-[#e5e2e1]">집중도 {payload[0].value}/5</p>
      </div>
    );
  }
  return null;
}

export default function FocusChart({ sessions }: FocusChartProps) {
  const studySessions = sessions.filter((s) => s.type === 'study');

  if (studySessions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <p className="text-sm text-[#becaba]/50">공부 세션이 없어 그래프를 표시할 수 없습니다.</p>
      </div>
    );
  }

  const data = studySessions.map((s, i) => ({
    name: `#${i + 1}`,
    집중도: s.focus_level ?? 0,
  }));

  return (
    <div className="overflow-hidden rounded-xl border border-[#3f4a3e]/60 bg-[#1c1b1b]">
      <div className="border-b border-[#3f4a3e]/60 px-5 py-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#becaba]/60">집중도 변화</h3>
      </div>
      <div className="px-4 py-4">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f4a3e" strokeOpacity={0.5} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#becaba', opacity: 0.6 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 11, fill: '#becaba', opacity: 0.6 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="집중도"
              stroke="#7bdb85"
              strokeWidth={2}
              dot={{ r: 4, fill: '#7bdb85', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#7bdb85', strokeWidth: 2, stroke: '#1c1b1b' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
