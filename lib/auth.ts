import { getServerSession } from "next-auth/next";
import { supabase } from './supabaseClient';

/**
 * 현재 세션의 사용자 정보를 가져오는 함수
 * NextAuth.js 세션에서 이메일을 확인하고 Supabase users 테이블에서 해당 사용자 ID를 조회
 * @returns {Promise<{id: string} | null>} 사용자 정보 객체 또는 인증되지 않은 경우 null
 */
export async function getSessionUser() {
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    return null;
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', session.user.email)
    .single();

  if (error || !user) {
    console.error('Error fetching user:', error);
    return null;
  }

  return user;
} 