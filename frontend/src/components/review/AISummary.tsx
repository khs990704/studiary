interface AISummaryProps {
  summary: string | null;
}

export default function AISummary({ summary }: AISummaryProps) {
  if (!summary) return null;

  return (
    <div className="overflow-hidden rounded-xl bg-[#1c1b1b] border border-[#3f4a3e]/60">
      <div className="flex items-center gap-2.5 border-b border-[#3f4a3e]/60 bg-[#39994B]/10 px-5 py-3">
        <span className="text-base">✨</span>
        <span className="text-xs font-bold uppercase tracking-wider text-[#7bdb85]">AI 한 줄 요약</span>
      </div>
      <div className="px-5 py-4">
        <p className="text-sm leading-relaxed text-[#e5e2e1]">{summary}</p>
        <p className="mt-2 text-[10px] text-[#becaba]/50 uppercase tracking-tighter">Analyzed by AI Assistant</p>
      </div>
    </div>
  );
}
