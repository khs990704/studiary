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
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">방해요소</span>
      <textarea
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder="방해요소를 입력하세요..."
        maxLength={MAX_DISTRACTION_LENGTH}
        rows={2}
        className="resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-green-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-50"
        data-testid="distraction-input"
      />
      <span className="text-right text-[10px] text-gray-300">
        {value.length}/{MAX_DISTRACTION_LENGTH}
      </span>
    </div>
  );
}
