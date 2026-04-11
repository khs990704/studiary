interface AISummaryProps {
  summary: string | null;
}

export default function AISummary({ summary }: AISummaryProps) {
  if (!summary) return null;

  return (
    <div className="rounded-2xl border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 p-5 shadow-soft">
      <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-green-600">
        AI 한 줄 요약
      </h3>
      <p className="text-sm leading-relaxed text-green-800">{summary}</p>
    </div>
  );
}
