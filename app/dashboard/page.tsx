'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Github, LogOut, ChevronRight, BarChart2, Database, GitPullRequest, Search, Star, Settings } from 'lucide-react';

/**
 * 대시보드 페이지 컴포넌트
 * 인증된 사용자만 접근 가능하며, 저장소 분석 및 API 키 관리 기능에 접근할 수 있는 중앙 허브
 */
export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  // 로그인하지 않은 사용자를 홈페이지로 리다이렉트
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // 로딩 중이거나 사용자가 로그인하지 않은 경우 로딩 표시
  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
        <p className="text-white text-lg">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* 사이드바 */}
      <div className="w-64 bg-black/50 backdrop-blur-md border-r border-gray-800 p-6 hidden md:block">
        <div className="flex items-center gap-2 mb-8">
          <Github className="h-6 w-6 text-red-500" />
          <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-red-500">
            flowit
          </span>
          <span className="text-white font-bold">github</span>
          <span className="text-red-500 font-bold">insight</span>
        </div>
        
        <nav className="space-y-2">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 text-white hover:bg-gray-700/50 transition-colors"
          >
            <BarChart2 className="w-5 h-5 text-red-500" />
            <span>대시보드</span>
          </Link>
          
          <Link 
            href="/analyze" 
            className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-gray-800/50 transition-colors"
          >
            <Search className="w-5 h-5" />
            <span>저장소 분석</span>
          </Link>
          
          <Link 
            href="/api-keys" 
            className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-gray-800/50 transition-colors"
          >
            <Database className="w-5 h-5" />
            <span>API 키 관리</span>
          </Link>
          
          <Link 
            href="/history" 
            className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-gray-800/50 transition-colors"
          >
            <GitPullRequest className="w-5 h-5" />
            <span>분석 기록</span>
          </Link>

          <Link 
            href="/settings" 
            className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-gray-800/50 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>설정</span>
          </Link>
        </nav>
        
        <div className="absolute bottom-8 left-0 right-0 px-6">
          <button 
            onClick={signOut}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-red-900/30 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>
      
      {/* 메인 콘텐츠 */}
      <div className="flex-1 p-6 overflow-auto">
        {/* 모바일 헤더 */}
        <div className="flex justify-between items-center mb-6 md:hidden">
          <div className="flex items-center gap-2">
            <Github className="h-6 w-6 text-red-500" />
            <span className="font-bold text-xl text-white">
              flowit <span className="text-red-500">insight</span>
            </span>
          </div>
          <button
            onClick={signOut}
            className="p-2 rounded-full bg-gray-800/50 text-gray-300 hover:bg-red-900/30 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        
        {/* 대시보드 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">안녕하세요, {user.user_metadata?.user_name || user.email}님!</h1>
          <p className="text-gray-400">GitHub 저장소 분석을 위한 대시보드입니다.</p>
        </div>
        
        {/* 빠른 액션 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 shadow-xl hover:border-red-500/30 transition-all">
            <Link href="/analyze" className="block h-full">
              <div className="bg-gradient-to-br from-red-500 to-red-700 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/20">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">저장소 분석</h3>
              <p className="text-gray-400 mb-4">GitHub 저장소를 AI로 분석하여 인사이트를 얻으세요.</p>
              <div className="flex items-center text-red-500 mt-auto">
                <span>지금 분석하기</span>
                <ChevronRight className="w-5 h-5 ml-1" />
              </div>
            </Link>
          </div>
          
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 shadow-xl hover:border-red-500/30 transition-all">
            <Link href="/api-keys" className="block h-full">
              <div className="bg-gradient-to-br from-red-500 to-red-700 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/20">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">API 키 관리</h3>
              <p className="text-gray-400 mb-4">API 키를 생성하고 관리하여 다른 서비스와 연동하세요.</p>
              <div className="flex items-center text-red-500 mt-auto">
                <span>키 관리하기</span>
                <ChevronRight className="w-5 h-5 ml-1" />
              </div>
            </Link>
          </div>
          
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 shadow-xl hover:border-red-500/30 transition-all">
            <Link href="/history" className="block h-full">
              <div className="bg-gradient-to-br from-red-500 to-red-700 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/20">
                <GitPullRequest className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">분석 기록</h3>
              <p className="text-gray-400 mb-4">이전에 분석한 저장소 결과를 확인하세요.</p>
              <div className="flex items-center text-red-500 mt-auto">
                <span>기록 보기</span>
                <ChevronRight className="w-5 h-5 ml-1" />
              </div>
            </Link>
          </div>
        </div>
        
        {/* 사용자 프로필 */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 shadow-xl mb-8">
          <h2 className="text-xl font-bold mb-4 text-white">내 프로필</h2>
          <div className="flex items-center gap-4">
            {user.user_metadata?.avatar_url ? (
              <Image 
                src={user.user_metadata.avatar_url} 
                alt="Profile" 
                width={64} 
                height={64} 
                className="rounded-full border-2 border-red-500"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold">
                {(user.email?.charAt(0) || 'U').toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-white font-bold">{user.user_metadata?.user_name || '사용자'}</h3>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>
        
        {/* 푸터 */}
        <footer className="mt-auto pt-6 border-t border-gray-800">
          <p className="text-gray-500 text-sm">
            &copy; 2024 flowit github insight. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
} 