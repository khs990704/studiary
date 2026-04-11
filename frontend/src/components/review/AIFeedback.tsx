interface AIFeedbackProps {
  feedback: string | null;
}

export default function AIFeedback({ feedback }: AIFeedbackProps) {
  if (!feedback) return null;

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <h3 className="mb-1 text-sm font-semibold text-blue-800">
        AI 한 줄 피드백
      </h3>
      <p className="text-sm text-blue-700">{feedback}</p>
    </div>
  );
}
