import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Session } from '../../types/session';

interface FocusChartProps {
  sessions: Session[];
}

export default function FocusChart({ sessions }: FocusChartProps) {
  const studySessions = sessions.filter((s) => s.type === 'study');

  if (studySessions.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-gray-400">
        공부 세션이 없어 그래프를 표시할 수 없습니다.
      </div>
    );
  }

  const data = studySessions.map((s, i) => ({
    name: `#${i + 1}`,
    집중도: s.focus_level ?? 0,
  }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">
        집중도 변화
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="집중도"
            stroke="#16a34a"
            strokeWidth={2}
            dot={{ r: 4, fill: '#16a34a' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
