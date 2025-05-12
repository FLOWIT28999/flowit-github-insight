'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 저장소 분석 페이지 리디렉션 컴포넌트
 * 대시보드 구조로 통일하기 위해 /dashboard/analyze로 자동 리디렉션
 */
export default function AnalyzeRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/analyze');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
      <p className="text-white text-lg">리디렉션 중...</p>
    </div>
  );
} 