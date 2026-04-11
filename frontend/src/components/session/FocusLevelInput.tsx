interface FocusLevelInputProps {
  value: number | null;
  onChange: (level: number) => void;
  disabled?: boolean;
}

const FOCUS_LABELS = ['최악', '나쁨', '보통', '좋음', '최고'];
const FOCUS_COLORS = [
  { active: 'bg-red-500', inactive: 'bg-[#2a2a2a] hover:bg-red-500/20' },
  { active: 'bg-orange-400', inactive: 'bg-[#2a2a2a] hover:bg-orange-400/20' },
  { active: 'bg-yellow-400', inactive: 'bg-[#2a2a2a] hover:bg-yellow-400/20' },
  { active: 'bg-lime-400', inactive: 'bg-[#2a2a2a] hover:bg-lime-400/20' },
  { active: 'bg-[#7bdb85]', inactive: 'bg-[#2a2a2a] hover:bg-[#7bdb85]/20' },
];

export default function FocusLevelInput({
  value,
  onChange,
  disabled = false,
}: FocusLevelInputProps) {
  const activeLabel = value != null && value > 0 ? FOCUS_LABELS[value - 1] : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#becaba]/60">집중도</span>
        <div className="flex items-center gap-1.5">
          {activeLabel && (
            <span className="text-[11px] font-semibold text-[#becaba]">{activeLabel}</span>
          )}
          {value !== null && value > 0 && (
            <span className="rounded-full bg-[#2a2a2a] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[#becaba]">
              {value}/5
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => {
          const isActive = value !== null && value > 0 && level <= value;
          const colors = FOCUS_COLORS[level - 1];
          return (
            <button
              key={level}
              onClick={() => !disabled && onChange(value === level ? 0 : level)}
              disabled={disabled}
              title={FOCUS_LABELS[level - 1]}
              className={`h-5 flex-1 rounded-full transition-all duration-150 ${
                isActive ? colors.active : colors.inactive
              } ${disabled ? 'cursor-default' : 'active:scale-95'}`}
              aria-label={`집중도 ${level}`}
              data-testid={`focus-level-${level}`}
            />
          );
        })}
      </div>
    </div>
  );
}
