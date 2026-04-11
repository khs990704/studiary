import { useState, useRef, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

interface SessionMenuProps {
  onDelete: () => void;
}

export default function SessionMenu({ onDelete }: SessionMenuProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setShowTooltip(false);
      }
    };
    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTooltip]);

  return (
    <div className="relative" ref={tooltipRef}>
      <button
        onClick={() => setShowTooltip((v) => !v)}
        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        aria-label="세션 메뉴"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {showTooltip && (
        <div className="absolute right-0 top-8 z-10 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          <button
            onClick={() => {
              setShowTooltip(false);
              setShowConfirm(true);
            }}
            className="whitespace-nowrap px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            세션 삭제
          </button>
        </div>
      )}

      {showConfirm && (
        <Modal onClose={() => setShowConfirm(false)}>
          <h3 className="mb-2 text-lg font-semibold text-gray-800">
            세션 삭제
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            정말로 이 세션을 삭제하시겠습니까?
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowConfirm(false)}
            >
              취소
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setShowConfirm(false);
                onDelete();
              }}
            >
              삭제
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
