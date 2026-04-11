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
      <div className="py-8 text-center text-gray-400">
        이 달에는 공부 기록이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {studyDays.map((sd) => (
        <StudyDayCard key={sd.date} studyDay={sd} ref={setCardRef(sd.date)} />
      ))}
    </div>
  );
}
