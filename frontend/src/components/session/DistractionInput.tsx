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
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#becaba]/60">방해요소</span>
      <textarea
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder="방해요소를 입력하세요..."
        maxLength={MAX_DISTRACTION_LENGTH}
        rows={2}
        className="resize-none rounded-xl border border-[#3f4a3e] bg-[#2a2a2a] px-3 py-2.5 text-sm text-[#e5e2e1] placeholder-[#becaba]/30 transition-colors focus:border-[#7bdb85]/50 focus:outline-none focus:ring-1 focus:ring-[#7bdb85]/30 disabled:opacity-50"
        data-testid="distraction-input"
      />
      <span className="text-right text-[10px] text-[#becaba]/30">
        {value.length}/{MAX_DISTRACTION_LENGTH}
      </span>
    </div>
  );
}
