'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { LogIn, Github } from 'lucide-react';
import { signIn } from 'next-auth/react';

/**
 * OAuth 로그인 버튼 컴포넌트
 * GitHub 또는 Google을 통한 로그인 옵션 제공
 */
export default function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [authProvider, setAuthProvider] = useState<string | null>(null);

  /**
   * NextAuth를 통한 Google 로그인 처리 함수
   */
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setAuthProvider('google');
      console.log('Google 로그인 시작');
      
      await signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: true 
      });
      
      // 리다이렉션이 발생하므로 아래 코드는 실행되지 않음
    } catch (error) {
      console.error('Google 로그인 에러:', error);
      alert('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setIsLoading(false);
      setAuthProvider(null);
    }
  };

  /**
   * Supabase를 통한 GitHub 로그인 처리 함수
   */
  const handleGithubLogin = async () => {
    try {
      setIsLoading(true);
      setAuthProvider('github');
      console.log('GitHub 로그인 시작');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) {
        console.error('GitHub 로그인 에러:', error.message);
        alert('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        setIsLoading(false);
        setAuthProvider(null);
        return;
      }
      
      // URL이 반환된 경우 해당 URL로 리다이렉트
      if (data && data.url) {
        console.log('GitHub 리다이렉트 URL:', data.url);
        window.location.href = data.url;
      } else {
        console.error('로그인 URL이 제공되지 않았습니다.');
        alert('로그인 프로세스를 시작할 수 없습니다. 잠시 후 다시 시도해주세요.');
        setIsLoading(false);
        setAuthProvider(null);
      }
    } catch (error) {
      console.error('GitHub 로그인 처리 중 에러 발생:', error);
      alert('로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setIsLoading(false);
      setAuthProvider(null);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto sm:mx-0">
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="px-6 py-2.5 bg-white hover:bg-gray-100 text-gray-800 rounded-md font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
      >
        {isLoading && authProvider === 'google' ? (
          <span className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            Google 로그인 중...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 로그인
          </span>
        )}
      </button>
      
      <button
        onClick={handleGithubLogin}
        disabled={isLoading}
        className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-md font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading && authProvider === 'github' ? (
          <span className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            GitHub 로그인 중...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            GitHub로 로그인
          </span>
        )}
      </button>
    </div>
  );
} 