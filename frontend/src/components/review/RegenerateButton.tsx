import { useState } from 'react';
import Button from '../common/Button';

interface RegenerateButtonProps {
  hasAiResult: boolean;
  onRegenerate: () => Promise<void>;
}

export default function RegenerateButton({
  hasAiResult,
  onRegenerate,
}: RegenerateButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onRegenerate();
    } finally {
      setLoading(false);
    }
  };

  if (hasAiResult) return null;

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleClick}
      disabled={loading}
      data-testid="regenerate-button"
    >
      {loading ? 'AI 생성 중...' : 'AI 요약/피드백 생성'}
    </Button>
  );
}
