export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8" role="status">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
      <span className="sr-only">로딩 중...</span>
    </div>
  );
}
