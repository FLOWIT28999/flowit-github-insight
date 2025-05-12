'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, Code, BookOpen } from 'lucide-react';
import Notification from '@/app/components/Notification';
import RepositoryVisualizer from '@/app/components/RepositoryVisualizer';

// 알림 타입 정의
interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

/**
 * 저장소 분석 페이지 컴포넌트
 * 사용자가 GitHub 저장소를 URL로 입력하고 API 키를 사용하여 분석할 수 있는 기능 제공
 */
export default function AnalyzePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notification, setNotification] = useState<NotificationProps | null>(null);
  const [recentRepos, setRecentRepos] = useState([
    { 
      name: 'facebook/react', 
      avatar: 'https://avatars.githubusercontent.com/u/69631?s=200&v=4', 
      stars: 218000, 
      lastAnalyzed: '2시간 전',
      description: 'A JavaScript library for building user interfaces',
      language: 'JavaScript' 
    },
    { 
      name: 'vercel/next.js', 
      avatar: 'https://avatars.githubusercontent.com/u/14985020?s=200&v=4', 
      stars: 115000, 
      lastAnalyzed: '어제',
      description: 'The React Framework for the Web',
      language: 'TypeScript'
    },
    { 
      name: 'supabase/supabase', 
      avatar: 'https://avatars.githubusercontent.com/u/54469796?s=200&v=4', 
      stars: 67000, 
      lastAnalyzed: '3일 전',
      description: 'The open source Firebase alternative',
      language: 'TypeScript'
    },
  ]);
  
  // 페이지 로드 시 분석 기록 데이터 가져오기
  useEffect(() => {
    if (user) {
      fetchRecentRepositories();
    }
  }, [user]);

  /**
   * 최근 분석한 저장소 목록을 가져오는 함수
   */
  const fetchRecentRepositories = async () => {
    try {
      const response = await fetch('/api/history');
      if (!response.ok) {
        throw new Error('분석 기록을 가져오는데 실패했습니다');
      }
      
      const data = await response.json();
      // 최대 6개의 최근 저장소만 표시
      setRecentRepos(data.slice(0, 6).map(item => ({
        name: `${item.repoOwner}/${item.repoName}`,
        avatar: item.avatarUrl,
        stars: item.stars || 0,
        lastAnalyzed: getRelativeTime(item.createdAt),
        description: item.description || '설명 없음',
        language: item.language || 'Unknown'
      })));
    } catch (error) {
      console.error('최근 저장소 로딩 오류:', error);
      // 오류 시 기존 데이터 유지
    }
  };

  /**
   * 상대적 시간 표시 함수
   */
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '오늘';
    } else if (diffDays === 1) {
      return '어제';
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)}주 전`;
    } else {
      return `${Math.floor(diffDays / 30)}개월 전`;
    }
  };

  /**
   * 알림 메시지를 표시하는 함수
   */
  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({ message, type });
    // 3초 후 알림 닫기
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  /**
   * 저장소 URL 유효성 검사 함수
   */
  const isValidRepoUrl = (url: string) => {
    // GitHub URL 형식: https://github.com/owner/repo
    const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+\/?$/;
    return githubRegex.test(url);
  };
  
  /**
   * API 키 유효성 검사 함수
   */
  const isValidApiKey = (key: string) => {
    // API 키 형식: flowit-xxxxxxxxxxxx (16자 이상)
    return key.startsWith('flowit-') && key.length >= 16;
  };

  /**
   * 저장소 분석 시작 함수
   */
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!repoUrl.trim()) {
      showNotification('저장소 URL을 입력해주세요.', 'error');
      return;
    }
    
    if (!isValidRepoUrl(repoUrl)) {
      showNotification('유효한 GitHub 저장소 URL이 아닙니다.', 'error');
      return;
    }
    
    // API 키 유효성 검사 (필수)
    if (!apiKey.trim()) {
      showNotification('API 키를 입력해주세요.', 'error');
      return;
    }
    
    if (!isValidApiKey(apiKey)) {
      showNotification('유효한 API 키가 아닙니다. API 키는 "flowit-"로 시작해야 합니다.', 'error');
      return;
    }
    
    // API 키 자동 저장 기능 제거
    // localStorage.setItem('flowit_api_key', apiKey);
    
    try {
      setIsAnalyzing(true);
      showNotification('저장소 분석을 시작합니다...', 'info');
      
      // URL에서 owner/repo 형식 추출
      const urlParts = repoUrl.split('github.com/')[1].split('/');
      const owner = urlParts[0];
      const repo = urlParts[1].replace(/\/$/, '');
      const ownerRepo = `${owner}/${repo}`;
      
      // 서버에 분석 요청
      const response = await fetch('/api/analyze-repository', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({ url: repoUrl }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '저장소 분석 중 오류가 발생했습니다.');
      }
      
      // 최근 저장소 목록 갱신
      await fetchRecentRepositories();
      
      // 분석 완료 후 동작: 확인 대화상자 대신 토스트 알림 사용
      showNotification(
        '분석이 완료되었습니다! 분석 결과를 확인하시겠습니까? 결과 페이지로 이동합니다.',
        'success'
      );
      
      // 3초 후 자동으로 결과 페이지로 이동
      setTimeout(() => {
        router.push(`/dashboard/results/${owner}/${repo}`);
      }, 3000);
    } catch (error: any) {
      console.error('분석 오류:', error);
      showNotification(error.message || '저장소 분석 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * 이전에 분석한 저장소로 이동하는 함수
   */
  const navigateToRepository = (repoName: string) => {
    const [owner, repo] = repoName.split('/');
    router.push(`/dashboard/results/${owner}/${repo}`);
  };

  return (
    <>
      {/* 알림 표시 */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">저장소 분석</h1>
        <p className="text-gray-400">GitHub 저장소를 분석하여 인사이트를 얻어보세요.</p>
      </div>
      
      {/* 분석 양식 */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 mb-8">
        <form onSubmit={handleAnalyze}>
          <div className="mb-6">
            <label htmlFor="repoUrl" className="block text-white font-medium mb-2">
              GitHub 저장소 URL
            </label>
            <input
              type="text"
              id="repoUrl"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="w-full p-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={isAnalyzing}
            />
            <p className="text-gray-500 text-xs mt-1">예시: https://github.com/facebook/react</p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="apiKey" className="block text-white font-medium mb-2">
              API 키
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="flowit-xxxx-xxxx-xxxx"
              className="w-full p-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={isAnalyzing}
            />
            <p className="text-gray-500 text-xs mt-1">
              <Link href="/dashboard/api-keys" className="text-red-400 hover:underline">API 키 관리 페이지</Link>에서 키를 생성하세요.
            </p>
          </div>
          
          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full md:w-auto bg-gradient-to-r from-red-700 to-red-900 text-white p-3 rounded-lg hover:from-red-600 hover:to-red-800 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <Code className="w-5 h-5" />
                저장소 분석하기
              </>
            )}
          </button>
        </form>
      </div>
      
      {/* 3D 시각화 */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-red-500" />
          저장소 구조 시각화
        </h2>
        <div className="h-[400px] w-full bg-black/50 rounded-lg overflow-hidden">
          <RepositoryVisualizer />
        </div>
      </div>
      
      {/* 최근 분석한 저장소 */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">최근 분석한 저장소</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentRepos.map((repo, idx) => (
            <div 
              key={idx} 
              className="bg-black/50 rounded-lg p-4 border border-gray-800 hover:border-red-500/30 transition-colors cursor-pointer"
              onClick={() => navigateToRepository(repo.name)}
            >
              <div className="flex items-center gap-3 mb-3">
                <Image 
                  src={repo.avatar}
                  alt={repo.name}
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <div>
                  <h3 className="text-white font-medium">{repo.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 text-xs">★ {repo.stars.toLocaleString()}</span>
                    <span className="text-gray-500 text-xs">· {repo.lastAnalyzed}</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-2 line-clamp-2">{repo.description}</p>
              <div className="flex items-center gap-1 text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full w-fit">
                <Code className="w-3 h-3" />
                <span>{repo.language}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
} 