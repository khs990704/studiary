interface FocusLevelInputProps {
  value: number | null;
  onChange: (level: number) => void;
  disabled?: boolean;
}

const FOCUS_COLORS = [
  'bg-red-400',
  'bg-orange-400',
  'bg-yellow-400',
  'bg-lime-400',
  'bg-green-500',
];

export default function FocusLevelInput({
  value,
  onChange,
  disabled = false,
}: FocusLevelInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">집중도</span>
        {value !== null && (
          <span className="text-[10px] font-semibold text-gray-400">{value}/5</span>
        )}
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            onClick={() => !disabled && onChange(value === level ? 0 : level)}
            disabled={disabled}
            className={`h-6 flex-1 rounded-md transition-all duration-150 ${
              value !== null && value > 0 && level <= value
                ? FOCUS_COLORS[level - 1]
                : 'bg-gray-100'
            } ${disabled ? 'cursor-default' : 'hover:opacity-80 active:scale-95'}`}
            aria-label={`집중도 ${level}`}
            data-testid={`focus-level-${level}`}
          />
        ))}
      </div>
    </div>
  );
}
