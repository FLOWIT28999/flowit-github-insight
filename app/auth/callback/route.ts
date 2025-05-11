import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * GitHub OAuth 콜백 처리 라우트
 * 인증 코드를 처리하고 세션을 설정한 후 메인 페이지로 리다이렉트
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    
    // OAuth 코드로 세션 교환
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 메인 페이지로 리다이렉트
  return NextResponse.redirect(new URL('/', request.url));
} 