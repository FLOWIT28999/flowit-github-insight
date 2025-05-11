'use client';

/**
 * 로딩 상태를 표시하는 컴포넌트
 * @param props.fullScreen - 전체 화면 로딩 여부
 */
export default function Loading({ fullScreen = false }: { fullScreen?: boolean }) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white/80 z-50'
    : 'flex items-center justify-center py-8';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-3 text-gray-600">로딩 중...</p>
      </div>
    </div>
  );
} 