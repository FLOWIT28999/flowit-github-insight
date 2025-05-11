import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 보호된 라우트를 위한 미들웨어
 * 인증되지 않은 사용자의 접근을 제한하고 세션을 새로고침
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    // 세션 새로고침
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // 보호된 라우트 목록
    const protectedRoutes = ['/analyze', '/api-keys'];

    // 현재 경로가 보호된 라우트인지 확인
    const isProtectedRoute = protectedRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    );

    // 보호된 라우트에 대한 인증되지 않은 접근 처리
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL('/', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (error) {
    console.error('미들웨어 처리 중 오류:', error);
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * 미들웨어가 적용될 경로 패턴
     * - /analyze로 시작하는 모든 경로
     * - /api-keys로 시작하는 모든 경로
     * - /_next/static 파일은 제외
     * - /api/auth로 시작하는 경로는 제외
     */
    '/((?!_next/static|api/auth|_next/image|favicon.ico).*)',
  ],
}; 