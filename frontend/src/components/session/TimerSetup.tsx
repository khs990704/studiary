import { useState } from 'react';
import Button from '../common/Button';
import { DEFAULT_TIMER_MINUTES } from '../../utils/constants';

interface TimerSetupProps {
  onStart: (minutes: number) => void;
  onCancel: () => void;
}

const PRESETS = [25, 50, 90];

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
    <div className="w-full max-w-xs overflow-hidden rounded-xl border border-[#3f4a3e] bg-[#1c1b1b] animate-scale-in">
      <div className="px-5 pt-5 pb-4">
        <h3 className="mb-1 text-sm font-semibold text-[#e5e2e1]">타이머 설정</h3>
        <p className="text-xs text-[#becaba]/60">공부할 시간을 설정하세요</p>

        {/* Presets */}
        <div className="mt-3 flex gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setMinutes(p)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                minutes === p
                  ? 'bg-[#44a354] text-[#002107]'
                  : 'bg-[#2a2a2a] text-[#becaba] hover:bg-[#353534]'
              }`}
            >
              {p}분
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleDecrement}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2a2a2a] text-[#becaba] transition-all hover:bg-[#353534] hover:text-[#e5e2e1] active:scale-90"
            aria-label="1분 줄이기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <div className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#3f4a3e] bg-[#2a2a2a] px-3 py-2">
            <input
              type="number"
              value={minutes}
              onChange={handleInputChange}
              min={1}
              className="w-12 bg-transparent text-center font-mono text-lg font-bold tabular-nums text-[#e5e2e1] focus:outline-none"
              aria-label="타이머 분"
            />
            <span className="text-sm font-medium text-[#becaba]/60">분</span>
          </div>
          <button
            onClick={handleIncrement}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2a2a2a] text-[#becaba] transition-all hover:bg-[#353534] hover:text-[#e5e2e1] active:scale-90"
            aria-label="1분 늘리기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-t border-[#3f4a3e] bg-[#131313]/50 px-5 py-3.5">
        <Button variant="secondary" size="sm" className="flex-1" onClick={onCancel}>
          취소
        </Button>
        <Button size="sm" className="flex-1" onClick={() => onStart(minutes)}>
          시작하기
        </Button>
      </div>
    </div>
  );
}
