import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * 보호된 라우트를 위한 미들웨어
 * 인증되지 않은 사용자의 접근을 제한
 */
export async function middleware(req: NextRequest) {
  try {
    console.log('미들웨어 실행:', req.nextUrl.pathname);
    
    // NextAuth 세션 토큰만 확인 (Supabase는 클라이언트에서 처리)
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: 'next-auth.session-token'
    });
    
    const isAuthenticated = !!token;
    console.log('인증 상태:', isAuthenticated ? '인증됨' : '인증되지 않음', req.nextUrl.pathname);
    
    if (token) {
      console.log('인증된 사용자:', token.email);
    }

    // 보호된 라우트 정의
    const protectedRoutes = ['/dashboard'];

    // 현재 경로가 보호된 라우트인지 확인
    const isProtectedRoute = protectedRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    );

    // 보호된 라우트에 대한 인증되지 않은 접근 처리
    if (isProtectedRoute && !isAuthenticated) {
      console.log('인증되지 않은 사용자의 보호된 라우트 접근:', req.nextUrl.pathname);
      
      const redirectUrl = new URL('/', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('미들웨어 처리 중 오류:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * 미들웨어가 적용될 경로 패턴
     */
    '/dashboard/:path*',
  ],
}; 