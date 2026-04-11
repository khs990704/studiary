import { MAX_DISTRACTION_LENGTH } from '../../utils/constants';

interface DistractionInputProps {
  value: string;
  onChange: (text: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export default function DistractionInput({
  value,
  onChange,
  onBlur,
  disabled = false,
}: DistractionInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_DISTRACTION_LENGTH) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder="Add distractions/external noise..."
        maxLength={MAX_DISTRACTION_LENGTH}
        rows={2}
        className="w-full bg-transparent border border-[#3f4a3e] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#7bdb85]/50 focus:ring-1 focus:ring-[#7bdb85]/30 text-sm text-[#e5e2e1] placeholder:text-[#899486]/40 resize-none min-h-[60px] sm:min-h-[80px] disabled:opacity-50"
        data-testid="distraction-input"
      />
      <span className="absolute bottom-2 right-3 text-[10px] text-[#899486]/50 font-medium">
        {value.length}/{MAX_DISTRACTION_LENGTH}
      </span>
    </div>
  );
}
