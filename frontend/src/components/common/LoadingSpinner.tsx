export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12" role="status">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-green-200 border-t-green-600" />
      </div>
      <span className="sr-only">로딩 중...</span>
    </div>
  );
}
