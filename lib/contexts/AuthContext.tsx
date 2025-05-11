'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';

/**
 * 인증 컨텍스트의 타입 정의
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

/**
 * 인증 컨텍스트 생성
 */
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

/**
 * 인증 컨텍스트 프로바이더 컴포넌트
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    console.log('AuthContext: NextAuth 세션 상태:', sessionStatus, session?.user?.email);
    
    // 현재 세션 확인
    const checkUser = async () => {
      try {
        // 먼저 Supabase 세션 확인
        const { data: { session: supabaseSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Supabase 세션 확인 중 에러:', error);
        }
        
        // Supabase 세션 또는 NextAuth 세션이 있으면 사용자 인증됨
        if (supabaseSession?.user) {
          console.log('AuthContext: Supabase 세션으로 사용자 인증됨', supabaseSession.user.email);
          setUser(supabaseSession.user);
          setLoading(false);
          return;
        }
        
        // NextAuth 세션이 있는 경우 가상 Supabase 사용자 생성
        if (session?.user) {
          console.log('AuthContext: NextAuth 세션으로 사용자 인증됨', session.user.email);
          // 실제 Supabase 사용자가 아닌 임시 객체를 생성하여 인증된 것으로 취급
          const nextAuthUser = {
            id: session.user.id || 'nextauth-user',
            email: session.user.email || '',
            user_metadata: {
              name: session.user.name,
              avatar_url: session.user.image,
            },
          } as unknown as User;
          
          setUser(nextAuthUser);
        } else {
          console.log('AuthContext: 인증된 세션 없음');
          setUser(null);
        }
      } catch (error) {
        console.error('세션 확인 중 에러:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (sessionStatus !== 'loading') {
      checkUser();
    }

    // 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        console.log('AuthContext: Supabase 인증 상태 변경', session.user.email);
        setUser(session.user);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [session, sessionStatus]);

  /**
   * 로그아웃 처리 함수
   */
  const signOut = async () => {
    try {
      console.log('AuthContext: 로그아웃 시도');
      
      // Supabase 로그아웃
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase 로그아웃 에러:', error);
      }
      
      // NextAuth 로그아웃 직접 호출
      await nextAuthSignOut({ callbackUrl: '/' });
      
      setUser(null);
    } catch (error) {
      console.error('로그아웃 중 에러:', error);
      alert('로그아웃 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 인증 컨텍스트 사용을 위한 커스텀 훅
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 