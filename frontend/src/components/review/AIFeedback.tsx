interface AIFeedbackProps {
  feedback: string | null;
}

export default function AIFeedback({ feedback }: AIFeedbackProps) {
  if (!feedback) return null;

  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 shadow-soft">
      <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-blue-500">
        AI 한 줄 피드백
      </h3>
      <p className="text-sm leading-relaxed text-blue-800">{feedback}</p>
    </div>
  );
}
