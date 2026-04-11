import { useState } from 'react';
import Button from '../common/Button';
import { DEFAULT_TIMER_MINUTES } from '../../utils/constants';

interface TimerSetupProps {
  onStart: (minutes: number) => void;
  onCancel: () => void;
}

export default function TimerSetup({ onStart, onCancel }: TimerSetupProps) {
  const [minutes, setMinutes] = useState(DEFAULT_TIMER_MINUTES);

  const handleIncrement = () => setMinutes((m) => m + 1);
  const handleDecrement = () => setMinutes((m) => Math.max(1, m - 1));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1) {
      setMinutes(val);
    } else if (e.target.value === '') {
      setMinutes(1);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl bg-white p-6 shadow-card animate-scale-in">
      <h3 className="text-sm font-bold text-gray-700">타이머 설정</h3>
      <div className="flex items-center gap-3">
        <button
          onClick={handleDecrement}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg font-medium text-gray-500 transition-all hover:bg-gray-200 hover:text-gray-700 active:scale-90"
          aria-label="1분 줄이기"
        >
          -
        </button>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={minutes}
            onChange={handleInputChange}
            min={1}
            className="w-16 rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-center font-mono text-lg font-bold tabular-nums focus:border-green-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-green-500"
            aria-label="타이머 분"
          />
          <span className="text-sm font-medium text-gray-400">분</span>
        </div>
        <button
          onClick={handleIncrement}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg font-medium text-gray-500 transition-all hover:bg-gray-200 hover:text-gray-700 active:scale-90"
          aria-label="1분 늘리기"
        >
          +
        </button>
      </div>
      <div className="flex gap-2.5">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          취소
        </Button>
        <Button size="sm" onClick={() => onStart(minutes)}>
          시작
        </Button>
      </div>
    </div>
  );
}
