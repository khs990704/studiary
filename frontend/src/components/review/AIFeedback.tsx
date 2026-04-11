interface AIFeedbackProps {
  feedback: string | null;
}

export default function AIFeedback({ feedback }: AIFeedbackProps) {
  if (!feedback) return null;

  return (
    <section>
      <div className="bg-[#2a2a2a] rounded-2xl p-5 border-l-4 border-[#a4c9ff] shadow-lg shadow-[#a4c9ff]/5">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[#a4c9ff] text-lg">psychology</span>
          <h2 className="text-xs font-body font-bold uppercase tracking-widest text-[#a4c9ff]">AI 한줄 피드백</h2>
        </div>
        <p className="text-[#e5e2e1] font-body leading-relaxed text-sm sm:text-base">{feedback}</p>
      </div>
    </section>
  );
}
