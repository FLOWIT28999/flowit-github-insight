import { createClient } from '@supabase/supabase-js';

/**
 * Supabase 클라이언트 초기화
 * 환경 변수에서 URL과 익명 키를 가져와 클라이언트 생성
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// URL 또는 키가 없는 경우 오류 기록
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '필수 환경 변수가 누락되었습니다. NEXT_PUBLIC_SUPABASE_URL 및 NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되었는지 확인하세요.'
  );
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  }
);
