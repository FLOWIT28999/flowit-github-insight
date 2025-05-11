import { getServerSession } from "next-auth/next";
import { supabase } from './supabaseClient';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

/**
 * 현재 세션의 사용자 정보를 가져오는 함수
 * NextAuth.js 세션에서 이메일을 확인하고 Supabase users 테이블에서 해당 사용자 ID를 조회
 * @returns {Promise<{id: string} | null>} 사용자 정보 객체 또는 인증되지 않은 경우 null
 */
export async function getSessionUser() {
  try {
    // 1. NextAuth 세션 확인
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      console.error('getSessionUser: NextAuth 세션이 없습니다:', session);
      
      // 쿠키 정보 디버깅용 출력
      try {
        const allCookies = cookies().getAll();
        console.log('쿠키 목록:', allCookies.map(c => c.name));
      } catch (e) {
        console.error('쿠키 정보 읽기 오류:', e);
      }
      
      return null;
    }

    // 서버에서 실행 중인지 확인 (에러 방지)
    if (typeof window !== 'undefined') {
      console.warn('getSessionUser는 서버 컴포넌트에서만 호출해야 합니다.');
    }
    
    console.log('getSessionUser: 인증된 이메일:', session.user.email);

    // 서비스 롤을 사용하는 Supabase 클라이언트 생성
    const supabaseServer = createRouteHandlerClient({ cookies });

    // 2. 이메일로 사용자 조회 (서비스 롤 사용)
    const { data: user, error } = await supabaseServer
      .from('users')
      .select('id, email, name, image')
      .eq('email', session.user.email)
      .single();

    if (error) {
      console.error('getSessionUser: 사용자 정보 조회 오류:', error);
      
      // 3. 사용자가 없는 경우 새로 생성 시도 (서비스 롤 사용)
      if (error.code === 'PGRST116') {
        console.log('getSessionUser: 새 사용자를 생성합니다:', session.user.email);
        
        const { data: newUser, error: insertError } = await supabaseServer
          .from('users')
          .insert([
            { 
              email: session.user.email,
              name: session.user.name || session.user.email,
              image: session.user.image || null
            }
          ])
          .select()
          .single();
        
        if (insertError) {
          console.error('getSessionUser: 새 사용자 생성 오류:', insertError);
          return null;
        }
        
        console.log('getSessionUser: 새 사용자가 생성되었습니다:', newUser);
        return newUser;
      }
      
      return null;
    }

    console.log('getSessionUser: 사용자 정보 조회 성공:', user);
    return user;
  } catch (error) {
    console.error('getSessionUser: 세션 사용자 조회 중 오류 발생:', error);
    return null;
  }
} 