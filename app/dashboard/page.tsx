'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ChevronRight, Database, GitPullRequest, Star, Settings } from 'lucide-react';

/**
 * 대시보드 메인 페이지 컴포넌트
 * 주요 기능에 대한 빠른 액세스 카드와 사용자 프로필 정보를 제공
 */
export default function Dashboard() {
  const { user } = useAuth();

  // 이 부분은 레이아웃에서 이미 처리하고 있으므로 user는 항상 있다고 가정
  if (!user) return null;

  return (
    <>
      {/* 대시보드 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">안녕하세요, {user.user_metadata?.user_name || user.email}님!</h1>
        <p className="text-gray-400">GitHub 저장소 분석을 위한 대시보드입니다.</p>
      </div>
      
      {/* 빠른 액션 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 shadow-xl hover:border-red-500/30 transition-all hover:shadow-red-500/5">
          <Link href="/dashboard/api-keys" className="block h-full">
            <div className="bg-gradient-to-br from-red-600 to-red-800 w-12 h-12 rounded-lg flex items-center justify-center mb-5 shadow-lg shadow-red-500/10">
              <Database className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">API 키 관리</h3>
            <p className="text-gray-400 mb-4 text-sm">API 키를 생성하고 관리하여 다른 서비스와 연동하세요.</p>
            <div className="flex items-center text-red-500 mt-auto group">
              <span className="group-hover:mr-1 transition-all">키 관리하기</span>
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
        
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 shadow-xl hover:border-red-500/30 transition-all hover:shadow-red-500/5">
          <Link href="/dashboard/analyze" className="block h-full">
            <div className="bg-gradient-to-br from-red-600 to-red-800 w-12 h-12 rounded-lg flex items-center justify-center mb-5 shadow-lg shadow-red-500/10">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">저장소 분석</h3>
            <p className="text-gray-400 mb-4 text-sm">GitHub 저장소를 AI로 분석하여 인사이트를 얻으세요.</p>
            <div className="flex items-center text-red-500 mt-auto group">
              <span className="group-hover:mr-1 transition-all">지금 분석하기</span>
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
        
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 shadow-xl hover:border-red-500/30 transition-all hover:shadow-red-500/5">
          <Link href="/dashboard/history" className="block h-full">
            <div className="bg-gradient-to-br from-red-600 to-red-800 w-12 h-12 rounded-lg flex items-center justify-center mb-5 shadow-lg shadow-red-500/10">
              <GitPullRequest className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">분석 기록</h3>
            <p className="text-gray-400 mb-4 text-sm">이전에 분석한 저장소 결과를 확인하세요.</p>
            <div className="flex items-center text-red-500 mt-auto group">
              <span className="group-hover:mr-1 transition-all">기록 보기</span>
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
        
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 shadow-xl hover:border-red-500/30 transition-all hover:shadow-red-500/5">
          <Link href="/dashboard/settings" className="block h-full">
            <div className="bg-gradient-to-br from-red-600 to-red-800 w-12 h-12 rounded-lg flex items-center justify-center mb-5 shadow-lg shadow-red-500/10">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">설정</h3>
            <p className="text-gray-400 mb-4 text-sm">계정 설정 및 앱 환경설정을 관리하세요.</p>
            <div className="flex items-center text-red-500 mt-auto group">
              <span className="group-hover:mr-1 transition-all">설정 관리</span>
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
      
      {/* 사용자 프로필 */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 shadow-xl mb-8">
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
          &copy; 2025 flowit github insight. All rights reserved.
        </p>
      </footer>
    </>
  );
} 