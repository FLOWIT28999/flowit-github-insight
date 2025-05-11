'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { LogIn } from 'lucide-react';

/**
 * GitHub OAuth를 통한 로그인 버튼 컴포넌트
 * 클릭 시 GitHub 로그인 페이지로 리다이렉트
 */
export default function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * GitHub OAuth 로그인 처리 함수
   * 에러 발생 시 사용자에게 알림
   */
  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) {
        console.error('로그인 에러:', error.message);
        alert('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        setIsLoading(false);
        return;
      }

      // 여기서는 setLoading(false)를 호출하지 않습니다.
      // 사용자가 GitHub로 리다이렉트 되거나 새로운 페이지로 이동하기 때문입니다.
      
      // URL이 반환된 경우 해당 URL로 리다이렉트
      if (data && data.url) {
        window.location.href = data.url;
      } else {
        // URL이 없는 경우 로딩 상태 해제
        console.error('로그인 URL이 제공되지 않았습니다.');
        alert('로그인 프로세스를 시작할 수 없습니다. 잠시 후 다시 시도해주세요.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('로그인 처리 중 에러 발생:', error);
      alert('로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          로그인 중...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <LogIn className="w-5 h-5" />
          GitHub로 로그인
        </span>
      )}
    </button>
  );
} 