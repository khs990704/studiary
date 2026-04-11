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
    <div className="flex items-center gap-0.5">
      <button
        onClick={handlePrev}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#becaba]/50 transition-all hover:bg-[#2a2a2a] hover:text-[#e5e2e1] active:scale-90"
        aria-label="이전 달"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      <span className="min-w-[88px] text-center text-sm font-semibold text-[#e5e2e1]">
        {year}. {String(month).padStart(2, '0')}
      </span>
      <button
        onClick={handleNext}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#becaba]/50 transition-all hover:bg-[#2a2a2a] hover:text-[#e5e2e1] active:scale-90"
        aria-label="다음 달"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}
