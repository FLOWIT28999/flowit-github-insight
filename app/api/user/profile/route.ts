import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { supabase } from '@/lib/supabaseClient';

/**
 * 사용자 프로필 정보 API (GET)
 * 현재 로그인한 사용자의 프로필 정보와 API 키 사용 현황을 반환
 */
export async function GET() {
  try {
    // 현재 세션 확인
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 이메일로 사용자 정보 조회
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email, image, created_at')
      .eq('email', session.user.email)
      .single();

    if (userError) {
      throw userError;
    }

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 사용자의 API 키 사용 현황 조회
    const { data: apiKeys, error: apiKeysError } = await supabase
      .from('api_keys')
      .select('id, name, created_at, usage, limit')
      .eq('user_id', user.id);

    if (apiKeysError) {
      throw apiKeysError;
    }

    // API 키 사용량 통계 계산
    const totalUsage = apiKeys?.reduce((sum, key) => sum + key.usage, 0) || 0;
    const totalLimit = apiKeys?.reduce((sum, key) => sum + key.limit, 0) || 0;
    const apiKeyCount = apiKeys?.length || 0;

    // 프로필 정보와 함께 API 키 사용 현황 반환
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        created_at: user.created_at
      },
      apiKeys: {
        count: apiKeyCount,
        totalUsage,
        totalLimit
      }
    });
  } catch (error) {
    console.error('사용자 프로필 조회 오류:', error);
    return NextResponse.json(
      { error: '사용자 프로필을 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 