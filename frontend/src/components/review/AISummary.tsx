interface AISummaryProps {
  summary: string | null;
}

export default function AISummary({ summary }: AISummaryProps) {
  if (!summary) return null;

  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-4">
      <h3 className="mb-1 text-sm font-semibold text-green-800">
        AI 한 줄 요약
      </h3>
      <p className="text-sm text-green-700">{summary}</p>
    </div>
  );
}
