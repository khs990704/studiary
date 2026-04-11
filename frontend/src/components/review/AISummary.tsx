interface AISummaryProps {
  summary: string | null;
}

export default function AISummary({ summary }: AISummaryProps) {
  if (!summary) return null;

  return (
    <section>
      <div className="bg-[#2a2a2a] rounded-2xl p-5 border-l-4 border-[#ffb1c1] shadow-lg shadow-[#ffb1c1]/5">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[#ffb1c1] text-lg">auto_awesome</span>
          <h2 className="text-xs font-body font-bold uppercase tracking-widest text-[#ffb1c1]">AI 한줄 요약</h2>
        </div>
        <p className="text-[#e5e2e1] font-body leading-relaxed text-sm sm:text-base">{summary}</p>
      </div>
    </section>
  );
}
