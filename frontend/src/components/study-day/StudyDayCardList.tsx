import { useRef, useCallback, useEffect } from 'react';
import StudyDayCard from './StudyDayCard';
import type { StudyDay } from '../../types/studyDay';

interface StudyDayCardListProps {
  studyDays: StudyDay[];
  scrollTrigger: { date: string; seq: number } | null;
}

export default function StudyDayCardList({
  studyDays,
  scrollTrigger,
}: StudyDayCardListProps) {
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const setCardRef = useCallback(
    (date: string) => (el: HTMLDivElement | null) => {
      if (el) {
        cardRefs.current.set(date, el);
      } else {
        cardRefs.current.delete(date);
      }
    },
    []
  );

  useEffect(() => {
    if (scrollTrigger) {
      const el = cardRefs.current.get(scrollTrigger.date);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [scrollTrigger]);

  if (studyDays.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <div className="text-3xl opacity-30">&#128218;</div>
        <p className="text-sm text-gray-400">이 달에는 공부 기록이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {studyDays.map((sd) => (
        <StudyDayCard key={sd.date} studyDay={sd} ref={setCardRef(sd.date)} />
      ))}
    </div>
  );
}
