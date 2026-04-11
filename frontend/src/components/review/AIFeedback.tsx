interface AIFeedbackProps {
  feedback: string | null;
}

export default function AIFeedback({ feedback }: AIFeedbackProps) {
  if (!feedback) return null;

  return (
    <div className="overflow-hidden rounded-xl bg-[#1c1b1b] border border-[#3f4a3e]/60">
      <div className="flex items-center gap-2.5 border-b border-[#3f4a3e]/60 bg-[#0164b4]/10 px-5 py-3">
        <span className="text-base">💡</span>
        <span className="text-xs font-bold uppercase tracking-wider text-[#a4c9ff]">AI 피드백</span>
      </div>
      <div className="px-5 py-4">
        <p className="text-sm leading-relaxed text-[#e5e2e1]">{feedback}</p>
        <p className="mt-2 text-[10px] text-[#becaba]/50 uppercase tracking-tighter">Analyzed by AI Assistant</p>
      </div>
    </div>
  );
}
