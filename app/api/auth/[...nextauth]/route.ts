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
  callbacks: {
    /**
     * 사용자 로그인 시 사용자 정보 처리
     * Supabase users 테이블에 사용자 정보가 없으면 저장
     */
    async signIn({ user }) {
      try {
        // 사용자가 이미 Supabase에 있는지 확인
        const { data: existingUser, error: selectError } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .maybeSingle();

        if (selectError) throw selectError;

        // 사용자가 없으면 새로 생성
        if (!existingUser) {
          const { error: insertError } = await supabase
            .from('users')
            .insert([
              {
                email: user.email,
                name: user.name,
                image: user.image,
              },
            ]);

          if (insertError) throw insertError;
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
    async session({ session }) {
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

/**
 * Next.js App Router에서 사용할 NextAuth 핸들러
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 