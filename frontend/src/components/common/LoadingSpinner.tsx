export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16" role="status">
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 animate-spin rounded-full border-[2px] border-[#3f4a3e] border-t-[#7bdb85]" />
      </div>
      <span className="sr-only">로딩 중...</span>
    </div>
  );
}
