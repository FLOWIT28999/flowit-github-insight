import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSessionUser } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * API 키 목록 조회 (GET)
 * 현재 인증된 사용자의 모든 API 키 목록을 반환
 */
export async function GET(req: NextRequest) {
  try {
    console.log('GET /api/api-keys, 요청 처리 중...');
    
    // Supabase 클라이언트 생성 (서버 라우트 핸들러용)
    const supabaseServer = createRouteHandlerClient({ cookies });
    
    // 현재 세션 확인
    const { data: { session }, error: sessionError } = await supabaseServer.auth.getSession();
    
    if (sessionError) {
      console.error('Supabase 세션 확인 오류:', sessionError);
    }
    
    let userId = null;
    
    // Supabase 세션이 있으면 사용
    if (session?.user?.id) {
      userId = session.user.id;
      console.log('Supabase 세션에서 사용자 ID 확인:', userId);
    } else {
      // NextAuth 세션 확인 시도
      const user = await getSessionUser();
      if (user?.id) {
        userId = user.id;
        console.log('NextAuth 세션에서 사용자 ID 확인:', userId);
      }
    }
    
    // 인증 디버깅
    console.log('인증 상태:', userId ? '인증됨' : '인증되지 않음');
    
    if (!userId) {
      console.error('API 키 조회 실패: 사용자 인증 없음');
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    console.log('인증된 사용자:', userId);

    // 사용자의 API 키 목록 조회 - RLS가 적용된 쿼리 (서비스 롤 사용)
    const { data: apiKeys, error } = await supabaseServer
      .from('api_keys')
      .select('id, name, value, created_at, used, limit')
      .eq('user_id', userId);

    if (error) {
      console.error('API 키 조회 중 데이터베이스 오류:', error);
      return NextResponse.json(
        { error: 'API 키를 조회하는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // used 필드를 usage로 변환하여 클라이언트 호환성 유지
    const formattedKeys = apiKeys?.map(key => ({
      ...key,
      usage: key.used,  // used를 usage로 매핑
    })) || [];

    console.log(`${formattedKeys.length || 0}개의 API 키를 찾았습니다.`);
    return NextResponse.json(formattedKeys);
  } catch (error) {
    console.error('API 키 조회 오류:', error);
    return NextResponse.json(
      { error: 'API 키를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 새 API 키 생성 (POST)
 * 요청 본문에서 이름과 사용량 제한을 받아 새 API 키를 생성
 */
export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/api-keys 요청 처리 중...');
    
    // 요청 본문 파싱
    const { name, limit } = await req.json();
    console.log('API 키 생성 요청 데이터:', { name, limit });

    // 필수 데이터 유효성 검사
    if (!name) {
      return NextResponse.json(
        { error: 'API 키 이름은 필수입니다.' },
        { status: 400 }
      );
    }

    // Supabase 클라이언트 생성 (서버 라우트 핸들러용)
    const supabaseServer = createRouteHandlerClient({ cookies });
    
    // 현재 세션 확인
    const { data: { session }, error: sessionError } = await supabaseServer.auth.getSession();
    
    if (sessionError) {
      console.error('Supabase 세션 확인 오류:', sessionError);
    }
    
    let userId = null;
    
    // Supabase 세션이 있으면 사용
    if (session?.user?.id) {
      userId = session.user.id;
      console.log('Supabase 세션에서 사용자 ID 확인:', userId);
    } else {
      // NextAuth 세션 확인 시도
      const user = await getSessionUser();
      if (user?.id) {
        userId = user.id;
        console.log('NextAuth 세션에서 사용자 ID 확인:', userId);
      }
    }
    
    // 인증 디버깅
    console.log('인증 상태:', userId ? '인증됨' : '인증되지 않음');
    
    if (!userId) {
      console.error('API 키 생성 실패: 사용자 인증 없음');
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    console.log('인증된 사용자:', userId);

    // API 키 값 생성
    const randomPart = crypto.randomBytes(16).toString('hex');
    const apiKeyValue = `flowit-${randomPart}`;

    // API 키를 데이터베이스에 저장 - RLS가 적용된 쿼리 (서비스 롤 사용)
    const { data: newApiKey, error } = await supabaseServer
      .from('api_keys')
      .insert([
        {
          name,
          key: apiKeyValue,    // key 필드에도 값 설정
          value: apiKeyValue,  // value 필드에 값 설정 (기존과 동일)
          user_id: userId,
          used: 0,  // 'usage' 대신 'used' 사용
          limit: limit || 100, // 기본 제한: 100
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('API 키 생성 중 데이터베이스 오류:', error);
      return NextResponse.json(
        { error: 'API 키를 생성하는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // used를 usage로 변환하여 클라이언트 호환성 유지
    const formattedKey = {
      ...newApiKey,
      usage: newApiKey.used,
    };

    console.log('새 API 키가 생성되었습니다:', formattedKey.id);
    return NextResponse.json(formattedKey, { status: 201 });
  } catch (error) {
    console.error('API 키 생성 오류:', error);
    return NextResponse.json(
      { error: 'API 키를 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 