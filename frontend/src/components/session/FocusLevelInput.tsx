interface FocusLevelInputProps {
  value: number | null;
  onChange: (level: number) => void;
  disabled?: boolean;
}

export default function FocusLevelInput({
  value,
  onChange,
  disabled = false,
}: FocusLevelInputProps) {
  return (
    <div className="space-y-3">
      <label className="block text-[10px] uppercase tracking-widest text-[#899486] font-medium">
        FOCUS LEVEL
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((level) => {
          const isActive = value !== null && value > 0 && level <= value;
          return (
            <button
              key={level}
              onClick={() => !disabled && onChange(value === level ? 0 : level)}
              disabled={disabled}
              className={`w-3 h-3 rounded-full transition-all ${
                isActive
                  ? 'bg-[#7bdb85] shadow-[0_0_8px_rgba(123,219,133,0.4)]'
                  : 'bg-[#353534]'
              } ${disabled ? 'cursor-default' : 'cursor-pointer hover:bg-[#7bdb85]/50 active:scale-90'}`}
              aria-label={`집중도 ${level}`}
              data-testid={`focus-level-${level}`}
            />
          );
        })}
      </div>
    </div>
  );
}
