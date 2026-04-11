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
    <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-800">타이머 설정</h3>
      <div className="flex items-center gap-3">
        <button
          onClick={handleDecrement}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-xl hover:bg-gray-100"
          aria-label="1분 줄이기"
        >
          -
        </button>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={minutes}
            onChange={handleInputChange}
            min={1}
            className="w-16 rounded-lg border border-gray-300 p-2 text-center text-lg focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            aria-label="타이머 분"
          />
          <span className="text-gray-600">분</span>
        </div>
        <button
          onClick={handleIncrement}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-xl hover:bg-gray-100"
          aria-label="1분 늘리기"
        >
          +
        </button>
      </div>
      <div className="flex gap-2">
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
