import { MAX_DISTRACTION_LENGTH } from '../../utils/constants';

interface DistractionInputProps {
  value: string;
  onChange: (text: string) => void;
  disabled?: boolean;
}

export default function DistractionInput({
  value,
  onChange,
  disabled = false,
}: DistractionInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_DISTRACTION_LENGTH) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-500">방해요소</span>
      <textarea
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder="방해요소를 입력하세요..."
        maxLength={MAX_DISTRACTION_LENGTH}
        rows={2}
        className="resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-50"
        data-testid="distraction-input"
      />
      <span className="text-right text-xs text-gray-400">
        {value.length}/{MAX_DISTRACTION_LENGTH}
      </span>
    </div>
  );
}
