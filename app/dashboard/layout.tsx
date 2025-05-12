'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Github, LogOut, ChevronRight, BarChart2, Database, GitPullRequest, Search, Star, Settings, Menu, X } from 'lucide-react';

/**
 * 대시보드 레이아웃 컴포넌트
 * 모든 대시보드 페이지에 적용되는 공통 레이아웃으로 사이드바와 기본 구조를 제공
 */
export default function DashboardLayout({ children }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // 로컬 스토리지에서 사이드바 상태 불러오기
  useEffect(() => {
    const sidebarState = localStorage.getItem('sidebarOpen');
    if (sidebarState !== null) {
      setIsSidebarOpen(sidebarState === 'true');
    }
  }, []);
  
  // 사이드바 상태 변경 시 로컬 스토리지에 저장
  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem('sidebarOpen', newState.toString());
  };

  // 로그인하지 않은 사용자를 홈페이지로 리다이렉트
  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('대시보드: 인증되지 않은 사용자, 리다이렉트 중...');
        router.push('/');
      } else {
        console.log('대시보드: 인증된 사용자', user.email);
      }
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

  // 활성화된 메뉴 확인 함수
  const isActive = (path) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* 사이드바 오버레이 (모바일) */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/70 z-30" 
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* 사이드바 */}
      <div 
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'
        } fixed md:sticky top-0 h-screen z-40 bg-black/50 backdrop-blur-md border-r border-gray-800 p-6 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-full md:w-20'
        }`}
      >
        <div className="flex items-center gap-2 mb-8">
          <Github className="h-6 w-6 text-red-500" />
          {isSidebarOpen && (
            <>
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-red-500">
                flowit
              </span>
              <span className="text-white font-bold">github</span>
              <span className="text-red-500 font-bold">insight</span>
            </>
          )}
        </div>
        
        <nav className="space-y-2">
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-3 p-3 rounded-lg ${
              isActive('/dashboard') && !isActive('/dashboard/api-keys') && !isActive('/dashboard/analyze') && !isActive('/dashboard/history') && !isActive('/dashboard/settings')
              ? 'bg-gray-800/50 text-white' 
              : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
            } transition-colors`}
          >
            <BarChart2 className={`w-5 h-5 ${isActive('/dashboard') && !isActive('/dashboard/api-keys') && !isActive('/dashboard/analyze') && !isActive('/dashboard/history') && !isActive('/dashboard/settings') ? 'text-red-500' : ''}`} />
            {isSidebarOpen && <span>대시보드</span>}
          </Link>
          
          <Link 
            href="/dashboard/api-keys" 
            className={`flex items-center gap-3 p-3 rounded-lg ${
              isActive('/dashboard/api-keys') 
              ? 'bg-gray-800/50 text-white' 
              : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
            } transition-colors`}
          >
            <Database className={`w-5 h-5 ${isActive('/dashboard/api-keys') ? 'text-red-500' : ''}`} />
            {isSidebarOpen && <span>API 키 관리</span>}
          </Link>
          
          <Link 
            href="/dashboard/analyze" 
            className={`flex items-center gap-3 p-3 rounded-lg ${
              isActive('/dashboard/analyze') 
              ? 'bg-gray-800/50 text-white' 
              : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
            } transition-colors`}
          >
            <Search className={`w-5 h-5 ${isActive('/dashboard/analyze') ? 'text-red-500' : ''}`} />
            {isSidebarOpen && <span>저장소 분석</span>}
          </Link>
          
          <Link 
            href="/dashboard/history" 
            className={`flex items-center gap-3 p-3 rounded-lg ${
              isActive('/dashboard/history') 
              ? 'bg-gray-800/50 text-white' 
              : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
            } transition-colors`}
          >
            <GitPullRequest className={`w-5 h-5 ${isActive('/dashboard/history') ? 'text-red-500' : ''}`} />
            {isSidebarOpen && <span>분석 기록</span>}
          </Link>

          <Link 
            href="/dashboard/settings" 
            className={`flex items-center gap-3 p-3 rounded-lg ${
              isActive('/dashboard/settings') 
              ? 'bg-gray-800/50 text-white' 
              : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
            } transition-colors`}
          >
            <Settings className={`w-5 h-5 ${isActive('/dashboard/settings') ? 'text-red-500' : ''}`} />
            {isSidebarOpen && <span>설정</span>}
          </Link>
        </nav>
        
        <div className="absolute bottom-8 left-0 right-0 px-6">
          <button 
            onClick={signOut}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-red-900/30 hover:text-white transition-colors justify-center md:justify-start"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>로그아웃</span>}
          </button>
        </div>
      </div>
      
      {/* 메인 콘텐츠 */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-0' : 'md:ml-0'}`}>
        {/* 모바일 헤더 */}
        <div className="sticky top-0 z-30 bg-black/50 backdrop-blur-sm p-4 border-b border-gray-800 flex justify-between items-center md:hidden">
          <div className="flex items-center gap-2">
            <Github className="h-6 w-6 text-red-500" />
            <span className="font-bold text-xl text-white">
              flowit <span className="text-red-500">insight</span>
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full bg-gray-800/50 text-gray-300 hover:bg-red-900/30 hover:text-white transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* 데스크톱 헤더 - 사이드바 토글 */}
        <div className="hidden md:flex sticky top-0 z-30 bg-black/50 backdrop-blur-sm p-4 border-b border-gray-800 items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full bg-gray-800/50 text-gray-300 hover:bg-red-900/30 hover:text-white transition-colors mr-4"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1"></div>
          <div className="flex items-center gap-2">
            {user.user_metadata?.avatar_url ? (
              <Image 
                src={user.user_metadata.avatar_url} 
                alt="Profile" 
                width={32} 
                height={32} 
                className="rounded-full border border-red-500"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold">
                {(user.email?.charAt(0) || 'U').toUpperCase()}
              </div>
            )}
            <span className="text-white text-sm font-medium">{user.user_metadata?.user_name || user.email}</span>
          </div>
        </div>

        {/* 실제 페이지 콘텐츠 */}
        <div className="p-6 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
} 