interface MonthSelectorProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export default function MonthSelector({ year, month, onChange }: MonthSelectorProps) {
  const handlePrev = () => {
    if (month === 1) {
      onChange(year - 1, 12);
    } else {
      onChange(year, month - 1);
    }
  };

  const handleNext = () => {
    if (month === 12) {
      onChange(year + 1, 1);
    } else {
      onChange(year, month + 1);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={handlePrev}
        className="rounded-lg px-3 py-1 text-gray-600 hover:bg-gray-100"
        aria-label="이전 달"
      >
        &lt;
      </button>
      <span className="text-lg font-semibold text-gray-800">
        {year}년 {month}월
      </span>
      <button
        onClick={handleNext}
        className="rounded-lg px-3 py-1 text-gray-600 hover:bg-gray-100"
        aria-label="다음 달"
      >
        &gt;
      </button>
    </div>
  );
}
