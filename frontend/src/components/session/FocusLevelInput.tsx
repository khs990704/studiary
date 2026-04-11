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
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-500">집중도</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            onClick={() => !disabled && onChange(level)}
            disabled={disabled}
            className={`h-5 flex-1 rounded-sm transition-colors ${
              value !== null && level <= value
                ? FOCUS_COLORS[level - 1]
                : 'bg-gray-200'
            } ${disabled ? 'cursor-default' : 'hover:opacity-80'}`}
            aria-label={`집중도 ${level}`}
            data-testid={`focus-level-${level}`}
          />
        ))}
      </div>
      {value !== null && (
        <span className="text-xs text-gray-500">{value}/5</span>
      )}
    </div>
  );
}
