import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { supabase } from '@/lib/supabaseClient';

/**
 * NextAuth 설정 옵션
 * 인증 프로바이더, 콜백 함수, 세션 관리 등 설정
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/',
    newUser: '/dashboard',
  },
  callbacks: {
    /**
     * JWT 콜백: 토큰에 사용자 정보 추가
     */
    async jwt({ token, user, account }) {
      // 사용자 정보가 있으면 JWT 토큰에 추가
      if (user) {
        token.user_id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      
      // 사용자 ID가 없는 경우 Supabase에서 가져오기
      if (!token.user_id && token.email) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('email', token.email)
            .single();
            
          if (data && !error) {
            token.user_id = data.id;
            console.log('Supabase 사용자 ID를 JWT에 추가:', data.id);
          }
        } catch (err) {
          console.error('JWT 콜백 처리 중 오류:', err);
        }
      }
      
      return token;
    },
    
    /**
     * 사용자 로그인 시 사용자 정보 처리
     * Supabase users 테이블에 사용자 정보가 없으면 저장
     */
    async signIn({ user }) {
      try {
        console.log('NextAuth signIn 콜백 실행:', user.email);
        
        // 사용자가 이미 Supabase에 있는지 확인
        const { data: existingUser, error: selectError } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .maybeSingle();

        if (selectError) {
          console.error('사용자 조회 오류:', selectError);
          throw selectError;
        }

        // 사용자가 없으면 새로 생성
        if (!existingUser) {
          console.log('새 사용자 생성:', user.email);
          
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([
              {
                email: user.email,
                name: user.name,
                image: user.image,
              },
            ])
            .select()
            .single();

          if (insertError) {
            console.error('사용자 생성 오류:', insertError);
            throw insertError;
          }
          
          console.log('사용자 생성 완료:', newUser?.id);
          user.id = newUser?.id;
        } else {
          console.log('기존 사용자 확인:', existingUser.id);
          user.id = existingUser.id;
        }

        return true;
      } catch (error) {
        console.error('Error during sign in:', error);
        return false;
      }
    },
    
    /**
     * 세션에 추가 정보를 포함하도록 설정
     */
    async session({ session, token }) {
      // JWT 토큰 정보를 세션에 추가
      if (token.user_id) {
        session.user.id = token.user_id as string;
      } else if (session.user?.email) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('email', session.user.email)
            .single();
            
          if (data && !error) {
            session.user.id = data.id;
            console.log('세션에 사용자 ID 추가:', data.id);
          }
        } catch (err) {
          console.error('세션 처리 중 오류:', err);
        }
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};

/**
 * Next.js App Router에서 사용할 NextAuth 핸들러
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 